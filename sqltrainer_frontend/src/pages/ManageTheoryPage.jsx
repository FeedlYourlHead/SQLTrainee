import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../api/client'

const empty = { title: '', content: '', category_id: null, order: 0 }

export default function ManageTheoryPage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const load = () => Promise.all([
    api.get('/articles/'),
    api.get('/categories/'),
  ]).then(([a, c]) => { setArticles(a); setCategories(c) })

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const openNew = () => { setEditing('new'); setForm(empty); setPreview(false); setError('') }
  const openEdit = (a) => {
    setEditing(a.id)
    setForm({ title: a.title, content: a.content, category_id: a.category?.id || null, order: a.order })
    setPreview(false)
    setError('')
  }
  const cancel = () => { setEditing(null); setForm(empty); setPreview(false); setError('') }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, category_id: form.category_id || null }
      if (editing === 'new') {
        await api.post('/articles/', payload)
      } else {
        await api.patch(`/articles/${editing}/`, payload)
      }
      await load()
      cancel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Удалить статью?')) return
    try {
      await api.delete(`/articles/${id}/`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">Управление теорией</h1>
        <button onClick={openNew} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">+ Новая статья</button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {editing && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 dark:text-gray-100">{editing === 'new' ? 'Новая статья' : 'Редактировать статью'}</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Название</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Категория</label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.category_id || ''} onChange={(e) => setForm({...form, category_id: e.target.value ? Number(e.target.value) : null})}>
                  <option value="">— без категории —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Порядок</label>
                <input type="number" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.order} onChange={(e) => setForm({...form, order: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${!preview ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Редактор
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${preview ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  Предпросмотр
                </button>
              </div>
              {preview ? (
                <div className="min-h-[260px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content || '*Нет содержимого*'}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  rows={12}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Markdown-разметка поддерживается: **жирный**, *курсив*, `код`, ![alt](url) и т.д."
                />
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={cancel} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">ID</th>
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Название</th>
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Категория</th>
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Порядок</th>
              <th className="text-right font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{a.title}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.category?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.order}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(a)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mr-3">Ред.</button>
                  <button onClick={() => remove(a.id)} className="text-sm text-red-500 dark:text-red-400 hover:underline">Удал.</button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-10">Нет статей</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
