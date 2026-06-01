import { useEffect, useState } from 'react'
import { api } from '../api/client'

const rankColors = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-600']

export default function LeaderboardPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/leaderboard/')
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 dark:text-gray-500 pt-20">Загрузка...</div>
  if (error) return <div className="text-center text-red-500 pt-20">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Лидерборд</h1>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 w-12">#</th>
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">Пользователь</th>
              <th className="text-right font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 w-28">Решено</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className={`px-4 py-3 font-bold text-lg ${rankColors[i] || 'text-gray-700 dark:text-gray-300'}`}>
                  {i + 1}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.username}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  {u.solved_count}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 dark:text-gray-500 py-10">
                  Пока никто не решил ни одной задачи
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
