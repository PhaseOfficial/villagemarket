import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaBars, FaTimes, FaHome, FaTachometerAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'


const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/#/')
    setIsMenuOpen(false)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick || closeMenu}
      className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-green-700 transition-colors rounded-lg"
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </Link>
  )

  const NavButton = ({ onClick, children, icon: Icon }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-green-700 transition-colors rounded-lg w-full text-left"
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  )

  return (
    <nav className="bg-green-600 text-white shadow-lg relative z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 text-xl font-bold">
            <img
              src={logo}
              alt="Company Logo"
              className="h-12 w-auto md:h-16"
            />
            <span className="hidden sm:inline">Village Business Platform</span>
            <span className="sm:hidden">VBP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-green-200 transition-colors px-3 py-2 rounded">Home</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-green-200 transition-colors px-3 py-2 rounded">Dashboard</Link>
                <button 
                  onClick={handleSignOut}
                  className="bg-green-700 px-4 py-2 rounded hover:bg-green-800 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200 transition-colors px-3 py-2 rounded">Login</Link>
                <Link 
                  to="/register" 
                  className="bg-green-700 px-4 py-2 rounded hover:bg-green-800 transition-colors"
                >
                  Register Business
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu with Animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={closeMenu}
              />
              
              {/* Menu */}
              <motion.div
                key="menu"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="md:hidden absolute top-full left-0 right-0 bg-green-600 shadow-lg border-t border-green-500 z-50"
              >
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <NavLink to="/" icon={FaHome}>
                      Home
                    </NavLink>

                    {user ? (
                      <>
                        <NavLink to="/dashboard" icon={FaTachometerAlt}>
                          Dashboard
                        </NavLink>
                        <NavButton onClick={handleSignOut}>
                          Sign Out
                        </NavButton>
                      </>
                    ) : (
                      <>
                        <NavLink to="/login" icon={FaSignInAlt}>
                          Login
                        </NavLink>
                        <NavLink to="/register" icon={FaUserPlus}>
                          Register Business
                        </NavLink>
                      </>
                    )}
                  </div>

                  {user && (
                    <div className="mt-4 pt-4 border-t border-green-500">
                      <div className="px-4 py-2 text-sm text-green-200">
                        <p className="font-medium">Welcome back!</p>
                        <p className="truncate">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar