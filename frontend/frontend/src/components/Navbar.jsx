import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Analysis', href: '/data' },
    { label: 'Status', href: '/status' },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm flex items-center justify-between px-10 z-50">
      {/* Logo */}
      <Link to="/">
        <div className="text-xl font-bold text-blue-600 tracking-wide cursor-pointer hover:text-blue-700 transition-colors">
          Smart Washing System
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-8 text-gray-600">
        {menuItems.map((item) => (
          item.href.startsWith('/') ? (
            <Link key={item.label} to={item.href} className="hover:text-blue-600 transition-colors duration-300">
              {item.label}
            </Link>
          ) : (
            <a key={item.label} href={item.href} className="hover:text-blue-600 transition-colors duration-300">
              {item.label}
            </a>
          )
        ))}
      </div>
    </nav>
  )
}
