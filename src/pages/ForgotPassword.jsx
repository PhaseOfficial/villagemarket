import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaEnvelope, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setMessage('')
      setError('')
      setLoading(true)
      const { error } = await resetPassword(email)
      if (error) throw error
      setMessage('Check your inbox for further instructions')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Reset Password
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email to receive a recovery link
          </p>
        </div>

        {message ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Email Sent!</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <div className="mt-6">
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                <FaExclamationCircle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-all duration-200 shadow-lg"
            >
              {loading ? 'Sending...' : 'Send Reset Link'} 
              {!loading && <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword