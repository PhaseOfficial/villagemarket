import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ImageModal from '../components/ImageModal'

const Home = () => {
  const [products, setProducts] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  
  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)

  useEffect(() => {
    fetchProductsAndBusinesses()
  }, [])

  const fetchProductsAndBusinesses = async () => {
    try {
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .eq('approved', true)

      if (businessesError) throw businessesError

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          businesses (
            business_name,
            village_name,
            contact_number
          )
        `)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      setBusinesses(businessesData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase().trim()
    
    // Safely access properties
    const productName = product.name?.toLowerCase() || ''
    const productDesc = product.description?.toLowerCase() || ''
    const businessName = product.businesses?.business_name?.toLowerCase() || ''
    const villageName = product.businesses?.village_name?.toLowerCase() || ''

    const matchesSearch = 
      !term || 
      productName.includes(term) ||
      productDesc.includes(term) ||
      businessName.includes(term) ||
      villageName.includes(term)
    
    const matchesBusiness = selectedBusiness === 'all' || product.business_id === selectedBusiness
    
    return matchesSearch && matchesBusiness
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  // Image modal logic
  const openImageModal = (product, index) => {
    if (product.image_url) {
      setSelectedImage(product.image_url)
      setSelectedProductIndex(index)
    }
  }
  const closeImageModal = () => {
    setSelectedImage(null)
    setSelectedProductIndex(0)
  }
  const goToNextImage = () => {
    const nextIndex = (selectedProductIndex + 1) % sortedProducts.length
    const nextProduct = sortedProducts[nextIndex]
    if (nextProduct?.image_url) {
      setSelectedImage(nextProduct.image_url)
      setSelectedProductIndex(nextIndex)
    }
  }
  const goToPreviousImage = () => {
    const prevIndex = (selectedProductIndex - 1 + sortedProducts.length) % sortedProducts.length
    const prevProduct = sortedProducts[prevIndex]
    if (prevProduct?.image_url) {
      setSelectedImage(prevProduct.image_url)
      setSelectedProductIndex(prevIndex)
    }
  }
  const hasNextImage = () => sortedProducts.some((p, i) => i > selectedProductIndex && p.image_url)
  const hasPreviousImage = () => sortedProducts.some((p, i) => i < selectedProductIndex && p.image_url)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-20 text-slate-800 font-sans">
      <ImageModal
        imageUrl={selectedImage}
        productName={sortedProducts[selectedProductIndex]?.name || ''}
        isOpen={!!selectedImage}
        onClose={closeImageModal}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
        hasNext={hasNextImage()}
        hasPrevious={hasPreviousImage()}
      />

      {/* --- HERO SECTION --- */}
      {/* Changed to clean white background with strong typography */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 pt-16 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Village Business Platform
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
              Connecting local communities. Discover unique products and services from your neighbors.
            </p>
            
            {/* Search Bar - Modern Pill Shape */}
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products, villages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-full text-slate-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 shadow-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-sm">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Business Select */}
              <div className="relative">
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer text-slate-700"
                >
                  <option value="all">All Businesses</option>
                  {businesses.map(business => (
                    <option key={business.id} value={business.id}>{business.business_name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Sort Select */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer text-slate-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="text-slate-400 font-medium">
              {sortedProducts.length} Result{sortedProducts.length !== 1 && 's'}
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="container mx-auto px-4 py-12">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-emerald-500 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                {/* Image Area */}
                <div 
                  className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => openImageModal(product, index)}
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                  {/* Zoom Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800 line-clamp-1 text-lg leading-tight">
                        {product.name}
                      </h3>
                      <Link to={`/business/${product.business_id}`} className="text-xs text-emerald-600 hover:underline font-medium mt-1 block">
                        {product.businesses?.business_name}
                      </Link>
                    </div>
                    <span className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded text-sm border border-slate-100">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                    {product.description || 'No description provided.'}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {product.businesses?.village_name}
                    </span>
                    <Link 
                      to={`/business/${product.business_id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Visit Shop &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No products found</h3>
            <p className="text-slate-500 mt-1 max-w-xs text-center">
              We couldn't find anything matching "{searchTerm}". Try adjusting your filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedBusiness('all'); }}
              className="mt-6 text-sm font-medium text-emerald-600 hover:text-emerald-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* --- BUSINESSES FOOTER SECTION --- */}
      {businesses.length > 0 && (
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Businesses</h2>
                <p className="text-slate-500 mt-1">Trusted sellers in your community</p>
              </div>
              {businesses.length > 6 && (
                <Link to="/" onClick={(e) => {e.preventDefault(); setSelectedBusiness('all'); window.scrollTo(0,0)}} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  View All
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.slice(0, 6).map((business) => (
                <Link 
                  key={business.id}
                  to={`/business/${business.id}`}
                  className="flex items-center p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center mr-4 text-emerald-600 font-bold shadow-sm">
                    {business.business_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{business.business_name}</h3>
                    <p className="text-xs text-slate-500">
                      📍 {business.village_name} • 📞 {business.contact_number}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home