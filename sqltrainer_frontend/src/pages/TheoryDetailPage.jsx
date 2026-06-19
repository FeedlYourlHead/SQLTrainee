import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../api/client'

export default function TheoryDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/articles/${id}/`)
      .then((data) => setArticle(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>
  if (!article) return null

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/theory"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад к теории
      </Link>

      <article className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {article.category && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
              {article.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(article.created_at).toLocaleDateString('ru-RU')}
          </span>
          {article.updated_at !== article.created_at && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              обновлено {new Date(article.updated_at).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{article.title}</h1>

        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {article.related_tasks?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Связанные задачи
            </h2>
            <div className="space-y-2">
              {article.related_tasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/problems/${t.id}`}
                  className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
