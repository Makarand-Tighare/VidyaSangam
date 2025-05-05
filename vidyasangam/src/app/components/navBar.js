'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkLoginStatus = () => {
      const authToken = localStorage.getItem("authToken")
      const adminStatus = localStorage.getItem("isAdmin") === "true"
      setIsLoggedIn(!!authToken)
      setIsAdmin(adminStatus)
    }

    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)

    return () => {
      window.removeEventListener('storage', checkLoginStatus)
    }
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("refreshToken")
    setIsLoggedIn(false)
    setIsAdmin(false)
    router.push("/")
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <nav className="flex justify-between items-center py-4 bg-transparent text-[#1e3a8a] px-4 md:px-12 relative">
      <div className="flex items-center">
        <Link href="/" onClick={closeMenu}>
          <p className="text-2xl font-semibold font-comfortaa cursor-pointer">
            Vidya Sangam
          </p>
        </Link>
      </div>

      <div className="hidden md:flex space-x-6">
        <Link href="/" onClick={closeMenu} className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Home
          </span>
        </Link>
        
        <Link href="/sessions" onClick={closeMenu} className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Sessions
          </span>
        </Link>
        <Link href="/chatbot" onClick={closeMenu} className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Chatbot
          </span>
        </Link>
        <Link
          href="/leaderboard"
          onClick={closeMenu}
          className="relative group"
        >
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Leaderboard
          </span>
        </Link>

        {!isAdmin && (
          <Link
            href="/mentoring-form"
            onClick={closeMenu}
            className="relative group"
          >
            <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Apply Now
            </span>
          </Link>
        )}

        
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <Link
                href="/adminDashboard"
                onClick={closeMenu}
                className="relative group"
              >
                <span className="bg-[#ede9fe] text-[#6d28d9] font-medium transition duration-200 rounded px-3 py-1">
                  Admin Dashboard
                </span>
              </Link>
            )}
            
            {!isAdmin && (
              <Link
                href="/profile"
                onClick={closeMenu}
                className="relative group"
              >
                <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                  Profile
                </span>
              </Link>
            )}
            <button onClick={handleLogout} className="relative group">
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Logout
              </span>
            </button>
          </>
        ) : (
          <button onClick={handleLogin} className="relative group">
            <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Login
            </span>
          </button>
        )}
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-10 md:hidden">
          <div className="flex flex-col items-center space-y-2 py-2">
            <Link href="/" onClick={closeMenu} className="relative group">
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Home
              </span>
            </Link>
            {!isAdmin && (
              <Link
                href="/mentoring-form"
                onClick={closeMenu}
                className="relative group"
              >
                <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                  Be a Part
                </span>
              </Link>
            )}
            <Link
              href="/sessions"
              onClick={closeMenu}
              className="relative group"
            >
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Sessions
              </span>
            </Link>
            <Link
              href="/chatbot"
              onClick={closeMenu}
              className="relative group"
            >
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Chatbot
              </span>
            </Link>
            <Link
              href="/leaderboard"
              onClick={closeMenu}
              className="relative group"
            >
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Leaderboard
              </span>
            </Link>
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/adminDashboard"
                    onClick={closeMenu}
                    className="relative group"
                  >
                    <span className="bg-[#ede9fe] text-[#6d28d9] font-medium transition duration-200 rounded px-3 py-1">
                      Admin Dashboard
                    </span>
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="relative group"
                  >
                    <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                      Profile
                    </span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="relative group hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <button onClick={handleLogin} className="relative group">
                <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                  Login
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}