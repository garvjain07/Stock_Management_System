import api from './api'

// Settings service for handling all settings-related API calls and localStorage operations

// Profile/User settings API calls
export const settingsService = {
  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile')
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.newPassword // Backend expects confirmPassword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password')
    }
  },

  // System settings - stored in localStorage
  getSystemSettings() {
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      autoBackup: true,
      sessionTimeout: 30
    }

    try {
      const savedSettings = localStorage.getItem('systemSettings')
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
    } catch (error) {
      console.error('Error loading system settings:', error)
      return defaultSettings
    }
  },

  saveSystemSettings(settings) {
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Error saving system settings:', error)
      throw new Error('Failed to save system settings')
    }
  },

  // Notification settings - stored in localStorage (could be moved to backend)
  getNotificationSettings() {
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: true,
      lowStockAlerts: true,
      salesReports: true,
      systemUpdates: false
    }

    try {
      const savedSettings = localStorage.getItem('notificationSettings')
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
    } catch (error) {
      console.error('Error loading notification settings:', error)
      return defaultSettings
    }
  },

  saveNotificationSettings(settings) {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Error saving notification settings:', error)
      throw new Error('Failed to save notification settings')
    }
  },

  // Security settings - stored in localStorage
  getSecuritySettings() {
    const defaultSettings = {
      twoFactorEnabled: false
    }

    try {
      const savedSettings = localStorage.getItem('securitySettings')
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
    } catch (error) {
      console.error('Error loading security settings:', error)
      return defaultSettings
    }
  },

  saveSecuritySettings(settings) {
    try {
      localStorage.setItem('securitySettings', JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Error saving security settings:', error)
      throw new Error('Failed to save security settings')
    }
  },

  // Apply theme to document
  applyTheme(theme) {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (theme === 'system') {
        // Follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  },

  // Initialize settings on app load
  initializeSettings() {
    const systemSettings = this.getSystemSettings()
    this.applyTheme(systemSettings.theme)
    
    // Apply other settings if needed
    if (systemSettings.language && systemSettings.language !== 'en') {
      // Set document language
      document.documentElement.lang = systemSettings.language
    }
  }
}

export default settingsService