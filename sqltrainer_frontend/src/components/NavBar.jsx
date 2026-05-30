import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/problems', label: 'Задачи' },
  { to: '/leaderboard', label: 'Лидерборд' },
]

export default function NavBar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          SQL Trainer
        </Link>
        <div className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition ${
                pathname.startsWith(link.to)
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              {user.is_staff && (
                <Link
                  to="/manage"
                  className={`text-sm font-medium transition ${
                    pathname.startsWith('/manage')
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Управление
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-indigo-600 transition"
              >
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
