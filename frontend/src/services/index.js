import api from './api'

// Authentication service
export const authService = {
  // Login user
  login: async (credentials) => {
    console.log('🌐 Making API call to /auth/login with:', credentials);
    try {
      const response = await api.post('/auth/login', credentials)
      console.log('📡 API response status:', response.status);
      console.log('📦 API response data:', response.data);
      return response.data
    } catch (error) {
      console.error('🚨 API call failed:', error);
      throw error;
    }
  },

  // Register user (Admin only)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  }
}

// User management service
export const userService = {
  // Get all users (Admin only)
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },

  // Get user by ID (Admin only)
  getById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Create new user (Admin only)
  create: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user (Admin only)
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Toggle user status (Admin only)
  toggleStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive })
    return response.data
  },

  // Delete user (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/users/stats')
    return response.data
  }
}

// Stock service
export const stockService = {
  // Get all stock items
  getAll: async (params = {}) => {
    const response = await api.get('/stock', { params })
    return response.data
  },

  // Get stock item by ID
  getById: async (id) => {
    const response = await api.get(`/stock/${id}`)
    return response.data
  },

  // Create stock item
  create: async (stockData) => {
    const response = await api.post('/stock', stockData)
    return response.data
  },

  // Update stock item
  update: async (id, stockData) => {
    const response = await api.put(`/stock/${id}`, stockData)
    return response.data
  },

  // Delete stock item
  delete: async (id) => {
    const response = await api.delete(`/stock/${id}`)
    return response.data
  },

  // Update stock quantity
  updateQuantity: async (id, quantityData) => {
    const response = await api.patch(`/stock/${id}/quantity`, quantityData)
    return response.data
  },

  // Get low stock items
  getLowStock: async (limit = 50) => {
    const response = await api.get('/stock/low-stock', { params: { limit } })
    return response.data
  },

  // Get expired stock items
  getExpiredStock: async (limit = 50) => {
    const response = await api.get('/stock/expired', { params: { limit } })
    return response.data
  },

  // Get stock categories
  getCategories: async () => {
    const response = await api.get('/stock/categories')
    return response.data
  }
}

// Bill service
export const billService = {
  // Get all bills
  getAll: async (params = {}) => {
    const response = await api.get('/bills', { params })
    return response.data
  },

  // Get bill by ID
  getById: async (id) => {
    const response = await api.get(`/bills/${id}`)
    return response.data
  },

  // Create bill
  create: async (billData) => {
    const response = await api.post('/bills', billData)
    return response.data
  },

  // Update bill payment
  updatePayment: async (id, paymentData) => {
    const response = await api.patch(`/bills/${id}/payment`, paymentData)
    return response.data
  },

  // Cancel bill
  cancel: async (id, reason) => {
    const response = await api.patch(`/bills/${id}/cancel`, { reason })
    return response.data
  },

  // Get bill statistics
  getStats: async (params = {}) => {
    const response = await api.get('/bills/stats', { params })
    return response.data
  }
}

// Supplier service
export const supplierService = {
  // Get all suppliers
  getAll: async (params = {}) => {
    const response = await api.get('/suppliers', { params })
    return response.data
  },

  // Get supplier by ID
  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`)
    return response.data
  },

  // Create supplier
  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData)
    return response.data
  },

  // Update supplier
  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData)
    return response.data
  },

  // Delete supplier
  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`)
    return response.data
  },

  // Get supplier statistics
  getStats: async (id) => {
    const response = await api.get(`/suppliers/${id}/stats`)
    return response.data
  }
}