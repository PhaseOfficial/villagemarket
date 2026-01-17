import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  FaStore, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaArrowRight, 
  FaExclamationCircle,
  FaArrowLeft
} from 'react-icons/fa'

// Reusable Input Component
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

const AddBusiness = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    contact_number: '',
    village_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { createBusiness } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      
      // Call the NEW function specifically for existing users
      await createBusiness(formData)
      
      // Go back to dashboard after success
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-xl w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Add New Business
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Expand your reach by adding another location or store
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <InputField 
              icon={FaStore}
              name="business_name" // Note: match Supabase column name
              type="text"
              required
              placeholder="Business Name"
              value={formData.business_name}
              onChange={handleChange}
            />

            <InputField 
              icon={FaMapMarkerAlt}
              name="village_name"
              type="text"
              required
              placeholder="Village Name"
              value={formData.village_name}
              onChange={handleChange}
            />

            <InputField 
              icon={FaPhone}
              name="contact_number"
              type="tel"
              required
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleChange}
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 shadow-lg transition-all"
            >
              {loading ? 'Creating...' : 'Create Business'} 
              {!loading && <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>

            <Link 
              to="/dashboard"
              className="flex justify-center items-center py-3 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddBusiness