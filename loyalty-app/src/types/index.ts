export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  pointsBalance: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  joinDate: string
  preferences: {
    notifications: boolean
    theme: 'light' | 'dark'
    language: string
  }
}

export interface Transaction {
  id: string
  userId: string
  type: 'earn' | 'spend'
  amount: number
  description: string
  source: 'purchase' | 'referral' | 'reward' | 'social_media' | 'bonus'
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

export interface Reward {
  id: string
  name: string
  description: string
  pointsRequired: number
  category: 'gift_cards' | 'discounts' | 'experiences' | 'merchandise'
  imageUrl: string
  availability: number
  expirationDate?: string
  redemptionInstructions: string
  featured: boolean
}

export interface UserReward {
  id: string
  userId: string
  rewardId: string
  redemptionDate: string
  status: 'redeemed' | 'expired' | 'used'
  pointsSpent: number
  reward: Reward
}

export interface SocialMediaPost {
  postId: string
  postUrl: string
  message: string
  score: number
  img: string
}

export interface SocialMediaAccount {
  id: string
  userId: string
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin'
  handle: string
  displayName: string
  profileImageUrl: string
  verified: boolean
  connectedDate: string
  lastSyncDate: string
  isActive: boolean
  permissions: string[]
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshSession?: () => Promise<void>
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  duration?: number
  onClose?: () => void
}