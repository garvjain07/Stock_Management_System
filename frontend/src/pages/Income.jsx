import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, BarChart3, RefreshCw, Activity } from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

const Income = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [incomeData, setIncomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchIncomeData()
  }, [selectedPeriod])

  const fetchIncomeData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/income?period=${selectedPeriod}`)
      console.log('Income data:', response.data)
      
      if (response.data?.success) {
        setIncomeData(response.data.data)
      } else {
        throw new Error('Invalid income data format')
      }
    } catch (error) {
      console.error('Error fetching income data:', error)
      toast.error('Failed to load income data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchIncomeData()
    setRefreshing(false)
    toast.success('Income data refreshed!')
  }

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!incomeData) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No income data available</p>
        <button
          onClick={fetchIncomeData}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income Overview</h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Activity className="h-4 w-4 text-green-500 mr-1" />
            Real-time revenue and financial performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="form-input py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Income Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(incomeData.totalIncome || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Period</p>
              <p className="text-sm font-medium text-gray-700">
                {selectedPeriod === 'daily' ? 'Today' :
                 selectedPeriod === 'weekly' ? 'Last 7 Days' :
                 selectedPeriod === 'monthly' ? 'Last 30 Days' : 'Last Year'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{incomeData.totalTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(incomeData.averageTransaction || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Selected Period</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{incomeData.period || selectedPeriod}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Revenue per Day</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{((incomeData.totalIncome || 0) / (selectedPeriod === 'daily' ? 1 : selectedPeriod === 'weekly' ? 7 : selectedPeriod === 'monthly' ? 30 : 365)).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Period</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{selectedPeriod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income Chart */}
      {incomeData.chartData && incomeData.chartData.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Income Trend</h3>
            <span className="text-sm text-gray-500">Period: {incomeData.period || selectedPeriod}</span>
          </div>
          <div className="space-y-4">
            {incomeData.chartData.map((data, index) => {
              const maxAmount = Math.max(...incomeData.chartData.map(m => m.amount || 0));
              const widthPercentage = maxAmount > 0 ? ((data.amount || 0) / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-24">{data.label || data.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(data.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No income data available for the selected period</p>
          </div>
        </div>
      )}

      {/* Period Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Period Summary</h3>
          <span className="text-sm text-gray-500">{incomeData.period || selectedPeriod}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(incomeData.totalIncome || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomeData.totalTransactions || 0}
              </p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-500" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Avg. Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(incomeData.averageTransaction || 0).toLocaleString()}
              </p>
            </div>
            <Activity className="h-10 w-10 text-purple-500" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {incomeData.period || selectedPeriod}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Income