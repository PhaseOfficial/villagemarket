import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaBars, FaTimes, FaHome, FaTachometerAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsMenuOpen(false)
  }

  const closeMenu = () => setIsMenuOpen(false)

  const menuVariants = {
    closed: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  }

  // Desktop Link Component
  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-full transition-all duration-200"
    >
      {children}
    </Link>
  )

  // Mobile Link Component
  const MobileNavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick || closeMenu}
      className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-white/60 hover:text-green-700 transition-all rounded-xl"
    >
      {Icon && <Icon className="w-5 h-5 opacity-70" />}
      <span className="font-medium">{children}</span>
    </Link>
  )

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'pt-2 px-2' : 'pt-4 px-4'}`}>
      <nav className={`mx-auto max-w-7xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5 transition-all duration-300 ${scrolled ? 'rounded-xl py-2' : 'rounded-2xl py-3'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img src={logo} alt="Logo" className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
              </div>
              <span className="font-bold text-lg text-slate-800 hidden sm:inline">Village Business</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Home</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  <button 
                    onClick={handleSignOut}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Login</NavLink>
                  {/* Standard Register Link (Visible when logged out) */}
                  <Link 
                    to="/register" 
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md shadow-green-600/20 hover:shadow-green-600/40 transition-all transform hover:-translate-y-0.5"
                  >
                    Register Business
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-full bg-slate-100 text-slate-600">
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={menuVariants}
            initial="closed" animate="open" exit="closed"
            className="absolute top-full left-0 right-0 px-4 mt-2 md:hidden"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden mx-auto max-w-7xl">
              <div className="p-4 space-y-2">
                <MobileNavLink to="/" icon={FaHome}>Home</MobileNavLink>

                {user ? (
                  <>
                    <MobileNavLink to="/dashboard" icon={FaTachometerAlt}>Dashboard</MobileNavLink>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <button onClick={handleSignOut} className="flex items-center space-x-3 px-4 py-3 text-slate-700 w-full text-left hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                      <FaSignInAlt className="opacity-70" /> <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/login" icon={FaSignInAlt}>Login</MobileNavLink>
                    <MobileNavLink to="/register" icon={FaUserPlus}>Register Business</MobileNavLink>
                  </>
                )}
              </div>
            </div>
            <div className="fixed inset-0 -z-10 h-screen" onClick={closeMenu}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Navbar