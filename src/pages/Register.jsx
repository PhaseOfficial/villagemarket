import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FaEnvelope, 
  FaLock, 
  FaArrowRight, 
  FaExclamationCircle,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa'

// Input Component
const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
    </div>
    <input
      {...props}
      className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
    />
  </div>
)

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userExists, setUserExists] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }
    
    try {
      setError('')
      setUserExists(false)
      setLoading(true)
      
      // We no longer pass businessData here. 
      // The user will create their business on the Dashboard after logging in.
      const { error } = await signUp(formData.email, formData.password)
      
      if (error) throw error
      
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setError('This email is already associated with an account.')
        setUserExists(true)
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glass Card */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
             <FaUserPlus size={20} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Sign up to start managing your village businesses
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {error && (
            <div className={`flex flex-col gap-2 ${userExists ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-red-50 border-red-100 text-red-600'} border px-4 py-3 rounded-xl text-sm animate-shake`}>
              <div className="flex items-center gap-3">
                <FaExclamationCircle className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              {userExists && (
                <div className="ml-7 mt-1">
                  <Link to="/login" className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg transition-colors font-medium">
                    <FaSignInAlt /> Log In instead
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <InputField 
              icon={FaEnvelope}
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />

            <InputField 
              icon={FaLock}
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <InputField 
              icon={FaLock}
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

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
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account 
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Already have an account? <span className="underline decoration-emerald-500/30 underline-offset-4">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register