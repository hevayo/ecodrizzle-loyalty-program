import type { User, Transaction, Reward, SocialMediaPost, SocialMediaAccount } from '../types'
import { getApiConfig } from '../config/api'

const config = getApiConfig()


// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers)
    existingHeaders.forEach((value, key) => {
      headers[key] = value
    })
  }



  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for Choreo managed auth
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (config.debug) {
      console.log(`API Response: ${config.baseUrl}${endpoint}`, data)
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (config.debug) {
      console.error(`API Error: ${config.baseUrl}${endpoint}`, error)
    }
    throw error
  }
}

export const apiClient = {
  // Note: Login is handled by Choreo managed auth via /auth/login redirect
  // No need for manual login API call

  async getCurrentUser(): Promise<User> {
    const response = await apiRequest('/users/profile')
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to get user')
  },

  // Points and Transactions
  async getPointsBalance(): Promise<number> {
    const response = await apiRequest('/points/balance')
    if (response.success) {
      return response.data.currentAvailablePoints
    }
    throw new Error(response.message || 'Failed to get points balance')
  },

  async getTransactions(page = 1, limit = 10): Promise<Transaction[]> {
    const response = await apiRequest(`/points/transactions?page=${page}&limit=${limit}`)
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to get transactions')
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const response = await apiRequest('/rewards')
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to get rewards')
  },

  async redeemReward(rewardId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
    })
    if (response.success) {
      return {
        success: true,
        message: response.data.message || 'Reward redeemed successfully!',
      }
    }
    throw new Error(response.message || 'Failed to redeem reward')
  },

  // Social Media
  async getSocialMediaPosts(): Promise<SocialMediaPost[]> {
    const response = await apiRequest('/social-media/posts')
    // API returns array directly, not wrapped in success structure
    if (Array.isArray(response)) {
      return response.map(post => ({
        postUrl: `https://facebook.com/${post.postId}`, // Generate URL from postId
        postId: post.postId,
        message: post.message,
        score: post.score,
        img: post.img,
      }))
    }
    // Fallback for wrapped response format
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to get social media posts')
  },

  async getSocialMediaAccounts(): Promise<SocialMediaAccount[]> {
    const response = await apiRequest('/social-media/accounts')
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to get social media accounts')
  },

  async claimSocialMediaPoints(userId: string, email: string): Promise<{ success: boolean; pointsEarned: number }> {
    const response = await apiRequest('/social-media/claim', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
    })
    if (response.success) {
      return {
        success: true,
        pointsEarned: response.data.pointsEarned,
      }
    }
    throw new Error(response.message || 'Failed to claim social media points')
  },

  // User Profile
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const response = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    if (response.success) {
      return response.data
    }
    throw new Error(response.message || 'Failed to update user profile')
  },
}