import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SchemaDiagram from '../components/SchemaDiagram'

const difficultyLabel = ['', 'Easy', 'Medium', 'Hard']
const difficultyColor = ['', 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30', 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30', 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30']

function renderMarkdown(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      if (block.split('\n').some((l) => l.startsWith('- '))) {
        const items = block
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li>${l.slice(2).replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>')}</li>`)
        return `<ul class="list-disc pl-5 space-y-1">${items.join('')}</ul>`
      }
      const html = block
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
      return `<p class="mb-2">${html}</p>`
    })
    .join('')
}

function ResultTable({ columns, rows }) {
  if (!columns || columns.length === 0) return <p className="text-gray-400 dark:text-gray-500 text-sm">Нет результатов</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th key={col} className="text-left font-semibold text-gray-700 dark:text-gray-300 pb-1 pr-4">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-1 pr-4 text-gray-600 dark:text-gray-400">{cell === null ? 'NULL' : String(cell)}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="text-gray-400 dark:text-gray-500 text-sm py-2">Нет строк</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { darkMode } = useTheme()
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
  const [hintsRevealed, setHintsRevealed] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    setResult(null)
    setSubmission(null)
    setHintsRevealed(0)
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

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>
  if (!task) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Link to="/problems" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-3 inline-block">&larr; К списку</Link>

        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold dark:text-gray-100">{task.name}</h1>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[task.difficulty]}`}>
            {difficultyLabel[task.difficulty]}
          </span>
        </div>

        {task.category && (
          <span className="inline-block text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-4">
            {task.category.name}
          </span>
        )}

        <div
          className="prose prose-sm text-gray-700 dark:text-gray-300 mb-6"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(task.description) }}
        />

        <SchemaDiagram ddl={task.schema_sql} />

        {task.related_articles?.length > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Связанные статьи</h3>
            <div className="space-y-1">
              {task.related_articles.map((art) => (
                <Link
                  key={art.id}
                  to={`/theory/${art.id}`}
                  className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {art.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {task.hints?.length > 0 && (
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 mt-4">
            <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Подсказки</h3>
            <div className="space-y-2">
              {task.hints.slice(0, hintsRevealed).map((hint, i) => (
                <p key={i} className="text-sm text-yellow-800 dark:text-yellow-200">{hint}</p>
              ))}
              {hintsRevealed < task.hints.length && (
                <button
                  onClick={() => setHintsRevealed((prev) => prev + 1)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Показать подсказку {hintsRevealed + 1}
                </button>
              )}
              {hintsRevealed === task.hints.length && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Все подсказки показаны</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SQL</span>
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
            theme={darkMode ? 'vs-dark' : 'vs-light'}
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
          <div className={`rounded-lg border p-4 ${submission.is_correct ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-3">
              {submission.is_correct ? (
                <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Верно!</span>
              ) : (
                <span className="text-red-700 dark:text-red-400 font-semibold text-sm">Неверно</span>
              )}
            </div>

            {submissionError && (
              <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap mb-3">{submissionError}</pre>
            )}

            {!submission.is_correct && submissionResult && submissionExpected && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ваш результат</h4>
                  <div className="bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800 p-2">
                    <ResultTable columns={submissionResult.columns} rows={submissionResult.rows} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ожидалось</h4>
                  <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2">
                    <ResultTable columns={submissionExpected.columns} rows={submissionExpected.rows} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!submission && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 min-h-[150px]">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Результат</h3>
            {resultError && (
              <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{resultError}</pre>
            )}
            {result && !resultError && <ResultTable columns={result.columns} rows={result.rows} />}
            {!result && !resultError && (
              <p className="text-gray-400 dark:text-gray-500 text-sm">Нажмите Run для выполнения запроса или Submit для проверки</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
