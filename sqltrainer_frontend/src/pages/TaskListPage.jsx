import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const difficultyLabel = ['', 'Easy', 'Medium', 'Hard']
const difficultyColor = ['', 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30', 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30', 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30']

export default function TaskListPage() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [difficultyFilter, setDifficultyFilter] = useState(null)
  const [search, setSearch] = useState('')

  const debounceRef = useRef(null)

  const fetchTasks = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (difficultyFilter) params.set('difficulty', difficultyFilter)
    if (categoryFilter) params.set('category_id', categoryFilter)
    api.get(`/problems/?${params}`)
      .then((data) => { setError(''); setTasks(data) })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    Promise.all([
      api.get('/problems/'),
      api.get('/categories/'),
    ])
      .then(([t, c]) => { setTasks(t); setCategories(c) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchTasks, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, difficultyFilter, categoryFilter])

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">Задачи</h1>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setDifficultyFilter(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${!difficultyFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Любая сложность
          </button>
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${difficultyFilter === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {difficultyLabel[d]}
            </button>
          ))}
        </div>
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block" />
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${!categoryFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Все категории
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${categoryFilter === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/problems/${task.id}`}
            className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{task.name}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[task.difficulty]}`}>
                {difficultyLabel[task.difficulty]}
              </span>
            </div>
            {task.category && (
              <span className="inline-block text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-3">
                {task.category.name}
              </span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{task.description.replace(/[*#`\n]/g, ' ').slice(0, 120)}</p>
          </Link>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 pt-10">
          {search || difficultyFilter || categoryFilter ? 'Нет задач по вашему запросу' : 'Нет задач'}
        </p>
      )}
    </div>
  )
}
