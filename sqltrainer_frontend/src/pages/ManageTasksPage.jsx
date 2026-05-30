import { useEffect, useState } from 'react'
import { api } from '../api/client'

const empty = { name: '', description: '', expected_query: '', schema_sql: '', category_id: 1, difficulty: 1 }

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => Promise.all([
    api.get('/problems/'),
    api.get('/categories/'),
  ]).then(([t, c]) => { setTasks(t); setCategories(c) })

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const openNew = () => { setEditing('new'); setForm(empty); setError('') }
  const openEdit = (t) => {
    setEditing(t.id)
    setForm({ name: t.name, description: t.description, expected_query: t.expected_query || '', schema_sql: t.schema_sql || '', category_id: t.category?.id || 1, difficulty: t.difficulty })
    setError('')
  }
  const cancel = () => { setEditing(null); setForm(empty); setError('') }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      if (editing === 'new') {
        await api.post('/problems/', form)
      } else {
        await api.patch(`/problems/${editing}/`, form)
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
    if (!confirm('Удалить задачу?')) return
    try {
      await api.delete(`/problems/${id}/`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-center text-gray-400 pt-20">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Управление задачами</h1>
        <button onClick={openNew} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">+ Новая задача</button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {(editing) && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editing === 'new' ? 'Новая задача' : 'Редактировать задачу'}</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Название</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Категория</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.category_id} onChange={(e) => setForm({...form, category_id: Number(e.target.value)})}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Сложность</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.difficulty} onChange={(e) => setForm({...form, difficulty: Number(e.target.value)})}>
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Описание</label>
              <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SQL схема</label>
              <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.schema_sql} onChange={(e) => setForm({...form, schema_sql: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ожидаемый запрос</label>
              <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.expected_query} onChange={(e) => setForm({...form, expected_query: e.target.value})} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={cancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left font-semibold text-gray-500 px-4 py-3">ID</th>
              <th className="text-left font-semibold text-gray-500 px-4 py-3">Название</th>
              <th className="text-left font-semibold text-gray-500 px-4 py-3">Категория</th>
              <th className="text-left font-semibold text-gray-500 px-4 py-3">Сложность</th>
              <th className="text-right font-semibold text-gray-500 px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{t.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-600">{t.category?.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.difficulty === 1 ? 'text-green-600 bg-green-50' : t.difficulty === 2 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'}`}>
                    {['', 'Easy', 'Medium', 'Hard'][t.difficulty]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="text-sm text-indigo-600 hover:underline mr-3">Ред.</button>
                  <button onClick={() => remove(t.id)} className="text-sm text-red-500 hover:underline">Удал.</button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-10">Нет задач</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
