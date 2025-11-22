import React, { useEffect } from 'react'
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa'

const ImageModal = ({ 
  imageUrl, 
  productName, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious, 
  hasNext = false, 
  hasPrevious = false 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleImageClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close modal"
      >
        <FaTimes className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
          aria-label="Previous image"
        >
          <FaChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
          aria-label="Next image"
        >
          <FaChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image Container */}
      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
        <div className="relative">
          {/* Product Name */}
          <div className="absolute -top-16 left-0 right-0 text-center">
            <h3 className="text-white text-lg font-semibold truncate max-w-2xl mx-auto">
              {productName}
            </h3>
          </div>

          {/* Image */}
          <img
            src={imageUrl}
            alt={productName}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={handleImageClick}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'
            }}
          />

          {/* Fullscreen Toggle */}
          <button
            onClick={() => window.open(imageUrl, '_blank')}
            className="absolute bottom-4 right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
            aria-label="Open image in fullscreen"
          >
            <FaExpand className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {!imageUrl && (
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading image...</p>
        </div>
      )}
    </div>
  )
}

export default ImageModal