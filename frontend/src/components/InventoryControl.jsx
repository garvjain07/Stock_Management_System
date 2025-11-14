import React, { useState, useEffect } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Edit, 
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'
import api from '../utils/api'

const InventoryControl = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [adjustmentModal, setAdjustmentModal] = useState({ show: false, product: null, type: '' })
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stock')
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load inventory data')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100', priority: 3 }
    if (quantity <= minStock) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100', priority: 2 }
    if (quantity <= minStock * 2) return { status: 'Medium Stock', color: 'text-blue-600 bg-blue-100', priority: 1 }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100', priority: 0 }
  }

  const inventoryStats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0),
    outOfStock: products.filter(p => p.quantity <= 0).length,
    lowStock: products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length,
    alerts: products.filter(p => p.quantity <= p.minStock).length
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    switch (filterType) {
      case 'low-stock':
        matchesFilter = product.quantity <= product.minStock && product.quantity > 0
        break
      case 'out-of-stock':
        matchesFilter = product.quantity <= 0
        break
      case 'in-stock':
        matchesFilter = product.quantity > product.minStock
        break
      case 'all':
      default:
        matchesFilter = true
    }
    
    return matchesSearch && matchesFilter
  })

  const handleStockAdjustment = async (productId, adjustmentType, quantity, reason) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      let newQuantity = product.quantity
      switch (adjustmentType) {
        case 'add':
          newQuantity += parseInt(quantity)
          break
        case 'remove':
          newQuantity = Math.max(0, product.quantity - parseInt(quantity))
          break
        case 'set':
          newQuantity = parseInt(quantity)
          break
      }

      const response = await api.put(`/api/stock/${productId}`, {
        ...product,
        quantity: newQuantity
      })

      if (response.data?.success) {
        toast.success(`Stock ${adjustmentType === 'add' ? 'increased' : adjustmentType === 'remove' ? 'decreased' : 'updated'} successfully`)
        await fetchProducts()
        setAdjustmentModal({ show: false, product: null, type: '' })
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock levels')
    }
  }

  // Export Inventory Data to CSV
  const handleExportInventory = async () => {
    try {
      setExportLoading(true)
      toast.success('Starting inventory data export...')

      // Prepare CSV data
      const csvHeaders = [
        'Product Code',
        'Product Name', 
        'Category',
        'Current Stock',
        'Unit',
        'Unit Price (₹)',
        'Total Value (₹)',
        'Minimum Stock',
        'Stock Status',
        'Supplier',
        'Last Updated'
      ]

      let csvContent = csvHeaders.join(',') + '\n'

      // Add product data
      products.forEach(product => {
        const stockStatus = getStockStatus(product.quantity, product.minStock)
        const totalValue = product.quantity * product.unitPrice
        
        const row = [
          `"${product.productCode || ''}"`,
          `"${product.productName || ''}"`,
          `"${product.category || ''}"`,
          product.quantity || 0,
          `"${product.unit || ''}"`,
          product.unitPrice || 0,
          totalValue.toFixed(2),
          product.minStock || 0,
          `"${stockStatus.status}"`,
          `"${product.supplier || ''}"`,
          `"${product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : ''}"`
        ]
        csvContent += row.join(',') + '\n'
      })

      // Add summary information
      csvContent += '\n--- INVENTORY SUMMARY ---\n'
      csvContent += `Total Products,${inventoryStats.totalProducts}\n`
      csvContent += `Total Inventory Value,₹${inventoryStats.totalValue.toFixed(2)}\n`
      csvContent += `Out of Stock Items,${inventoryStats.outOfStock}\n`
      csvContent += `Low Stock Items,${inventoryStats.lowStock}\n`
      csvContent += `Total Alerts,${inventoryStats.alerts}\n`
      csvContent += `Export Date,"${new Date().toLocaleString()}"\n`

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      const timestamp = new Date().toISOString().slice(0, -5).replace(/[:.]/g, '-')
      link.setAttribute('download', `inventory-report-${timestamp}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`✅ Inventory data exported successfully! (${products.length} products)`)
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export inventory data. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const StockAdjustmentModal = () => {
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    
    if (!adjustmentModal.show || !adjustmentModal.product) return null

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!quantity || parseInt(quantity) <= 0) {
        toast.error('Please enter a valid quantity')
        return
      }
      handleStockAdjustment(adjustmentModal.product.id, adjustmentModal.type, quantity, reason)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {adjustmentModal.type === 'add' ? 'Increase Stock' : 
             adjustmentModal.type === 'remove' ? 'Decrease Stock' : 'Set Stock Level'}
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Product: {adjustmentModal.product.productName}</p>
            <p className="text-sm text-gray-600">Current Stock: {adjustmentModal.product.quantity} {adjustmentModal.product.unit}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for adjustment..."
                rows="3"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setAdjustmentModal({ show: false, product: null, type: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Control</h2>
          <p className="text-gray-600">Monitor and manage your inventory levels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchProducts}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportInventory}
            disabled={exportLoading || loading}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {exportLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'adjustments', name: 'Stock Adjustments', icon: Edit },
            { id: 'alerts', name: 'Alerts', icon: AlertTriangle, badge: inventoryStats.alerts }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{inventoryStats.totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats.outOfStock}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveView('adjustments')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">Stock Adjustments</h4>
                <p className="text-sm text-gray-600 mt-1">Manually adjust inventory levels</p>
              </button>
              
              <button
                onClick={() => setActiveView('alerts')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">View Alerts</h4>
                <p className="text-sm text-gray-600 mt-1">Check low stock and critical items</p>
              </button>
              
              <button
                onClick={() => toast.success('Reorder feature coming soon!')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <h4 className="font-medium text-gray-900">Auto Reorder</h4>
                <p className="text-sm text-gray-600 mt-1">Set up automatic reorder points</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Stock Adjustments Tab */}
      {activeView === 'adjustments' && (
        <>
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 form-input w-full"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-input sm:w-48"
              >
                <option value="all">All Products</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="in-stock">In Stock</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
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
                  {filteredProducts.map((product) => {
                    const stockInfo = getStockStatus(product.quantity, product.minStock)
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500">{product.productCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.quantity} {product.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            Min: {product.minStock} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockInfo.color}`}>
                            {stockInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setAdjustmentModal({ show: true, product, type: 'add' })}
                              className="text-green-600 hover:text-green-900"
                              title="Increase Stock"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setAdjustmentModal({ show: true, product, type: 'remove' })}
                              className="text-red-600 hover:text-red-900"
                              title="Decrease Stock"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setAdjustmentModal({ show: true, product, type: 'set' })}
                              className="text-blue-600 hover:text-blue-900"
                              title="Set Stock Level"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Alerts Tab */}
      {activeView === 'alerts' && (
        <div className="space-y-6">
          {/* Critical Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
              <p className="text-sm text-gray-600">Items requiring immediate attention</p>
            </div>
            <div className="divide-y divide-gray-200">
              {products
                .filter(p => p.quantity <= p.minStock)
                .sort((a, b) => getStockStatus(a.quantity, a.minStock).priority - getStockStatus(b.quantity, b.minStock).priority)
                .map((product) => {
                  const stockInfo = getStockStatus(product.quantity, product.minStock)
                  return (
                    <div key={product.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-4 ${
                          stockInfo.priority === 3 ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            stockInfo.priority === 3 ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{product.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {product.quantity} {product.unit} remaining 
                            {product.quantity <= 0 ? ' (Out of Stock)' : ` (Below minimum: ${product.minStock})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setAdjustmentModal({ show: true, product, type: 'add' })}
                          className="btn-primary text-sm"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  )
                })}
              
              {products.filter(p => p.quantity <= p.minStock).length === 0 && (
                <div className="p-6 text-center">
                  <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">All Good!</h3>
                  <p className="text-gray-600">No inventory alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal />
    </div>
  )
}

export default InventoryControl