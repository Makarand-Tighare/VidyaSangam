"use client";

import { useState } from "react";
import Link from "next/link";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = () => {
    // Redirect to the login page
    window.location.href = '/login'; // Update this path if your login page is different
  };

  return (
    <nav className="flex justify-between items-center py-4 bg-transparent text-[#946f43] mx-6 md:mx-12 relative">
      {/* Logo */}
      <div className="flex items-center">
        <p className="text-2xl font-semibold font-comfortaa">Vidya Sangam</p>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        <Link href="/" className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Home</span>
        </Link>
        <Link href="/mentoring-form" className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Be a Part</span>
        </Link>
        <Link href="/mentees" className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Mentees</span>
        </Link>
        <Link href="/sessions" className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Sessions</span>
        </Link>
        <Link href="/resources" className="relative group">
          <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Resources</span>
        </Link>
        {/* Conditional Rendering for Login/Profile */}
        {isLoggedIn ? (
          <Link href="/profile" className="relative group">
            <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Profile</span>
          </Link>
        ) : (
          <button onClick={handleLogin} className="relative group">
            <span className="hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">Login</span>
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
          <div className="flex flex-col space-y-2 py-2">
            <Link href="/" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Home
            </Link>
            <Link href="/mentoring-form" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Be a Part
            </Link>
            <Link href="/mentees" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Mentees
            </Link>
            <Link href="/sessions" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Sessions
            </Link>
            <Link href="/resources" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
              Resources
            </Link>
            {/* Conditional Rendering for Mobile Menu Login/Profile */}
            {isLoggedIn ? (
              <Link href="/profile" className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Profile
              </Link>
            ) : (
              <button onClick={handleLogin} className="block text-center hover:bg-[#ede9fe] transition duration-200 rounded px-3 py-1">
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
