import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskListPage from './pages/TaskListPage'
import TaskDetailPage from './pages/TaskDetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ManageTasksPage from './pages/ManageTasksPage'
import SubmissionsPage from './pages/SubmissionsPage'
import TheoryListPage from './pages/TheoryListPage'
import TheoryDetailPage from './pages/TheoryDetailPage'
import ManageTheoryPage from './pages/ManageTheoryPage'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <NavBar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/problems" element={<TaskListPage />} />
            <Route path="/problems/:id" element={<TaskDetailPage />} />
            <Route path="/theory" element={<TheoryListPage />} />
            <Route path="/theory/:id" element={<TheoryDetailPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/manage" element={<ProtectedRoute><ManageTasksPage /></ProtectedRoute>} />
            <Route path="/manage-theory" element={<ProtectedRoute><ManageTheoryPage /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute><SubmissionsPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
