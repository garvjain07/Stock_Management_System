import React, { useState, useEffect } from 'react'
import { X, Package, AlertTriangle } from 'lucide-react'
import api from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

const ProductsModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'unavailable'

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stock')
      const stockData = response.data.data || response.data
      setProducts(Array.isArray(stockData) ? stockData : [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'unavailable') {
      return product.quantity <= 0
    }
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 text-sm font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`px-6 py-3 text-sm font-medium ${
              filter === 'unavailable'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unavailable ({products.filter(p => p.quantity <= 0).length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'unavailable' ? 'No unavailable products' : 'No products found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 ${
                    product.quantity <= 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.productName}
                    </h3>
                    {product.quantity <= 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">
                      Code: {product.productCode}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      Category: {product.category}
                    </p>
                    
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(product.unitPrice || product.price || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      product.quantity <= 0 ? 'text-red-600' : 
                      product.quantity <= (product.minStock || 5) ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      Stock: {product.quantity} {product.unit}
                    </span>
                  </div>
                  
                  {product.quantity <= 0 && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                      Currently Unavailable
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsModal