import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Package, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings,
  X,
  Store,
  ShoppingCart,
  UserCheck,
  Phone,
  FileText,
  DollarSign,
  Briefcase,
  TrendingUp,
  LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, isAdmin, logout } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Sales',
      href: '/bills',
      icon: ShoppingCart,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Stocks',
      href: '/stock',
      icon: Package,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Insightful',
      href: '/insightful',
      icon: TrendingUp,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Phone,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: UserCheck,
      roles: ['admin', 'Admin'] // Only admins can access employee management
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Income',
      href: '/income',
      icon: DollarSign,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Manage',
      href: '/manage',
      icon: Briefcase,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Settings',
      href: '/profile',
      icon: Settings,
      roles: ['admin', 'cashier', 'Admin', 'Cashier']
    },
    {
      name: 'Logout',
      href: '#',
      icon: LogOut,
      roles: ['admin', 'cashier', 'Admin', 'Cashier'],
      isLogout: true
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role) || item.roles.includes(user?.role?.toLowerCase())
  )

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold text-white">
              StockMS
            </span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              
              return (
                <li key={item.name}>
                  {item.isLogout ? (
                    <button
                      onClick={() => {
                        logout()
                        onClose()
                      }}
                      className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                    >
                      <item.icon className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={clsx(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'mr-3 h-5 w-5 transition-colors duration-200',
                          isActive
                            ? 'text-primary-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Sidebar