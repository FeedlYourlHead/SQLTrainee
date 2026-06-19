import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get('/submissions/')
      .then((data) => setSubmissions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">История отправок</h1>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 py-20">
          <p className="mb-2">У вас пока нет отправок</p>
          <Link to="/problems" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            Перейти к задачам
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition"
            >
              <button
                onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${sub.is_correct ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-40 shrink-0">
                  {formatDate(sub.created_at)}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                  {sub.task?.name || 'Задача удалена'}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  sub.is_correct
                    ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                    : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                }`}>
                  {sub.is_correct ? 'Верно' : 'Неверно'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expandedId === sub.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === sub.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ваш запрос</p>
                    <pre className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono">{sub.user_query}</pre>
                  </div>
                  {sub.error_message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ошибка</p>
                      <pre className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-3 overflow-x-auto whitespace-pre-wrap">{sub.error_message}</pre>
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <Link
                      to={`/problems/${sub.task?.id}`}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Открыть задачу
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
