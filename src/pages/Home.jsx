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
      // Fetch approved businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .eq('approved', true)

      if (businessesError) throw businessesError

      // Fetch products with business information
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

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.businesses.business_name.toLowerCase().includes(searchTerm.toLowerCase())
    
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

  // Image modal functions
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

  const hasNextImage = () => {
    return sortedProducts.some((product, index) => 
      index > selectedProductIndex && product.image_url
    )
  }

  const hasPreviousImage = () => {
    return sortedProducts.some((product, index) => 
      index < selectedProductIndex && product.image_url
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal */}
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

      {/* Hero Section */}
      <div className="bg-green-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Village Business Platform
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover unique products from local village businesses
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Business Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Business:
                </label>
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All Businesses</option>
                  {businesses.map(business => (
                    <option key={business.id} value={business.id}>
                      {business.business_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Product Image with Click Handler */}
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => openImageModal(product, index)}
                >
                  {product.image_url ? (
                    <>
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                        }}
                      />
                      {/* Overlay with zoom icon */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white bg-opacity-80 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer group"
                      onClick={() => openImageModal(product, index)}
                    >
                      <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <Link to={`/business/${product.business_id}`}>
                    <div className="flex items-center mb-2 group">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 font-medium group-hover:text-green-700 transition-colors">
                        {product.businesses.business_name}
                      </span>
                    </div>
                  </Link>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    
                    <Link 
                      to={`/business/${product.business_id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Business →
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>📍 {product.businesses.village_name}</span>
                      <span>📞 {product.businesses.contact_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedBusiness !== 'all' ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No products found for "${searchTerm}". Try different search terms.`
                  : selectedBusiness !== 'all'
                  ? 'This business has no products yet.'
                  : 'No businesses have added products yet. Check back soon!'
                }
              </p>
              {(searchTerm || selectedBusiness !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedBusiness('all')
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Show All Products
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Businesses Section */}
      {businesses.length > 0 && (
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Featured Village Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.slice(0, 6).map((business) => (
                <Link 
                  key={business.id}
                  to={`/business/${business.id}`}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold text-sm">
                        {business.business_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{business.business_name}</h3>
                      <p className="text-sm text-gray-600">📍 {business.village_name}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">📞 {business.contact_number}</p>
                    <p className="text-green-600 font-medium">
                      {products.filter(p => p.business_id === business.id).length} products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            {businesses.length > 6 && (
              <div className="text-center mt-8">
                <Link 
                  to="/" 
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedBusiness('all')
                    setSearchTerm('')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  View All {businesses.length} Businesses ↓
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home