import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const difficultyLabel = ['', 'Easy', 'Medium', 'Hard']
const difficultyColor = ['', 'text-green-600 bg-green-50', 'text-yellow-600 bg-yellow-50', 'text-red-600 bg-red-50']

function renderMarkdown(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      if (block.split('\n').some((l) => l.startsWith('- '))) {
        const items = block
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li>${l.slice(2).replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')}</li>`)
        return `<ul class="list-disc pl-5 space-y-1">${items.join('')}</ul>`
      }
      const html = block
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
      return `<p class="mb-2">${html}</p>`
    })
    .join('')
}

function ResultTable({ columns, rows }) {
  if (!columns || columns.length === 0) return <p className="text-gray-400 text-sm">Нет результатов</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th key={col} className="text-left font-semibold text-gray-700 pb-1 pr-4">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-1 pr-4 text-gray-600">{cell === null ? 'NULL' : String(cell)}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="text-gray-400 text-sm py-2">Нет строк</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [resultError, setResultError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submissionExpected, setSubmissionExpected] = useState(null)
  const [submissionError, setSubmissionError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setResult(null)
    setSubmission(null)
    api.get(`/problems/${id}/`)
      .then((t) => {
        setTask(t)
        setQuery(t.expected_query || '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    setResultError('')
    try {
      const data = await api.post(`/problems/${id}/run/`, { user_query: query })
      if (data.error) {
        setResultError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setResultError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmission(null)
    setSubmissionResult(null)
    setSubmissionExpected(null)
    setSubmissionError('')
    try {
      const data = await api.post(`/problems/${id}/submit/`, { user_query: query })
      setSubmission(data.submission)
      setSubmissionResult(data.result)
      setSubmissionExpected(data.expected)
    } catch (err) {
      setSubmissionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center text-gray-400 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>
  if (!task) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Link to="/problems" className="text-sm text-indigo-600 hover:underline mb-3 inline-block">&larr; К списку</Link>

        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold">{task.name}</h1>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[task.difficulty]}`}>
            {difficultyLabel[task.difficulty]}
          </span>
        </div>

        {task.category && (
          <span className="inline-block text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-4">
            {task.category.name}
          </span>
        )}

        <div
          className="prose prose-sm text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(task.description) }}
        />

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Схема таблицы</h3>
          <pre className="text-sm text-gray-600 overflow-x-auto whitespace-pre-wrap">{task.schema_sql}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">SQL</span>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={running}
                className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {running ? 'Выполнение...' : 'Run'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !user}
                className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                title={!user ? 'Войдите для отправки' : ''}
              >
                {submitting ? 'Проверка...' : 'Submit'}
              </button>
            </div>
          </div>
          <Editor
            height="200px"
            defaultLanguage="sql"
            theme="vs-light"
            value={query}
            onChange={(v) => setQuery(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              padding: { top: 8 },
            }}
          />
        </div>

        {submission && (
          <div className={`rounded-lg border p-4 ${submission.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              {submission.is_correct ? (
                <span className="text-green-700 font-semibold text-sm">Верно!</span>
              ) : (
                <span className="text-red-700 font-semibold text-sm">Неверно</span>
              )}
            </div>

            {submissionError && (
              <pre className="text-sm text-red-600 whitespace-pre-wrap mb-3">{submissionError}</pre>
            )}

            {!submission.is_correct && submissionResult && submissionExpected && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ваш результат</h4>
                  <div className="bg-white rounded border border-red-200 p-2">
                    <ResultTable columns={submissionResult.columns} rows={submissionResult.rows} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ожидалось</h4>
                  <div className="bg-white rounded border border-gray-200 p-2">
                    <ResultTable columns={submissionExpected.columns} rows={submissionExpected.rows} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!submission && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 min-h-[150px]">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Результат</h3>
            {resultError && (
              <pre className="text-sm text-red-600 whitespace-pre-wrap">{resultError}</pre>
            )}
            {result && !resultError && <ResultTable columns={result.columns} rows={result.rows} />}
            {!result && !resultError && (
              <p className="text-gray-400 text-sm">Нажмите Run для выполнения запроса или Submit для проверки</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
