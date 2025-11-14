import React, { useState } from 'react'
import { X, Search, Edit3, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const ResetPriceModal = ({ isOpen, onClose, stockItems, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [showCustomUnit, setShowCustomUnit] = useState(false)
  const [customUnit, setCustomUnit] = useState('')
  const [loading, setLoading] = useState(false)
  const [customUnits, setCustomUnits] = useState(() => {
    // Load custom units from localStorage
    const saved = localStorage.getItem('customUnits')
    return saved ? JSON.parse(saved) : []
  })

  if (!isOpen) return null
  
  // Get unique units from all stock items for suggestions
  const availableUnits = [...new Set(stockItems.map(item => item.unit).filter(Boolean))]
  
  // Default units (same as in StockModal)
  const defaultUnits = [
    'pcs',
    'kg',
    'gm',
    'ltr',
    'ml',
    'box',
    'pack',
    'meter',
    'inch',
    'pair'
  ]
  
  // Combine all units: existing from stock items, default units, and custom units
  const allUnits = [...new Set([...availableUnits, ...defaultUnits, ...customUnits])]

  const filteredItems = stockItems.filter(item => 
    (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.productCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = (item) => {
    setEditingItem(item)
    setNewPrice(item.unitPrice?.toString() || '')
    setNewUnit(item.unit || '')
    setShowCustomUnit(false)
    setCustomUnit('')
  }

  const handleSaveClick = async () => {
    if (!editingItem) return

    try {
      setLoading(true)
      const price = parseFloat(newPrice)
      
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price')
        return
      }

      if (!newUnit.trim()) {
        toast.error('Please enter a valid unit')
        return
      }

      const updatedItem = {
        ...editingItem,
        unitPrice: price,
        unit: newUnit.trim()
      }

      const response = await api.put(`/api/stock/${editingItem.id}`, updatedItem)
      const savedItem = response.data?.data || response.data

      // Update the item in the list
      onUpdate && onUpdate(savedItem)
      
      toast.success(`Updated price and unit for ${editingItem.productName}`)
      setEditingItem(null)
      setNewPrice('')
      setNewUnit('')
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setNewPrice('')
    setNewUnit('')
    setShowCustomUnit(false)
    setCustomUnit('')
  }

  const handleUnitChange = (value) => {
    if (value === '__CUSTOM__') {
      setShowCustomUnit(true)
      setCustomUnit('')
    } else {
      setShowCustomUnit(false)
      setNewUnit(value)
      setCustomUnit('')
    }
  }

  const handleCustomUnitConfirm = () => {
    const trimmedUnit = customUnit.trim()
    
    if (!trimmedUnit) {
      return
    }
    
    // Check if unit already exists (case-insensitive)
    const unitExists = allUnits.some(unit => 
      unit.toLowerCase() === trimmedUnit.toLowerCase()
    )
    
    if (unitExists) {
      toast.error('This unit already exists!')
      return
    }
    
    const newUnit = trimmedUnit
    const updatedUnits = [...customUnits, newUnit]
    setCustomUnits(updatedUnits)
    // Save to localStorage
    localStorage.setItem('customUnits', JSON.stringify(updatedUnits))
    // Set the unit value to the new unit
    setNewUnit(newUnit)
    setCustomUnit('')
    setShowCustomUnit(false)
    toast.success(`Custom unit "${newUnit}" created!`)
  }

  const handleCustomUnitCancel = () => {
    setShowCustomUnit(false)
    setCustomUnit('')
    // Revert back to the original unit value from the item being edited
    setNewUnit(editingItem?.unit || '')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Reset Price</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.productName || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Code: {item.productCode || 'N/A'} | Category: {item.category || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity || 0} | Current Price: ₹{(item.unitPrice || 0).toFixed(2)} | Unit: {item.unit || 'pcs'}
                      </p>
                    </div>
                    
                    {editingItem?.id === item.id ? (
                      <div className="ml-4 flex items-center space-x-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Price"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Unit</label>
                          {showCustomUnit ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                value={customUnit}
                                onChange={(e) => setCustomUnit(e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="Unit"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCustomUnitConfirm()
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleCustomUnitConfirm}
                                className="px-1 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                title="Confirm"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={handleCustomUnitCancel}
                                className="px-1 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <select
                              value={newUnit}
                              onChange={(e) => handleUnitChange(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              style={{
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}
                            >
                              <option value="">Select</option>
                              {allUnits.sort().map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                              <option value="__CUSTOM__" className="text-blue-600 font-semibold">
                                ➕ Add Custom Unit
                              </option>
                            </select>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={handleSaveClick}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            <Save className="h-3 w-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(item)}
                        className="ml-4 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Price & Unit"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredItems.length} items found
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPriceModal