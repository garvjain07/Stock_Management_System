import React, { useState, useEffect } from 'react'
import { X, ShoppingCart, Calendar, User, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

const BillsModal = ({ isOpen, onClose }) => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('date') // 'date', 'amount', 'customer'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      fetchBills()
    }
  }, [isOpen])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bills')
      const billsData = response.data.data || response.data
      setBills(Array.isArray(billsData) ? billsData : [])
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBill = (billId) => {
    onClose()
    navigate(`/bills/${billId}/edit`)
  }

  const sortedBills = [...bills].sort((a, b) => {
    let compareValue = 0
    
    switch (sortBy) {
      case 'date':
        compareValue = new Date(a.billDate) - new Date(b.billDate)
        break
      case 'amount':
        compareValue = (a.totalAmount || 0) - (b.totalAmount || 0)
        break
      case 'customer':
        compareValue = (a.customerName || '').localeCompare(b.customerName || '')
        break
      default:
        compareValue = 0
    }
    
    return sortOrder === 'desc' ? -compareValue : compareValue
  })

  const totalAmount = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">All Bills</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary and Sort Controls */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-purple-600">{bills.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="customer">Sort by Customer</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bills found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBills.map((bill) => (
                <div
                  key={bill.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {bill.billNumber}
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {bill.status || 'Paid'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(bill.billDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{bill.customerName || 'Walk-in Customer'}</span>
                        </div>
                        
                        <div>
                          <span className="text-green-600 font-medium">
                            ₹{(bill.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">
                            {(bill.items || []).length} items
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewBill(bill.id)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Bill"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillsModal