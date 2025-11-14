import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  Download,
  Upload,
  Minus,
  PlusCircle,
  MinusCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import StockModal from '../components/StockModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Stock = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [stocks, setStocks] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState(() => {
    // Check if we have a filter parameter from URL
    const filterParam = searchParams.get('filter')
    return filterParam === 'lowstock' ? 'low-stock' : 'all'
  })
  const [showModal, setShowModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stockToDelete, setStockToDelete] = useState(null)
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [stockToModify, setStockToModify] = useState(null)
  const [quantityToAdd, setQuantityToAdd] = useState('')
  const [quantityToDiscard, setQuantityToDiscard] = useState('')
  const [discardReason, setDiscardReason] = useState('')

  useEffect(() => {
    fetchStocks()
    fetchSuppliers()
  }, [])

  // Handle URL parameters for filtering
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'lowstock') {
      setFilterStatus('low-stock')
      toast.success('Showing items that need restocking')
    }
  }, [searchParams])

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stock')
      // Handle different response formats
      const stockData = response.data?.data || response.data
      setStocks(Array.isArray(stockData) ? stockData : [])
    } catch (error) {
      console.error('Error fetching stocks:', error)
      setStocks([])
      toast.error('Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/api/suppliers')
      // Handle different response formats
      const supplierData = response.data?.data || response.data
      setSuppliers(Array.isArray(supplierData) ? supplierData : [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setSuppliers([])
    }
  }

  const handleAddStock = () => {
    setSelectedStock(null)
    setShowModal(true)
  }

  const handleEditStock = (stock) => {
    setSelectedStock(stock)
    setShowModal(true)
  }

  const handleDeleteStock = (stock) => {
    setStockToDelete(stock)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/stock/${stockToDelete.id}`)
      toast.success('Stock item deleted successfully')
      // Refresh the entire stock list to ensure data consistency
      await fetchStocks()
      setShowDeleteDialog(false)
      setStockToDelete(null)
    } catch (error) {
      console.error('Error deleting stock:', error)
      toast.error('Failed to delete stock item')
    }
  }

  const handleStockSave = async (stockData) => {
    try {
      if (selectedStock) {
        // Update existing stock
        await api.put(`/api/stock/${selectedStock.id}`, stockData)
        toast.success('Stock updated successfully')
        // Refresh the entire stock list to ensure data consistency
        await fetchStocks()
      } else {
        // Add new stock
        await api.post('/api/stock', stockData)
        toast.success('Stock added successfully')
        // Refresh the entire stock list to ensure data consistency
        await fetchStocks()
      }
      setShowModal(false)
      setSelectedStock(null)
    } catch (error) {
      console.error('Error saving stock:', error)
      toast.error('Failed to save stock')
    }
  }

  // Add Quantity handlers
  const handleAddQuantity = (stock) => {
    setStockToModify(stock)
    setQuantityToAdd('')
    setShowAddQuantityModal(true)
  }

  const confirmAddQuantity = async () => {
    try {
      const quantity = parseInt(quantityToAdd)
      if (!quantity || quantity <= 0) {
        toast.error('Please enter a valid quantity')
        return
      }

      const newQuantity = (stockToModify.quantity || 0) + quantity
      await api.put(`/api/stock/${stockToModify.id}`, {
        ...stockToModify,
        quantity: newQuantity
      })
      
      toast.success(`Added ${quantity} items to ${stockToModify.productName || 'item'}`)
      // Refresh the entire stock list to ensure data consistency
      await fetchStocks()
      setShowAddQuantityModal(false)
      setStockToModify(null)
      setQuantityToAdd('')
    } catch (error) {
      console.error('Error adding quantity:', error)
      toast.error('Failed to add quantity')
    }
  }

  // Discard Quantity handlers
  const handleDiscardQuantity = (stock) => {
    setStockToModify(stock)
    setQuantityToDiscard('')
    setDiscardReason('')
    setShowDiscardModal(true)
  }

  const confirmDiscardQuantity = async () => {
    try {
      const quantity = parseInt(quantityToDiscard)
      if (!quantity || quantity <= 0) {
        toast.error('Please enter a valid quantity to discard')
        return
      }

      const currentQuantity = stockToModify.quantity || 0
      if (quantity > currentQuantity) {
        toast.error('Cannot discard more items than available in stock')
        return
      }

      if (!discardReason.trim()) {
        toast.error('Please provide a reason for discarding')
        return
      }

      const newQuantity = currentQuantity - quantity
      await api.put(`/api/stock/${stockToModify.id}`, {
        ...stockToModify,
        quantity: newQuantity
      })
      
      toast.success(`Discarded ${quantity} items from ${stockToModify.productName || 'item'} (Reason: ${discardReason})`)
      // Refresh the entire stock list to ensure data consistency
      await fetchStocks()
      setShowDiscardModal(false)
      setStockToModify(null)
      setQuantityToDiscard('')
      setDiscardReason('')
    } catch (error) {
      console.error('Error discarding quantity:', error)
      toast.error('Failed to discard quantity')
    }
  }

  const getStockStatus = (stock) => {
    const quantity = stock.quantity || 0
    const minStock = stock.minStock || 0
    if (quantity <= 0) return 'out-of-stock'
    if (minStock > 0 && quantity <= minStock) return 'low-stock'
    return 'in-stock'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-100 text-red-800'
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-stock':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'out-of-stock':
        return 'Out of Stock'
      case 'low-stock':
        return 'Low Stock'
      case 'in-stock':
        return 'In Stock'
      default:
        return 'Unknown'
    }
  }

  // Filter stocks based on search term and status
  const filteredStocks = Array.isArray(stocks) ? stocks.filter(stock => {
    const productName = stock.productName || ''
    const productCode = stock.productCode || ''
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const status = getStockStatus(stock)
    const matchesFilter = filterStatus === 'all' || status === filterStatus
    
    return matchesSearch && matchesFilter
  }) : []

  const exportToCSV = () => {
    const headers = ['Product Code', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Min Stock', 'Status']
    const csvData = filteredStocks.map(stock => [
      stock.productCode,
      stock.productName,
      stock.category,
      stock.quantity,
      stock.unitPrice,
      stock.minStock,
      getStatusText(getStockStatus(stock))
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Stock data exported successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your inventory and track stock levels
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={exportToCSV}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          {user?.role === 'admin' && (
            <button
              onClick={handleAddStock}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(stocks) ? stocks.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.isArray(stocks) ? stocks.filter(s => getStockStatus(s) === 'low-stock').length : 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.isArray(stocks) ? stocks.filter(s => getStockStatus(s) === 'out-of-stock').length : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No stock items found</p>
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const status = getStockStatus(stock)
                  return (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stock.productName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.productCode || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stock.quantity || 0} {stock.unit || 'pcs'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {stock.minStock || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(stock.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddQuantity(stock)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                            title="Add Quantity"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDiscardQuantity(stock)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50"
                            title="Discard Quantity"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          {/* Admin actions - Edit and Delete */}
                          {(user?.role === 'admin' || user?.role === 'Admin') && (
                            <>
                              <button
                                onClick={() => handleEditStock(stock)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                                title="Edit Stock"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStock(stock)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                title="Delete Stock"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Modal */}
      {showModal && (
        <StockModal
          stock={selectedStock}
          suppliers={suppliers}
          onSave={handleStockSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Stock Item"
          message={`Are you sure you want to delete "${stockToDelete?.productName}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}

      {/* Add Quantity Modal */}
      {showAddQuantityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Quantity</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Adding quantity to: <span className="font-medium">{stockToModify?.productName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Current quantity: {stockToModify?.quantity} {stockToModify?.unit}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity to add"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddQuantityModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddQuantity}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Quantity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Quantity Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Discard Quantity</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Discarding from: <span className="font-medium">{stockToModify?.productName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Current quantity: {stockToModify?.quantity} {stockToModify?.unit}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Discard *
                </label>
                <input
                  type="number"
                  min="1"
                  max={stockToModify?.quantity}
                  step="1"
                  value={quantityToDiscard}
                  onChange={(e) => setQuantityToDiscard(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter quantity to discard"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Discarding *
                </label>
                <select
                  value={discardReason}
                  onChange={(e) => setDiscardReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a reason</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Expired">Expired</option>
                  <option value="Stolen/Theft">Stolen/Theft</option>
                  <option value="Burned/Fire">Burned/Fire</option>
                  <option value="Lost">Lost</option>
                  <option value="Quality Issues">Quality Issues</option>
                  <option value="Returned">Returned</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDiscardModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDiscardQuantity}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stock