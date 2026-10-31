
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  BrainCircuit,
  ArrowLeft,
  ArrowRight,
  Home,
  MessageSquare,
  GitCompareArrows,
  Compass,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function NotFound() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen flex flex-col bg-[#202E40] text-[#F1F5FA]">
      <header className="flex items-center justify-between px-6 sm:px-12 py-5 border-b border-[#465B72] bg-[#243449]">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="w-10 h-10 rounded-xl bg-[#344F69] flex items-center justify-center text-[#75B9E7]">
            <BrainCircuit size={22} />
          </span>
          <span className="text-xl font-semibold text-[#F1F5FA]">
            AI <span className="text-[#75B9E7]">Nexus</span>
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-xl border border-[#465B72] bg-[#34475D] flex items-center justify-center text-[#C0CCDA] hover:text-[#75B9E7] transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#526A82 1px, transparent 1px), linear-gradient(90deg, #526A82 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
          }}
        />

        <div className="relative z-10 w-full max-w-2xl text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#526B83] bg-[#34475D] text-[#75B9E7]">
            <Compass size={30} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[4px] text-[#E99555]">
            Page not found
          </p>

          <h1 className="mt-4 text-[100px] sm:text-[150px] font-extrabold leading-none tracking-[-8px] text-[#75B9E7]">
            404
          </h1>

          <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-[#F1F5FA]">
            Looks like you've lost your way.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-7 text-[#C0CCDA]">
            The page you're looking for doesn't exist, may have been moved,
            or the link might be incorrect. Let's get you back on track.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-xl bg-[#398BC5] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#2F79AE]"
            >
              <Home size={17} />
              Back to Home
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl border border-[#526B83] bg-[#34475D] px-6 py-3 text-sm font-semibold text-[#F1F5FA] no-underline transition hover:bg-[#3B5068]"
            >
              <MessageSquare size={17} />
              New Chat
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-[#526B83] bg-[#34475D] px-6 py-3 text-sm font-semibold text-[#F1F5FA] no-underline transition hover:bg-[#3B5068]"
            >
              <GitCompareArrows size={17} />
              Compare Models
            </Link>
          </div>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 text-sm text-[#9AABC0] no-underline transition hover:text-[#75B9E7]"
          >
            <ArrowLeft size={15} />
            Return to website
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#465B72] bg-[#243449] px-6 py-5 text-center text-xs text-[#9AABC0]">
        © 2026 AI Nexus. Built for smarter AI experiences.
      </footer>
    </main>
  )
}
