import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { apiClient } from '../api/apiClient'
import type { SocialMediaPost } from '../types'

const SocialMediaContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} 0;
`

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const StatusBadge = styled.span<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  background: ${({ status, theme }) => {
    switch (status) {
      case 'pending': return theme.colors.warning + '20'
      case 'approved': return theme.colors.success + '20'
      case 'rejected': return theme.colors.error + '20'
      case 'claimed': return theme.colors.primary + '20'
      default: return theme.colors.border
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'pending': return theme.colors.warning
      case 'approved': return theme.colors.success
      case 'rejected': return theme.colors.error
      case 'claimed': return theme.colors.primary
      default: return theme.colors.text.secondary
    }
  }};
`

const PostsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const PostCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const PostPlatform = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`

const PostContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.primary};
`

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PointsEarned = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.success};
`

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const SocialMedia: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSocialMediaData = async () => {
      try {
        const postsData: SocialMediaPost[] = await apiClient.getSocialMediaPosts()
        setPosts(postsData)
      } catch (error) {
        console.error('Failed to load social media data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSocialMediaData()
  }, [])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '📘'
      case 'twitter': return '🐦'
      case 'instagram': return '📷'
      case 'linkedin': return '💼'
      default: return '📱'
    }
  }

  if (loading) {
    return (
      <SocialMediaContainer>
        <LoadingContainer>
          <p>Loading social media data...</p>
        </LoadingContainer>
      </SocialMediaContainer>
    )
  }

  return (
    <SocialMediaContainer>
      <Header>
        <Title>Social Media Points</Title>
        <Description>
          Earn points by posting about EcoDrizzle on your social media accounts.
          Share your experience and get rewarded!
        </Description>
      </Header>

      <PostsGrid>
        {posts.length > 0 ? (
          posts.map((post: SocialMediaPost) => (
            <PostCard key={post.postId}>
              <PostHeader>
                <PostPlatform>
                  <span>{getPlatformIcon('facebook')}</span>
                  <span>Facebook</span>
                </PostPlatform>
                <StatusBadge status={'approved'}>
                  <span>Approved</span>
                </StatusBadge>
              </PostHeader>

              <PostContent>
                {post.img && <img src={post.img} alt="Post" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }} />}
                {post.message}
              </PostContent>

              <PostFooter>
                <PointsEarned>
                  {post.score * 10} pts
                </PointsEarned>
              </PostFooter>
            </PostCard>
          ))
        ) : (
          <EmptyState>
            <p>No posts found for the selected filter.</p>
          </EmptyState>
        )}
      </PostsGrid>
    </SocialMediaContainer>
  )
}

export default SocialMedia