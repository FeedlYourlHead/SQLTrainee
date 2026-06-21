import { useMemo } from 'react'
import { ReactFlow, Background, Controls, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import { useTheme } from '../context/ThemeContext'
import { parseDDL } from '../utils/ddlParser'

const NODE_WIDTH = 220
const HEADER_HEIGHT = 36
const ROW_HEIGHT = 28

function calcNodeHeight(colCount) {
  return HEADER_HEIGHT + colCount * ROW_HEIGHT + 4
}

function TableNode({ data }) {
  return (
    <div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-md" style={{ width: NODE_WIDTH }}>
      <div className="bg-indigo-500 dark:bg-indigo-600 text-white font-bold px-3 py-2 rounded-t-md text-sm leading-tight select-none">
        {data.label}
      </div>
      <div className="text-xs font-mono">
        {data.columns.map((col, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <span className="w-4 text-center flex-shrink-0 text-[11px]">
              {col.isPk ? '\u{1F511}' : ''}
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {col.name}
            </span>
            {col.notNull && <span className="text-red-400 dark:text-red-400 font-bold flex-shrink-0">*</span>}
            <span className="text-gray-400 dark:text-gray-500 ml-auto truncate flex-shrink-0 max-w-[90px] text-right">
              {col.type}
            </span>
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Top} className="!border-indigo-400 !bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} className="!border-indigo-400 !bg-indigo-400" />
    </div>
  )
}

const nodeTypes = { table: TableNode }

function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 90 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: node.data.height })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - pos.height / 2,
      },
    }
  })
}

export default function SchemaDiagram({ ddl }) {
  const { darkMode } = useTheme()

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const tables = parseDDL(ddl)
    if (tables.length === 0) return { nodes: [], edges: [] }

    const nodes = tables.map((t) => ({
      id: t.name,
      type: 'table',
      data: {
        label: t.name,
        columns: t.columns,
        height: calcNodeHeight(t.columns.length),
      },
      position: { x: 0, y: 0 },
    }))

    const edgeSet = new Set()
    const edges = []

    for (const t of tables) {
      for (const fk of t.foreignKeys) {
        const key = `${t.name}->${fk.references.table}`
        if (!edgeSet.has(key)) {
          edgeSet.add(key)
          edges.push({
            id: key,
            source: t.name,
            target: fk.references.table,
            label: fk.columns.join(', '),
            style: { stroke: '#6366f1', strokeWidth: 2 },
            labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: darkMode ? '#1f2937' : '#ffffff' },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            type: 'smoothstep',
          })
        }
      }

      for (const col of t.columns) {
        if (col.references) {
          const key = `${t.name}->${col.references.table}`
          if (!edgeSet.has(key)) {
            edgeSet.add(key)
            edges.push({
              id: key,
              source: t.name,
              target: col.references.table,
              label: `${col.name} -> ${col.references.column}`,
              style: { stroke: '#6366f1', strokeWidth: 2 },
              labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 11 },
              labelBgStyle: { fill: darkMode ? '#1f2937' : '#ffffff' },
              labelBgPadding: [4, 2],
              labelBgBorderRadius: 4,
              type: 'smoothstep',
            })
          }
        }
      }
    }

    const layouted = getLayoutedElements(nodes, edges)
    return { nodes: layouted, edges }
  }, [ddl, darkMode])

  if (layoutedNodes.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-400 dark:text-gray-500">
        Не удалось разобрать схему
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" style={{ height: 360 }}>
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={darkMode ? '#374151' : '#d1d5db'} gap={20} />
        <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700" />
      </ReactFlow>
    </div>
  )
}
