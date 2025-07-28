import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthContextType } from '../types'
import Cookies from 'js-cookie'

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
        // Check for userinfo cookie first (Choreo managed auth)
        const userinfoToken = Cookies.get('userinfo')
        
        if (userinfoToken) {
          // Fetch user info from Choreo's managed auth endpoint
          try {
            const response = await fetch('/auth/userinfo', {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              }
            })
            
            if (response.ok) {
              const userInfo = await response.json()
              const userData: User = {
                id: userInfo.sub || userInfo.email,
                email: userInfo.email,
                name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name || userInfo.email,
                avatar: userInfo.picture || '',
                pointsBalance: 0, // Will be fetched from API
                tier: 'Bronze', // Default tier
                joinDate: new Date().toISOString(),
                preferences: {
                  notifications: true,
                  theme: 'light',
                  language: 'en'
                }
              }
              setUser(userData)
            } else {
              // If userinfo endpoint fails, clear the cookie
              Cookies.remove('userinfo')
            }
          } catch (fetchError) {
            console.error('Failed to fetch user info:', fetchError)
            Cookies.remove('userinfo')
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
    // Redirect to Choreo managed auth login endpoint
    window.location.href = '/auth/login'
  }

  const logout = () => {
    // Get session_hint cookie for proper logout
    const sessionHint = Cookies.get('session_hint')
    
    // Clear user state
    setUser(null)
    
    // Redirect to Choreo managed auth logout endpoint
    if (sessionHint) {
      window.location.href = `/auth/logout?session_hint=${sessionHint}`
    } else {
      window.location.href = '/auth/logout'
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const refreshSession = async () => {
    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        // Session refreshed successfully, re-initialize auth
        const userinfoToken = Cookies.get('userinfo')
        if (userinfoToken) {
          const userInfoResponse = await fetch('/auth/userinfo', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          })
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json()
            const userData: User = {
              id: userInfo.sub || userInfo.email,
              email: userInfo.email,
              name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name || userInfo.email,
              avatar: userInfo.picture || '',
              pointsBalance: user?.pointsBalance || 0,
              tier: user?.tier || 'Bronze',
              joinDate: user?.joinDate || new Date().toISOString(),
              preferences: user?.preferences || {
                notifications: true,
                theme: 'light',
                language: 'en'
              }
            }
            setUser(userData)
          }
        }
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshSession,
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