import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  ShoppingCart,
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Bills = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Helper function to check if user can edit bills
  const canEditBills = () => {
    return user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'Manager'
  }
  
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [billToDelete, setBillToDelete] = useState(null)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bills')
      console.log('Bills API response:', response.data)
      
      // Handle backend response format {success: true, data: [...]}
      let billsData = response.data
      if (billsData && typeof billsData === 'object' && billsData.data) {
        billsData = billsData.data
      }
      
      // Ensure bills is always an array
      const safeBills = Array.isArray(billsData) ? billsData : []
      console.log('Bills loaded:', safeBills.length, 'bills')
      setBills(safeBills)
    } catch (error) {
      console.error('Error fetching bills:', error)
      setBills([]) // Set safe default
      toast.error('Failed to load bills')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBill = () => {
    navigate('/bills/create')
  }

  const handleViewBill = (bill) => {
    navigate(`/bills/${bill.id}/edit`)
  }

  const handleEditBill = (bill) => {
    navigate(`/bills/${bill.id}/edit`)
  }

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/bills/${billToDelete.id}`)
      const safeBills = Array.isArray(bills) ? bills : []
      setBills(safeBills.filter(b => b.id !== billToDelete.id))
      toast.success('Bill deleted successfully')
      setShowDeleteDialog(false)
      setBillToDelete(null)
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast.error('Failed to delete bill')
    }
  }

  const handleDownloadPDF = async (bill) => {
    try {
      console.log('Attempting to download PDF for bill:', bill)
      toast.loading('Generating bill PDF...', { id: 'pdf-loading' })
      
      const response = await api.get(`/api/bills/${bill.id}/pdf`)
      
      // Create a blob from the HTML content and download it
      const htmlContent = response.data
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${bill.billNumber}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Also open in new window for immediate viewing/printing
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlContent)
        newWindow.document.close()
        toast.success(`Bill ${bill.billNumber} downloaded and opened for printing!`, { id: 'pdf-loading' })
      } else {
        toast.success(`Bill ${bill.billNumber} downloaded! Check your downloads folder.`, { id: 'pdf-loading' })
      }
    } catch (error) {
      console.error('Error generating bill:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      let errorMessage = 'Failed to generate bill'
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Bill not found'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage, { id: 'pdf-loading' })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateTaxAmount = (bill) => {
    if (!bill || !bill.tax || bill.tax <= 0) return 0
    
    // Calculate tax amount based on post-discount subtotal
    const subtotal = bill.subtotal || 0
    const discountPercent = bill.discount || 0
    const discountAmount = (subtotal * discountPercent) / 100
    const postDiscountAmount = subtotal - discountAmount
    const taxAmount = (postDiscountAmount * bill.tax) / 100
    
    return taxAmount
  }

  // Filter bills based on search term and status
  const safeBills = Array.isArray(bills) ? bills : []
  const filteredBills = safeBills.filter(bill => {
    if (!bill) return false
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    // If search term looks like a bill number (contains "bill" or starts with numbers), do exact matching
    const isBillNumberSearch = searchLower.includes('bill') || /^\d/.test(searchLower)
    
    const matchesSearch = searchTerm === '' || 
      (isBillNumberSearch 
        ? (bill.billNumber?.toLowerCase() || '').includes(searchLower) ||
          (bill.billNumber?.toLowerCase() || '').endsWith(searchLower.replace('bill-', '').replace('bill', ''))
        : (bill.billNumber?.toLowerCase() || '').includes(searchLower) ||
          (bill.customerName?.toLowerCase() || '').includes(searchLower) ||
          (bill.Customer?.name?.toLowerCase() || '').includes(searchLower) ||
          (bill.Customer?.phone || '').includes(searchTerm))
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    totalBills: safeBills.length,
    totalAmount: safeBills.reduce((sum, bill) => sum + (bill?.totalAmount || 0), 0),
    paidBills: safeBills.filter(b => b?.status === 'paid').length
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
          <h1 className="text-2xl font-bold text-gray-900">Bills & Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage customer bills and generate invoices
          </p>
        </div>
        
        <button
          onClick={handleCreateBill}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Bills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidBills}</p>
            </div>
          </div>
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
                placeholder="Search by bill number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {!Array.isArray(filteredBills) || filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No bills found</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, index) => (
                  <tr key={`${bill.id}-${bill.billNumber}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bill.billNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bill.items?.length || 0} {bill.items?.length === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bill.customerName || 'Walk-in Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bill.Customer?.phone || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bill.billDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(bill.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tax: {bill.tax > 0 ? formatCurrency(calculateTaxAmount(bill)) : '₹0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Bill"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(bill)}
                          className="text-green-600 hover:text-green-900"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {canEditBills() && (
                          <>
                            <button
                              onClick={() => handleEditBill(bill)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Bill"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Bill"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Bill"
          message={`Are you sure you want to delete bill "${billToDelete?.billNumber}"? This action cannot be undone and will restore the stock quantities.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}
    </div>
  )
}

export default Bills