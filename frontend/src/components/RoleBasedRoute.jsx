import React, { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  const toastShown = useRef(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user's role is in the allowed roles list
  const userRole = user.role?.toLowerCase()
  const hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole)

  if (!hasAccess) {
    // Show toast notification only once
    if (!toastShown.current) {
      toast.error('You do not have permission to access this page')
      toastShown.current = true
    }
    // Redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleBasedRoute
