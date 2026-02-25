import './App.css'
import { NavLink, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import MapsPage from '@/pages/MapsPage'

function App() {
  return (
    <div className="min-h-full bg-slate-100 p-4">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white p-4 shadow-sm">
        <header className="mb-4 flex items-center justify-between border-b pb-3">
          <h1 className="text-2xl font-bold">Sun Forecast</h1>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'font-semibold' : 'text-muted-foreground')}>
              Accueil
            </NavLink>
            <NavLink
              to="/maps"
              className={({ isActive }) => (isActive ? 'font-semibold' : 'text-muted-foreground')}
            >
              Maps
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/maps" element={<MapsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
