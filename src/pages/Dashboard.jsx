import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaStore, 
  FaPlus, 
  FaTrash, 
  FaChartLine, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaBriefcase 
} from 'react-icons/fa'

const Dashboard = () => {
  const { user, createBusiness } = useAuth()
  const navigate = useNavigate()
  
  // --- STATE MANAGEMENT ---
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: null })
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Business Form State (NEW)
  const [showBusinessForm, setShowBusinessForm] = useState(false)
  const [businessForm, setBusinessForm] = useState({ business_name: '', village_name: '', contact_number: '' })
  
  const [submitting, setSubmitting] = useState(false)

  // --- EFFECT HOOKS ---
  useEffect(() => {
    if (user) fetchBusinesses()
  }, [user])

  useEffect(() => {
    if (selectedBusiness) {
      fetchProducts(selectedBusiness.id)
    } else {
      setProducts([])
    }
  }, [selectedBusiness])

  // --- DATA FETCHING ---
  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setBusinesses(data || [])
      
      // Select first business if none selected
      if (!selectedBusiness && data && data.length > 0) {
        setSelectedBusiness(data[0])
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // --- HANDLERS ---

  // 1. Create New Business Handler
  const handleBusinessSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Use the function from AuthContext we created earlier
      const newBusiness = await createBusiness(businessForm)
      
      // Refresh list
      await fetchBusinesses()
      
      // Auto-select the new business (it returns an array)
      if (newBusiness && newBusiness.length > 0) {
        setSelectedBusiness(newBusiness[0])
      }

      setBusinessForm({ business_name: '', village_name: '', contact_number: '' })
      setShowBusinessForm(false)
      alert("New business created successfully!")
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 2. Create New Product Handler
  const handleProductSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBusiness) return alert("No business selected")
    
    try {
      setSubmitting(true)
      setUploadProgress(0)
      let imageUrl = null
      
      if (productForm.image) {
        const file = productForm.image
        const fileExt = file.name.split('.').pop()
        const fileName = `${selectedBusiness.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        
        // Simulated Progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => prev >= 90 ? 90 : prev + 10)
        }, 200)
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file) // Note: removed redundant path prefix
        
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const { error } = await supabase
        .from('products')
        .insert([{
            business_id: selectedBusiness.id,
            name: productForm.name,
            description: productForm.description,
            price: parseFloat(productForm.price),
            image_url: imageUrl,
        }])
      
      if (error) throw error
      
      setProductForm({ name: '', description: '', price: '', image: null })
      setShowProductForm(false)
      fetchProducts(selectedBusiness.id)
      
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
      fetchProducts(selectedBusiness.id)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      setProductForm({ ...productForm, image: file })
    } else if (file) {
      alert('File too large (Max 5MB)')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-24 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* --- Top Bar: Title & Business Switcher --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage your stores and products</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
             <div className="relative group">
               <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500" />
               <select 
                 className="pl-9 pr-8 py-2 bg-transparent border-none focus:ring-0 text-slate-700 font-medium cursor-pointer min-w-[150px]"
                 value={selectedBusiness?.id || ''}
                 onChange={(e) => {
                   const business = businesses.find(b => b.id === e.target.value)
                   setSelectedBusiness(business)
                 }}
               >
                 {businesses.map(b => (
                   <option key={b.id} value={b.id}>{b.business_name}</option>
                 ))}
               </select>
             </div>
             
             <div className="w-px h-6 bg-gray-200"></div>
             
             {/* TRIGGER NEW BUSINESS MODAL */}
             <button 
               onClick={() => setShowBusinessForm(true)}
               className="text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap flex items-center gap-1"
             >
               <FaPlus size={10} /> New Store
             </button>
          </div>
        </div>

        {selectedBusiness ? (
          <>
            {/* --- Business Info Card --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden group">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-green-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4 pointer-events-none transition-opacity group-hover:opacity-80"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedBusiness.business_name}</h2>
                   <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <FaMapMarkerAlt className="text-emerald-500" /> {selectedBusiness.village_name}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <FaPhone className="text-emerald-500" /> {selectedBusiness.contact_number}
                      </span>
                   </div>
                 </div>
                 
                 <div className="flex gap-3">
                   <Link 
                     to="/analytics"
                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                   >
                     <FaChartLine /> Analytics
                   </Link>
                   <div className={`px-4 py-2 rounded-xl font-medium border flex items-center gap-2 ${selectedBusiness.approved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                     <div className={`w-2 h-2 rounded-full ${selectedBusiness.approved ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                     {selectedBusiness.approved ? 'Verified' : 'Pending'}
                   </div>
                 </div>
               </div>
            </div>

            {/* --- Products Grid Section --- */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Products <span className="text-slate-400 font-normal text-lg ml-1">({products.length})</span></h3>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <FaPlus size={14} /> Add Product
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="relative aspect-video bg-gray-50 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <FaStore size={24} className="opacity-20" />
                            <span className="text-xs">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-800 line-clamp-1 text-lg">{product.name}</h4>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-sm">${parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{product.description || 'No description available.'}</p>
                      
                      <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                  <FaStore size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No products yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm text-center">Start selling by adding your first product to this store.</p>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                >
                  Add Product Now
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-6 rounded-full shadow-lg shadow-emerald-100 mb-6">
                <FaBriefcase size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome to your Dashboard</h2>
            <p className="text-slate-500 mb-8 max-w-md">You haven't registered a business yet. Create your first store to start listing products.</p>
            <button 
              onClick={() => setShowBusinessForm(true)}
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-1"
            >
              Register Your First Business
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD PRODUCT --- */}
      {showProductForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
              <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder-gray-400"
                  placeholder="e.g. Fresh Tomatoes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="0.00"
                      required
                    />
                  </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                  rows="3"
                  placeholder="Tell customers about this product..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Image</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${productForm.image ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                  {productForm.image ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700 truncate">{productForm.image.name}</span>
                      <button type="button" onClick={() => setProductForm({...productForm, image: null})} className="text-red-500 text-sm font-bold hover:underline">Remove</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <div className="flex flex-col items-center gap-2">
                          <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500"><FaPlus /></div>
                          <span className="text-slate-500 text-sm font-medium">Upload Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {submitting && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 px-4 py-3.5 text-slate-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {submitting ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD BUSINESS (NEW) --- */}
      {showBusinessForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-xl font-bold text-slate-800">Register New Store</h3>
              <button onClick={() => setShowBusinessForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleBusinessSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Name</label>
                <div className="relative">
                    <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    value={businessForm.business_name}
                    onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    placeholder="e.g. Village Market"
                    required
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Village / Location</label>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    value={businessForm.village_name}
                    onChange={(e) => setBusinessForm({ ...businessForm, village_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    placeholder="e.g. Mutoko Centre"
                    required
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Number</label>
                <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="tel"
                    value={businessForm.contact_number}
                    onChange={(e) => setBusinessForm({ ...businessForm, contact_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    placeholder="e.g. +263 77 123 4567"
                    required
                    />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBusinessForm(false)}
                  className="flex-1 px-4 py-3.5 text-slate-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard