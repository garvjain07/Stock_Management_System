import React, { createContext, useContext, useReducer, useEffect } from 'react'
import Cookies from 'js-cookie'
import { authService } from '../services'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from cookies on app start
  useEffect(() => {
    const token = Cookies.get('token')
    const user = Cookies.get('user')

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: { user: userData, token }
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        Cookies.remove('token')
        Cookies.remove('user')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      console.log('🔐 Attempting login with:', credentials);
      const response = await authService.login(credentials)
      console.log('✅ Login response received:', response);
      
      const { user, token } = response

      // Store in cookies
      Cookies.set('token', token, { expires: 7 }) // 7 days
      Cookies.set('user', JSON.stringify(user), { expires: 7 })

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      })

      toast.success('Login successful!')
      return response

    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage
      })
      toast.error(errorMessage)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear cookies and state
      Cookies.remove('token')
      Cookies.remove('user')
      
      // Clear any localStorage items
      localStorage.clear()
      
      // Clear session storage
      sessionStorage.clear()
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      toast.success('Logged out successfully')
      
      // Force navigation to login page and replace history
      window.history.replaceState(null, '', '/login')
    }
  }

  // Update user profile
  const updateUser = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      const updatedUser = response.data

      // Update cookies
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 })

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser
      })

      toast.success('Profile updated successfully!')
      return response

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData)
      toast.success('Password changed successfully!')
      return response

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Check if user has required role
  const hasRole = (role) => {
    return state.user?.role === role
  }

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin')
  }

  // Check if user is cashier
  const isCashier = () => {
    return hasRole('cashier') || hasRole('admin')
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    changePassword,
    clearError,
    hasRole,
    isAdmin,
    isCashier
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext