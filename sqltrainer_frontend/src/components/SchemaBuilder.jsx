import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, Handle, Position,
  applyNodeChanges, applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import { useTheme } from '../context/ThemeContext'
import { parseDDL } from '../utils/ddlParser'

const NODE_WIDTH = 310
const _gid = { n: 0 }
function uid() { return `x${++_gid.n}${Math.random().toString(36).slice(2, 6)}` }

function newTable() {
  return {
    id: uid(),
    name: 'new_table',
    columns: [{ id: uid(), name: 'id', type: 'SERIAL', isPk: true, notNull: false, fkTarget: null }],
    rows: [],
    dataOpen: false,
  }
}

function fmtVal(v) {
  if (v === '' || v == null) return 'NULL'
  if (/^-?\d+(\.\d+)?$/.test(v)) return v
  return `'${v.replace(/'/g, "''")}'`
}

function genSQL(tables) {
  return tables.map(t => {
    const cols = t.columns.map(c => {
      let line = `    ${c.name} ${c.type}`
      if (c.isPk) line += ' PRIMARY KEY'
      if (c.notNull) line += ' NOT NULL'
      if (c.fkTarget) line += ` REFERENCES ${c.fkTarget.tableName}(${c.fkTarget.columnName})`
      return line
    })
    let sql = `CREATE TABLE ${t.name} (\n${cols.join(',\n')}\n);`

    if (t.rows && t.rows.length > 0 && t.columns.length > 0) {
      const cNames = t.columns.map(c => c.name).join(', ')
      const vals = t.rows.map(r =>
        `(${t.columns.map(c => fmtVal(r.values[c.name])).join(', ')})`
      )
      sql += `\nINSERT INTO ${t.name} (${cNames}) VALUES\n${vals.join(',\n')};`
    }
    return sql
  }).join('\n\n')
}

function buildEdges(tables, darkMode) {
  const result = []
  for (const t of tables) {
    for (const c of t.columns) {
      if (!c.fkTarget) continue
      const target = tables.find(tt => tt.name === c.fkTarget.tableName)
      if (!target) continue
      result.push({
        id: `${t.id}->${target.id}__${c.id}`,
        source: t.id,
        target: target.id,
        label: `${c.name} -> ${c.fkTarget.columnName}`,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: darkMode ? '#1f2937' : '#ffffff' },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        type: 'smoothstep',
      })
    }
  }
  return result
}

function layoutNodes(nodes) {
  if (nodes.length === 0) return nodes
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100 })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: n.data.height }))
  nodes.forEach(n => {
    const relevant = nodes.filter(other => {
      if (other.id === n.id) return false
      const cols = n.data.table.columns
      return cols.some(c => c.fkTarget && c.fkTarget.tableName === other.data.table.name)
    })
    relevant.forEach(r => g.setEdge(n.id, r.id))
  })

  dagre.layout(g)

  return nodes.map(n => {
    const pos = g.node(n.id)
    if (!pos) return n
    return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - pos.height / 2 } }
  })
}

function fkOptions(allTables, currentTableId) {
  const opts = [{ value: '', label: '\u2014' }]
  for (const t of allTables) {
    if (t.id === currentTableId) continue
    for (const c of t.columns) {
      const v = `${t.name}.${c.name}`
      opts.push({ value: v, label: v })
    }
  }
  return opts
}

function parseInsertRows(sql, tableName, colNames) {
  const rows = []
  const esc = /''/g
  const token = (s, i) => {
    if (s[i] === "'") {
      let j = i + 1
      while (j < s.length) {
        if (s[j] === "'" && s[j + 1] === "'") j += 2
        else if (s[j] === "'") break
        else j++
      }
      return [s.slice(i + 1, j).replace(esc, "'"), j + 1]
    }
    let j = i
    while (j < s.length && s[j] !== ',' && s[j] !== ')' && s[j] !== '(') j++
    return [s.slice(i, j).trim(), j]
  }

  const re = new RegExp(
    `INSERT\\s+INTO\\s+${tableName}\\s*(?:\\([^)]*\\))?\\s*VALUES\\s*`,
    'gi'
  )
  let m
  while ((m = re.exec(sql)) !== null) {
    let i = re.lastIndex
    while (i < sql.length && sql[i] !== '(') i++
    if (i >= sql.length) break

    const groups = []
    while (i < sql.length) {
      while (i < sql.length && sql[i] !== '(') i++
      if (i >= sql.length || sql[i] !== '(') break
      const start = i
      let depth = 0
      i++
      while (i < sql.length) {
        if (sql[i] === "'") {
          i += 2
          while (i < sql.length && !(sql[i] === "'" && sql[i - 1] !== '\\\\')) {
            if (sql[i] === "'" && sql[i + 1] === "'") i += 2
            else i++
          }
          i++
          continue
        }
        if (sql[i] === '(') depth++
        else if (sql[i] === ')') {
          if (depth === 0) { groups.push(sql.slice(start, i + 1)); i++; break }
          depth--
        }
        i++
      }
      while (i < sql.length && (sql[i] === ' ' || sql[i] === '\\n' || sql[i] === '\\r' || sql[i] === '\\t')) i++
      if (i >= sql.length || sql[i] !== ',') break
      i++
    }

    for (const g of groups) {
      const inner = g.slice(1, -1)
      const vals = []
      let pos = 0
      while (pos < inner.length) {
        while (pos < inner.length && (inner[pos] === ' ' || inner[pos] === ',')) pos++
        if (pos >= inner.length) break
        const [v, next] = token(inner, pos)
        vals.push(v)
        pos = next
      }
      const values = {}
      colNames.forEach((cn, idx) => { values[cn] = vals[idx] !== undefined ? vals[idx] : '' })
      if (Object.values(values).some(v => v !== '')) {
        rows.push({ id: uid(), values })
      }
    }
  }
  return rows
}

function loadFromSQL(ddl) {
  const parsed = parseDDL(ddl)
  if (parsed.length === 0) return []
  return parsed.map(t => ({
    id: uid(),
    name: t.name,
    columns: t.columns.map(c => ({
      id: uid(),
      name: c.name,
      type: c.type,
      isPk: c.isPk,
      notNull: c.notNull,
      fkTarget: c.references ? { tableName: c.references.table, columnName: c.references.column } : null,
    })),
    rows: parseInsertRows(ddl, t.name, t.columns.map(c => c.name)),
    dataOpen: false,
  }))
}

function EditableTableNode({ data }) {
  const {
    table, allTables,
    onUpdateTable, onUpdateColumn, onDeleteTable, onDeleteColumn, onAddColumn,
    onAddRow, onUpdateRow, onDeleteRow, onToggleData,
  } = data
  const fkList = useMemo(() => fkOptions(allTables, table.id), [allTables, table.id])

  const setFk = (colId, raw) => {
    if (!raw) { onUpdateColumn(table.id, colId, { fkTarget: null }); return }
    const dot = raw.indexOf('.')
    onUpdateColumn(table.id, colId, {
      fkTarget: { tableName: raw.slice(0, dot), columnName: raw.slice(dot + 1) },
    })
  }

  return (
    <div
      className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-md text-xs"
      style={{ width: NODE_WIDTH }}
    >
      <div className="flex items-center gap-1 bg-indigo-500 dark:bg-indigo-600 text-white rounded-t-md px-2 py-1.5">
        <input
          className="flex-1 bg-transparent font-bold text-sm outline-none placeholder:text-white/60"
          value={table.name}
          placeholder="table_name"
          onChange={e => onUpdateTable(table.id, { name: e.target.value })}
        />
        <button
          className="text-white/70 hover:text-white text-lg leading-none px-1"
          title="Delete table"
          onClick={() => onDeleteTable(table.id)}
        >\u00d7</button>
      </div>

      <div className="font-mono">
        {table.columns.map(col => (
          <div
            key={col.id}
            className="flex items-center gap-1 px-2 py-1 border-b border-gray-100 dark:border-gray-700"
          >
            <input
              className="w-[68px] flex-shrink-0 bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-indigo-400"
              value={col.name}
              placeholder="col"
              onChange={e => onUpdateColumn(table.id, col.id, { name: e.target.value })}
            />
            <input
              className="w-[80px] flex-shrink-0 bg-transparent text-gray-500 dark:text-gray-400 outline-none border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-indigo-400"
              value={col.type}
              placeholder="TYPE"
              onChange={e => onUpdateColumn(table.id, col.id, { type: e.target.value })}
            />
            <label className="flex items-center gap-0.5 text-[9px] text-amber-600 dark:text-amber-400 cursor-pointer" title="Primary Key">
              <input type="checkbox" className="w-2.5 h-2.5 accent-amber-500" checked={col.isPk} onChange={e => onUpdateColumn(table.id, col.id, { isPk: e.target.checked })} />PK
            </label>
            <label className="flex items-center gap-0.5 text-[9px] text-red-400 cursor-pointer" title="NOT NULL">
              <input type="checkbox" className="w-2.5 h-2.5 accent-red-400" checked={col.notNull} onChange={e => onUpdateColumn(table.id, col.id, { notNull: e.target.checked })} />NN
            </label>
            <select
              className="w-[68px] flex-shrink-0 bg-transparent text-gray-600 dark:text-gray-400 text-[9px] outline-none border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-indigo-400 cursor-pointer"
              value={col.fkTarget ? `${col.fkTarget.tableName}.${col.fkTarget.columnName}` : ''}
              onChange={e => setFk(col.id, e.target.value)}
            >
              {fkList.map(o => <option key={o.value} value={o.value} className="dark:bg-gray-800">{o.label}</option>)}
            </select>
            <button
              className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-sm leading-none flex-shrink-0"
              title="Delete column"
              onClick={() => onDeleteColumn(table.id, col.id)}
            >x</button>
          </div>
        ))}
      </div>

      <button
        className="w-full text-center text-[10px] text-indigo-500 dark:text-indigo-400 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
        onClick={() => onAddColumn(table.id)}
      >+ Column</button>

      <div className="border-t border-dashed border-gray-200 dark:border-gray-700">
        <button
          className="w-full text-center text-[10px] text-gray-500 dark:text-gray-400 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          onClick={() => onToggleData(table.id)}
        >{table.dataOpen ? '\u25b2 Hide data' : '\u25bc Data'} {table.rows?.length > 0 ? `(${table.rows.length})` : ''}</button>

        {table.dataOpen && (
          <div className="font-mono border-t border-gray-100 dark:border-gray-700 max-h-[180px] overflow-y-auto">
            {table.rows.map(row => (
              <div key={row.id} className="flex items-center gap-1 px-2 py-1 border-b border-gray-50 dark:border-gray-800 last:border-b-0">
                {table.columns.map(col => (
                  <input
                    key={col.id}
                    className="w-[60px] flex-shrink-0 bg-transparent text-gray-700 dark:text-gray-300 outline-none border-b border-dotted border-gray-200 dark:border-gray-600 focus:border-indigo-400 text-[10px]"
                    value={row.values[col.name] ?? ''}
                    placeholder={col.isPk ? 'auto' : ''}
                    onChange={e => onUpdateRow(table.id, row.id, col.name, e.target.value)}
                  />
                ))}
                <button
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-sm leading-none flex-shrink-0 ml-auto"
                  title="Delete row"
                  onClick={() => onDeleteRow(table.id, row.id)}
                >x</button>
              </div>
            ))}
            <button
              className="w-full text-center text-[9px] text-indigo-400 dark:text-indigo-400 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
              onClick={() => onAddRow(table.id)}
            >+ Row</button>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!border-indigo-400 !bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} className="!border-indigo-400 !bg-indigo-400" />
    </div>
  )
}

const nodeTypes = { tableBuilder: EditableTableNode }

export default function SchemaBuilder({ value, onChange }) {
  const { darkMode } = useTheme()
  const posRef = useRef({})
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const cbRef = useRef({})

  const [tables, setTables] = useState(() => value ? loadFromSQL(value) : [])
  const [layoutVer, setLayoutVer] = useState(0)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  useEffect(() => {
    if (!value) return
    const loaded = loadFromSQL(value)
    if (loaded.length > 0) setTables(loaded)
  }, [])

  useEffect(() => {
    if (tables.length === 0) { setNodes([]); setEdges([]); return }
    setNodes(prev => {
      const byId = {}
      tables.forEach(t => { byId[t.id] = t })
      const next = prev.map(n => {
        const t = byId[n.id]
        if (!t) return n
        return {
          ...n,
          data: {
            table: t,
            allTables: tables,
            ...cbRef.current,
          },
        }
      })
      const existingIds = new Set(prev.map(n => n.id))
      for (const t of tables) {
        if (!existingIds.has(t.id)) {
          next.push({
            id: t.id,
            type: 'tableBuilder',
            data: {
              table: t,
              allTables: tables,
              ...cbRef.current,
            },
            position: posRef.current[t.id] || { x: 0, y: 0 },
          })
        }
      }
      return next
    })
    setEdges(buildEdges(tables, darkMode))
  }, [tables, darkMode])

  useEffect(() => {
    if (layoutVer === 0) return
    setNodes(prev => {
      const laid = layoutNodes(prev)
      laid.forEach(n => { posRef.current[n.id] = n.position })
      return laid
    })
  }, [layoutVer])

  useEffect(() => {
    onChangeRef.current(tables.length > 0 ? genSQL(tables) : '')
  }, [tables])

  const onNodesChange = useCallback(changes => {
    setNodes(prev => {
      const next = applyNodeChanges(changes, prev)
      next.forEach(n => { posRef.current[n.id] = n.position })
      return next
    })
  }, [])

  const onEdgesChange = useCallback(changes => {
    setEdges(prev => applyEdgeChanges(changes, prev))
  }, [])

  const onUpdateTable = useCallback((id, updates) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const onDeleteTable = useCallback(id => {
    setTables(prev => {
      const deletedName = prev.find(t => t.id === id)?.name
      const next = prev.filter(t => t.id !== id)
      for (const t of next) {
        t.columns.forEach(c => {
          if (c.fkTarget && c.fkTarget.tableName === deletedName) c.fkTarget = null
        })
      }
      return next
    })
    setNodes(prev => prev.filter(n => n.id !== id))
    setLayoutVer(v => v + 1)
  }, [])

  const onAddColumn = useCallback(tableId => {
    setTables(prev => prev.map(t =>
      t.id === tableId
        ? { ...t, columns: [...t.columns, { id: uid(), name: 'col', type: 'INTEGER', isPk: false, notNull: false, fkTarget: null }] }
        : t
    ))
  }, [])

  const onDeleteColumn = useCallback((tableId, colId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, columns: t.columns.filter(c => c.id !== colId) } : t))
  }, [])

  const onUpdateColumn = useCallback((tableId, colId, updates) => {
    setTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, columns: t.columns.map(c => c.id === colId ? { ...c, ...updates } : c) } : t
    ))
  }, [])

  const onToggleData = useCallback(tableId => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, dataOpen: !t.dataOpen } : t))
  }, [])

  const onAddRow = useCallback(tableId => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t
      const values = {}
      t.columns.forEach(c => { values[c.name] = '' })
      return { ...t, rows: [...t.rows, { id: uid(), values }], dataOpen: true }
    }))
  }, [])

  const onUpdateRow = useCallback((tableId, rowId, colName, val) => {
    setTables(prev => prev.map(t =>
      t.id !== tableId ? t
        : { ...t, rows: t.rows.map(r => r.id === rowId ? { ...r, values: { ...r.values, [colName]: val } } : r) }
    ))
  }, [])

  const onDeleteRow = useCallback((tableId, rowId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, rows: t.rows.filter(r => r.id !== rowId) } : t))
  }, [])

  const addTable = useCallback(() => {
    const t = newTable()
    setTables(prev => [...prev, t])
    setNodes(prev => [...prev, {
      id: t.id,
      type: 'tableBuilder',
      data: { table: t, allTables: [...prev.map(n => n.data.table), t], ...cbRef.current },
      position: { x: 0, y: 0 },
    }])
    setLayoutVer(v => v + 1)
  }, [])

  const handleGenerate = useCallback(() => {
    onChange(tables.length > 0 ? genSQL(tables) : '')
  }, [tables, onChange])

  const handleImport = useCallback(() => {
    const sql = window.prompt('Paste SQL CREATE TABLE statements:')
    if (!sql) return
    const loaded = loadFromSQL(sql)
    if (loaded.length === 0) { alert('Could not parse any CREATE TABLE from the input.'); return }
    setTables(loaded)
    posRef.current = {}
    setNodes(loaded.map(t => ({
      id: t.id,
      type: 'tableBuilder',
      data: { table: t, allTables: loaded, ...cbRef.current },
      position: { x: 0, y: 0 },
    })))
    setLayoutVer(v => v + 1)
  }, [])

  const clearAll = useCallback(() => {
    if (tables.length === 0) return
    if (!window.confirm('Clear all tables?')) return
    setTables([])
    setNodes([])
    setEdges([])
    posRef.current = {}
  }, [tables])

  cbRef.current = {
    onUpdateTable, onDeleteTable, onAddColumn,
    onUpdateColumn, onDeleteColumn,
    onAddRow, onUpdateRow, onDeleteRow, onToggleData,
  }

  const colCount = tables.reduce((s, t) => s + t.columns.length, 0)
  const rowCount = tables.reduce((s, t) => s + (t.rows?.length || 0), 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={addTable} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">+ Table</button>
        <button onClick={handleGenerate} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Generate SQL</button>
        <button onClick={handleImport} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Import SQL</button>
        <button onClick={clearAll} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition">Clear</button>
        {tables.length > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">{colCount} columns, {rowCount} rows in {tables.length} tables</span>
        )}
      </div>

      {tables.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No tables yet. Click <strong>+ Table</strong> to build your schema, or <strong>Import SQL</strong> to load from existing DDL.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <div className="w-full" style={{ height: Math.max(300, Math.min(700, tables.length * 280)) }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color={darkMode ? '#374151' : '#d1d5db'} gap={20} />
              <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700" />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  )
}
