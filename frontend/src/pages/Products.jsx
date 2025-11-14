import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Star,
  Tag,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import StockModal from '../components/StockModal'
import api from '../utils/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/stock')
      console.log('Products data:', response.data)
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProducts(response.data.data)
      } else {
        console.error('Invalid products data structure:', response.data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/api/suppliers')
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSuppliers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      // Don't show error toast for suppliers as it's not critical
    }
  }

  const categories = [...new Set(products.map(product => product.category))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' }
    if (quantity <= minStock) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  const handleEditProduct = (product) => {
    console.log('Editing product:', product)
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
  }

  const handleSaveProduct = async (productData) => {
    try {
      console.log('Saving product:', productData)
      let response
      
      if (selectedProduct) {
        // Update existing product
        response = await api.put(`/api/stock/${selectedProduct.id}`, productData)
        toast.success('Product updated successfully!')
      } else {
        // Create new product
        response = await api.post('/api/stock', productData)
        toast.success('Product created successfully!')
      }
      
      // Refresh products list
      await fetchProducts()
      handleCloseModal()
      
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save product'
      toast.error(errorMessage)
      throw error // Re-throw so the form doesn't close on error
    }
  }

  const ProductCard = ({ product }) => {
    const stockInfo = getStockStatus(product.quantity, product.minStock)
    
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {/* Product Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <Package className="h-16 w-16 text-blue-400" />
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.productName}
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                {product.productCode}
              </p>
            </div>
            <div className="ml-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockInfo.color}`}>
                {stockInfo.status}
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center mb-2">
            <Tag className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">{product.category}</span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 mb-3" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.description}
            </p>
          )}

          {/* Stock Info */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-500">Stock:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {product.quantity} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Min Stock:</span>
              <span className="ml-1 font-semibold text-gray-900">
                {product.minStock} {product.unit}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.unitPrice?.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">per {product.unit}</span>
          </div>

          {/* Supplier Info */}
          {product.supplier && (
            <div className="mb-4 p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-500">Supplier:</span>
              <p className="text-sm font-medium text-gray-700">{product.supplier.name}</p>
            </div>
          )}

          {/* Stock Alert */}
          {product.quantity <= product.minStock && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-xs text-yellow-700">
                  {product.quantity <= 0 ? 'Out of stock!' : 'Stock running low!'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditProduct(product)}
              className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage your product inventory
          </p>
        </div>
        
        <button
          onClick={handleAddProduct}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.quantity > p.minStock).length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.quantity <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
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

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input w-full"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Package className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Products ({filteredProducts.length})
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <StockModal
          stock={selectedProduct}
          suppliers={suppliers}
          onSave={handleSaveProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Products