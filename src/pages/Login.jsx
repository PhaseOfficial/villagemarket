import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaEnvelope, FaLock, FaArrowRight, FaExclamationCircle } from 'react-icons/fa'
import logo from '../assets/logo.png'
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      const { error } = await signIn(email, password)
      
      if (error) throw error
      
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glass Card Container */}
      <div className="max-w-md w-full mt-10 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className=" bg-gradient-to-tr from-green-500 to-emerald-300 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 text-white text-2xl font-bold">
                <img src={logo} alt="Village Market Logo" className="h-20 rounded-2xl"/>
             </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Sign in to manage your village business
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Password Input Group */}
            <div>
              <div className="relative group mb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* --- NEW: Forgot Password Link --- */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              {/* -------------------------------- */}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in 
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          
          {/* Footer Link */}
          <div className="text-center mt-6">
            <Link 
              to="/register" 
              className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Don't have an account? <span className="underline decoration-emerald-500/30 underline-offset-4">Register Business</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login