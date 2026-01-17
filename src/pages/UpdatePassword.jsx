import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaLock, FaArrowRight, FaExclamationCircle } from 'react-icons/fa'

const UpdatePassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { updateUserPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }

    try {
      setError('')
      setLoading(true)
      const { error } = await updateUserPassword(password)
      if (error) throw error
      // Redirect to login or dashboard
      navigate('/login') 
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4">
       <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Set New Password
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all duration-200 shadow-lg"
          >
            {loading ? 'Updating...' : 'Update Password'} 
            {!loading && <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdatePassword