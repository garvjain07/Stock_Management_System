import React from 'react'
import { Clock, Package, ShoppingCart, Users, DollarSign } from 'lucide-react'

const RecentActivities = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'stock':
        return Package
      case 'bill':
        return ShoppingCart
      case 'customer':
        return Users
      case 'sale':
        return DollarSign
      default:
        return Clock
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'stock':
        return 'text-blue-500 bg-blue-100'
      case 'bill':
        return 'text-green-500 bg-green-100'
      case 'customer':
        return 'text-purple-500 bg-purple-100'
      case 'sale':
        return 'text-yellow-500 bg-yellow-100'
      default:
        return 'text-gray-500 bg-gray-100'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Check if it's the same day
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return 'Today'
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    
    if (isYesterday) {
      return 'Yesterday'
    }
    
    // For older dates, show days ago
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    return `${diffInDays}d ago`
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
      </div>
      
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivities