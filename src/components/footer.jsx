import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaHeart,
  FaShield,
  FaRocket,
  FaHandsHelping
} from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold mb-4">
              <span className="bg-green-600 text-white p-2 rounded-lg">
                VBP
              </span>
              <span>Village Business Platform</span>
            </Link>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Empowering local village businesses to thrive in the digital age. 
              We connect rural entrepreneurs with customers worldwide, preserving 
              traditional crafts while embracing modern technology.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2"
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/#businesses" 
                  className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2"
                >
                  <span>Browse Businesses</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2"
                >
                  <span>Register Business</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2"
                >
                  <span>Business Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <FaPhone className="w-4 h-4 text-green-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="w-4 h-4 text-green-400" />
                <span>support@villagebusiness.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300">
                <FaMapMarkerAlt className="w-4 h-4 text-green-400 mt-1" />
                <span>123 Rural Tech Park<br />Village Innovation Center</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaRocket className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Easy Setup</h4>
              <p className="text-sm text-gray-300">Get your business online in minutes</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaShield className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Secure Platform</h4>
              <p className="text-sm text-gray-300">Your data and payments are protected</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaHandsHelping className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-300">We're here to help you succeed</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaHeart className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Community First</h4>
              <p className="text-sm text-gray-300">Supporting local village economies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Village Business Platform. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-green-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
            
            <div className="text-gray-400 text-sm flex items-center space-x-1">
              <span>Made with</span>
              <FaHeart className="w-4 h-4 text-red-500" />
              <span>for rural communities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer