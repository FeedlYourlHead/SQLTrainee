import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const difficultyLabel = ['', 'Easy', 'Medium', 'Hard']
const difficultyColor = ['', 'text-green-600 bg-green-50', 'text-yellow-600 bg-yellow-50', 'text-red-600 bg-red-50']

export default function TaskListPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/problems/')
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(tasks.map((t) => t.category?.name).filter(Boolean))]
  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.category?.name === filter)

  if (loading) return <div className="text-center text-gray-400 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Задачи</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((task) => (
          <Link
            key={task.id}
            to={`/problems/${task.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-semibold text-gray-900">{task.name}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[task.difficulty]}`}>
                {difficultyLabel[task.difficulty]}
              </span>
            </div>
            {task.category && (
              <span className="inline-block text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-3">
                {task.category.name}
              </span>
            )}
            <p className="text-sm text-gray-500 line-clamp-3">{task.description.replace(/[*#`\n]/g, ' ').slice(0, 120)}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 pt-10">Нет задач в этой категории</p>
      )}
    </div>
  )
}
