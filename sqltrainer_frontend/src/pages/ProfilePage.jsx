import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/progress/'),
      api.get(`/users/${user.id}/stats/`),
    ])
      .then(([p, s]) => {
        setProgress(p)
        setStats(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="text-center text-gray-400 pt-20">Загрузка...</div>

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.username}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {progress && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Прогресс</h2>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-gray-900">{progress.solved_tasks}</span>
            <span className="text-gray-400">/ {progress.total_tasks}</span>
            <span className="text-sm text-gray-500 ml-2">задач решено</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{progress.progress_percent}%</p>
        </div>
      )}

      {stats && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Статистика</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total_submissions}</p>
              <p className="text-xs text-gray-500 mt-1">Попыток</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.correct_submissions}</p>
              <p className="text-xs text-gray-500 mt-1">Правильно</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">Точность</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
