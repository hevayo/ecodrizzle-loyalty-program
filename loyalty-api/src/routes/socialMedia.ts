import express from 'express'
import { ApiResponse, SocialMediaPost } from '../types'
import { facebook } from '../config'
import { getUsersPostEligibleForPoints, getPostMetadata } from '../services/facebookApi'
import { getUserFbID, getNewPosts } from '../services/campaignDb'
import { getScoreForPosts } from '../services/scoreAPI'

const router = express.Router()

interface SocialMediaAccount {
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

const mockPosts: SocialMediaPost[] = [
  {
    id: '1',
    userId: '1',
    platform: 'facebook',
    postUrl: 'https://facebook.com/post/123',
    postId: 'fb_123',
    content: 'Just tried the amazing new EcoDrizzle products! Love the sustainable packaging and great quality. #EcoDrizzle #Sustainable',
    engagement: {
      likes: 45,
      shares: 12,
      comments: 8,
      views: 230,
    },
    postDate: '2024-01-20T10:30:00Z',
    status: 'approved',
    pointsEarned: 150,
    pointsClaimed: false,
    createdAt: '2024-01-20T10:35:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
  },
]

const mockAccount: SocialMediaAccount = {
  id: '1',
  userId: '1',
  platform: 'facebook',
  handle: '@alexjohnson',
  displayName: 'Alex Johnson',
  profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  verified: false,
  connectedDate: '2023-12-01T00:00:00Z',
  lastSyncDate: '2024-01-20T12:00:00Z',
  isActive: true,
  permissions: ['read_posts', 'read_engagement'],
}

// Get social media accounts
router.get('/accounts', (req, res) => {
  const response: ApiResponse<SocialMediaAccount[]> = {
    success: true,
    message: 'Social media accounts retrieved successfully',
    data: [mockAccount],
    timestamp: new Date().toISOString()
  }
  res.json(response)
})

// Get social media posts which are eligible for points
router.get('/posts', async (req, res) => {
  const userId = await getUserFbID("priyanga8312@gmail.com");
  if (!userId) {
    return return404(res, 'No Facebook user mapping found for the given email');
  }
  // Get all posts for the page
  const posts = await getUsersPostEligibleForPoints(facebook.pageId, userId);

  // find new posts
  const newPosts = await getNewPosts(posts);

  // Get post metadata from facebook graph api
  const postMetadata = await getPostMetadata(newPosts);

  // Get points for each post
  //@ts-ignore
  const points = await getScoreForPosts(postMetadata);

  // merge post metadata with points
  const postsWithPoints = posts.map((post, index) => ({
    ...post,
    pointsEarned: points[index]
  }));

  const response: ApiResponse<SocialMediaPost[]> = {
    success: true,
    message: 'Social media posts retrieved successfully',
    data: mockPosts,
    timestamp: new Date().toISOString()
  }
  res.json(postsWithPoints)
})

// Claim social media points
router.post('/claim', (req, res) => {
  // get email from jwt

  // get post id from request body

  // get point value from db 

  // update user points in customer API

})

function return404(res: any, message: string) {
  return res.status(404).json({
    success: false,
    message: message,
    data: [],
    timestamp: new Date().toISOString()
  });
}

function jwtToJson(token: string): any | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

export default router