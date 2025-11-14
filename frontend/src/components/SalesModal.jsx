import React, { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

const SalesModal = ({ isOpen, onClose }) => {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (isOpen) {
      fetchSalesData()
    }
  }, [isOpen, selectedYear])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      // Fetch bills data and calculate monthly sales
      const response = await api.get('/api/bills')
      const bills = response.data.data || response.data
      
      // Group bills by month for the selected year
      const monthlySales = {}
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      
      // Initialize all months with 0
      months.forEach((month, index) => {
        monthlySales[month] = {
          month: month,
          monthIndex: index,
          totalSales: 0,
          billCount: 0,
          averageValue: 0
        }
      })
      
      // Calculate sales for each month
      bills.forEach(bill => {
        const billDate = new Date(bill.billDate)
        if (billDate.getFullYear() === selectedYear) {
          const monthName = months[billDate.getMonth()]
          monthlySales[monthName].totalSales += bill.totalAmount || 0
          monthlySales[monthName].billCount += 1
        }
      })
      
      // Calculate average values
      Object.values(monthlySales).forEach(monthData => {
        if (monthData.billCount > 0) {
          monthData.averageValue = monthData.totalSales / monthData.billCount
        }
      })
      
      setSalesData(Object.values(monthlySales))
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalYearSales = salesData.reduce((sum, month) => sum + month.totalSales, 0)
  const totalBills = salesData.reduce((sum, month) => sum + month.billCount, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Monthly Sales Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Year Selector */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Sales {selectedYear}</p>
              <p className="text-2xl font-bold text-green-600">₹{totalYearSales.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{totalBills} bills</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {salesData.map((monthData) => (
                <div
                  key={monthData.month}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      {monthData.month}
                    </h3>
                    {monthData.totalSales > 0 && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className={`text-lg font-semibold ${
                        monthData.totalSales > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        ₹{monthData.totalSales.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Bills Count</p>
                      <p className="text-sm font-medium text-gray-900">
                        {monthData.billCount}
                      </p>
                    </div>
                    
                    {monthData.billCount > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Avg. Bill Value</p>
                        <p className="text-sm font-medium text-blue-600">
                          ₹{Math.round(monthData.averageValue).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {monthData.totalSales === 0 && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
                      No sales this month
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

export default SalesModal