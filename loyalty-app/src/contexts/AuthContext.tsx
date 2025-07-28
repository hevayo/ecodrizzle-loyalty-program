import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthContextType } from '../types'
import { apiClient } from '../api/apiClient'
import Cookies from 'js-cookie'
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get('userinfo');

        if (token) {
          const decodedToken: any = jwtDecode(token)
          if (decodedToken) {
            // Extract user data from JWT payload
            const userData: User = {
              email: decodedToken.email,
              name: decodedToken.name,
              pointsBalance: 0,
              id: decodedToken.email,
              joinDate: '',
              preferences: {
                notifications: true,
                theme: 'light',
                language: 'en'
              },
              tier: 'Bronze', // Default tier, can be updated later
              avatar: ''
            }
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        Cookies.remove('userinfo')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async () => {
    setIsLoading(true)
    try {
      window.location.href = '/auth/login' // Redirect to login page
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove('userinfo')
    window.location.href = '/auth/logout' // Redirect to logout page
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}