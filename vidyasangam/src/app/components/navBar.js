"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use router for redirecting

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const router = useRouter(); // Initialize router for navigation

  // Check login status when component mounts
  useEffect(() => {
    // Check for authToken in localStorage
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true); // Set logged-in state if token exists
    }
  }, []); // Empty dependency array ensures this runs once when component loads

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = () => {
    // Redirect to the login page
    router.push("/login"); // Use router.push for programmatic navigation
  };

  const handleLogout = () => {
    // Clear login state
    localStorage.removeItem("authToken");
    setIsLoggedIn(false); // Set logged out state
    router.push("/"); // Redirect to homepage after logout
  };

  const closeMenu = () => {
    setIsOpen(false); // Close the mobile menu after clicking a link
  };

  return (
    <nav className="flex justify-between items-center py-4 bg-transparent text-[#1e3a8a] px-4 md:px-12 relative">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/" onClick={closeMenu}>
          <p className="text-2xl font-semibold font-comfortaa cursor-pointer">
            Vidya Sangam
          </p>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        <Link href="/" onClick={closeMenu} className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Home
          </span>
        </Link>
        <Link
          href="/mentoring-form"
          onClick={closeMenu}
          className="relative group"
        >
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
            Be a Part
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
        {/* Conditional Rendering for Login/Profile */}
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              onClick={closeMenu}
              className="relative group"
            >
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Profile
              </span>
            </Link>
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

      {/* Mobile Menu Toggle */}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-10 md:hidden">
          <div className="flex flex-col items-center space-y-2 py-2">
            <Link href="/" onClick={closeMenu} className="relative group">
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Home
              </span>
            </Link>
            <Link
              href="/mentoring-form"
              onClick={closeMenu}
              className="relative group"
            >
              <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Be a Part
              </span>
            </Link>
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
            {/* Conditional Rendering for Login/Profile */}
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="relative group"
                >
                  <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                    Profile
                  </span>
                </Link>
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
  );
};

export default NavBar;
