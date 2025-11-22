import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [business, setBusiness] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  })

  useEffect(() => {
    if (user) {
      fetchBusinessData()
      fetchProducts()
    }
  }, [user])

  const fetchBusinessData = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setBusiness(data)
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    
    if (!productForm.name || !productForm.price) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      setUploading(true)
      setUploadProgress(0)
      let imageUrl = null
      
      // Upload image if exists
      if (productForm.image) {
        const file = productForm.image
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
        
        // Small delay to show 100% progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Insert product
      const { error } = await supabase
        .from('products')
        .insert([
          {
            business_id: user.id,
            name: productForm.name,
            description: productForm.description,
            price: parseFloat(productForm.price),
            image_url: imageUrl,
          }
        ])
      
      if (error) throw error
      
      // Reset form and refresh products
      setProductForm({ name: '', description: '', price: '', image: null })
      setShowProductForm(false)
      setUploadProgress(0)
      fetchProducts()
      
      alert('Product added successfully!')
      
    } catch (error) {
      console.error('Error adding product:', error)
      alert(`Error adding product: ${error.message}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB.')
        return
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
        return
      }
      
      setProductForm({
        ...productForm,
        image: file,
      })
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('business_id', user.id)
      
      if (error) throw error
      
      fetchProducts()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product: ' + error.message)
    }
  }

  const clearImage = () => {
    setProductForm({
      ...productForm,
      image: null,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Dashboard</h1>
      
      {business && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{business.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="font-medium">{business.contact_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Village</p>
              <p className="font-medium">{business.village_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${business.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                {business.approved ? 'Approved' : 'Pending Approval'}
              </p>
            </div>
          </div>
          
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Your Products ({products.length})</h2>
        <button
          onClick={() => setShowProductForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Product</span>
        </button>
      </div>
      
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Product</h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe your product"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                {productForm.image ? (
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">
                        {productForm.image.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-green-600">
                      Size: {(productForm.image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-image"
                    />
                    <label
                      htmlFor="product-image"
                      className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-green-600"
                    >
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Click to upload product image</span>
                      <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF (Max 5MB)</span>
                    </label>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm text-blue-800 mb-1">
                    <span>Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Adding Product...' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  disabled={uploading}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-2 text-sm">{product.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <p className="text-green-600 font-bold text-lg">${parseFloat(product.price).toFixed(2)}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first product to showcase on your business page.</p>
          <button
            onClick={() => setShowProductForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      )}
      <div className="flex space-x-4 mb-6 mt-10">
  <Link 
    to="/analytics"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
  >
    View Analytics
  </Link>
</div>
    </div>
  )
}

export default Dashboard