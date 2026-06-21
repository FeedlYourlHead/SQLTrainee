export function parseDDL(ddl) {
  const tables = []
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi
  let match

  while ((match = tableRegex.exec(ddl)) !== null) {
    const tableName = match[1]
    const body = match[2]
    const columns = []
    const foreignKeys = []

    const lines = splitColumns(body)

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const fkMatch = trimmed.match(
        /^(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/i
      )
      if (fkMatch) {
        const cols = fkMatch[1].split(',').map(c => c.trim())
        foreignKeys.push({
          columns: cols,
          references: { table: fkMatch[2], column: fkMatch[3] },
        })
        continue
      }

      const pkMatch = trimmed.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i)
      if (pkMatch) {
        const pkCols = pkMatch[1].split(',').map(c => c.trim())
        for (const col of columns) {
          if (pkCols.includes(col.name)) {
            col.isPk = true
          }
        }
        continue
      }

      const colMatch = trimmed.match(
        /^(\w+)\s+(\w+(?:\s*\([^)]*\))?(?:\s*\[\])?)(.*)$/i
      )
      if (colMatch) {
        let colName = colMatch[1]
        let colType = colMatch[2]
        const rest = colMatch[3].toUpperCase()

        let isPk = rest.includes('PRIMARY KEY')
        const notNull = rest.includes('NOT NULL')
        const unique = rest.includes('UNIQUE')
        const hasDefault = rest.includes('DEFAULT')

        const refMatch = colMatch[3].match(/REFERENCES\s+(\w+)\s*\(([^)]+)\)/i)
        let references = null
        if (refMatch) {
          references = { table: refMatch[1], column: refMatch[2] }
        }

        columns.push({
          name: colName,
          type: colType,
          isPk,
          notNull,
          unique,
          hasDefault,
          references,
        })
      }
    }

    tables.push({ name: tableName, columns, foreignKeys })
  }

  return tables
}

function splitColumns(body) {
  const lines = []
  let current = ''
  let depth = 0

  for (const ch of body) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      lines.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current)

  return lines
}
