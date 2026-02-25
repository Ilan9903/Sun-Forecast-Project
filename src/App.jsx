import './App.css'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home, Map } from 'lucide-react'
import HomePage from '@/pages/HomePage'
import MapsPage from '@/pages/MapsPage'

function App() {
  return (
    <div className="min-h-full bg-background p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-primary p-4 text-primary-foreground sm:p-6">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Sun Forecast</h1>
          <nav className="flex gap-2">
            <Button asChild size="sm" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-primary-foreground text-primary' : 'text-primary-foreground'
                  )
                }
              >
                <Home className="h-4 w-4" />
                Accueil
              </NavLink>
            </Button>
            <Button asChild size="sm" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
              <NavLink
                to="/maps"
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-primary-foreground text-primary' : 'text-primary-foreground'
                  )
                }
              >
                <Map className="h-4 w-4" />
                Maps
              </NavLink>
            </Button>
          </nav>
        </header>

        <div className="rounded-xl bg-primary-foreground/10 p-4 sm:p-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/maps" element={<MapsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
