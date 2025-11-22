import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ImageModal from '../components/ImageModal'

const ClientProducts = () => {
  const { businessId } = useParams()
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)

  useEffect(() => {
    fetchBusinessAndProducts()
  }, [businessId])

  const fetchBusinessAndProducts = async () => {
    try {
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (businessError) throw businessError

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      setBusiness(businessData)
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

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
    const nextIndex = (selectedProductIndex + 1) % products.length
    const nextProduct = products[nextIndex]
    if (nextProduct?.image_url) {
      setSelectedImage(nextProduct.image_url)
      setSelectedProductIndex(nextIndex)
    }
  }

  const goToPreviousImage = () => {
    const prevIndex = (selectedProductIndex - 1 + products.length) % products.length
    const prevProduct = products[prevIndex]
    if (prevProduct?.image_url) {
      setSelectedImage(prevProduct.image_url)
      setSelectedProductIndex(prevIndex)
    }
  }

  const hasNextImage = () => {
    return products.some((product, index) => 
      index > selectedProductIndex && product.image_url
    )
  }

  const hasPreviousImage = () => {
    return products.some((product, index) => 
      index < selectedProductIndex && product.image_url
    )
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

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Business not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        productName={products[selectedProductIndex]?.name || ''}
        isOpen={!!selectedImage}
        onClose={closeImageModal}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
        hasNext={hasNextImage()}
        hasPrevious={hasPreviousImage()}
      />

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{business.business_name}</h1>
        <p className="text-gray-600 mb-2">📞 {business.contact_number}</p>
        <p className="text-gray-600">📍 {business.village_name}</p>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Clickable Product Image */}
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
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-green-600 font-bold text-xl">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No products available from this business yet.</p>
        </div>
      )}
    </div>
  )
}

export default ClientProducts