import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function TheoryListPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/articles/')
      .then((data) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Теория</h1>

      {articles.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 py-20">
          <p>Статьи пока не добавлены</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/theory/${article.id}`}
              className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{article.title}</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-4">
                  {new Date(article.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {article.category && (
                <span className="inline-block text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-3">
                  {article.category.name}
                </span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                {article.content.replace(/[#*`\n]/g, ' ').slice(0, 200)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
