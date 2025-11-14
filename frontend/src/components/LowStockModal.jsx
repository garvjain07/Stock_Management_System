import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, Package, TrendingDown } from 'lucide-react'
import api from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

const LowStockModal = ({ isOpen, onClose }) => {
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchLowStockItems()
    }
  }, [isOpen])

  const fetchLowStockItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stock')
      const stockData = response.data.data || response.data
      
      // Filter items that are low in stock
      const lowStock = stockData.filter(item => {
        // All items now have minStock >= 1, so just check if quantity is below threshold
        return item.quantity <= item.minStock
      })
      
      // Sort by urgency (lowest stock first)
      lowStock.sort((a, b) => {
        const aRatio = a.quantity / a.minStock
        const bRatio = b.quantity / b.minStock
        return aRatio - bRatio
      })
      
      setLowStockItems(lowStock)
    } catch (error) {
      console.error('Error fetching low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (currentStock, minStock) => {
    if (currentStock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-500', textColor: 'text-red-700' }
    } else if (currentStock <= minStock * 0.5) {
      return { label: 'Critical', color: 'bg-red-400', textColor: 'text-red-700' }
    } else if (currentStock <= minStock) {
      return { label: 'Low Stock', color: 'bg-yellow-400', textColor: 'text-yellow-700' }
    }
    return { label: 'Normal', color: 'bg-green-400', textColor: 'text-green-700' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Low Stock Items</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600">Items Below Their Minimum Stock Level</p>
            <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              Only showing items with minimum stock levels configured
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-600 font-medium">All items are well stocked!</p>
              <p className="text-gray-500 text-sm mt-1">
                No items are below their configured minimum stock levels
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockItems.map((item) => {
                const minStock = item.minStock // No fallback needed since we only show items with minStock set
                const status = getStockStatus(item.quantity, minStock)
                const stockPercentage = Math.max(0, Math.min(100, (item.quantity / minStock) * 100))
                
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {item.productName}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color} text-white`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          Code: {item.productCode} | Category: {item.category}
                        </p>
                      </div>
                      
                      {item.quantity === 0 && (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</p>
                        <p className={`text-lg font-bold ${status.textColor}`}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Minimum Stock</p>
                        <p className="text-lg font-medium text-gray-900">
                          {minStock} {item.unit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Shortage</p>
                        <p className="text-lg font-medium text-red-600">
                          {Math.max(0, minStock - item.quantity)} {item.unit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Unit Price</p>
                        <p className="text-lg font-medium text-gray-900">
                          ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stock Level Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stockPercentage <= 25 ? 'bg-red-500' :
                          stockPercentage <= 50 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Stock level: {stockPercentage.toFixed(1)}% of minimum required
                    </p>
                    
                    {item.quantity === 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700 font-medium">
                          ⚠️ This item is completely out of stock and cannot be sold
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LowStockModal