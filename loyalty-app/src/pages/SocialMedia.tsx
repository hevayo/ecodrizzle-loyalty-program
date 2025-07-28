import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../api/apiClient'
import type { SocialMediaPost, SocialMediaAccount } from '../types'

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

const AccountSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const AccountAvatar = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  object-fit: cover;
`

const AccountInfo = styled.div`
  flex: 1;
`

const AccountName = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const AccountHandle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
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

const ClaimSection = styled.div`
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ClaimTitle = styled.h2`
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ClaimPoints = styled.div`
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ClaimButton = styled.button<{ disabled: boolean }>`
  background: ${({ disabled }) => disabled ? 'rgba(255,255,255,0.3)' : 'white'};
  color: ${({ disabled, theme }) => disabled ? 'rgba(255,255,255,0.7)' : theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: ${({ theme }) => theme.transitions.fast};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`

const FilterButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) =>
    active ? 'white' : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ active, theme }) =>
    active ? theme.colors.primaryDark : theme.colors.primary};
    color: white;
  }
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

const PostDate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
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

const statusFilters = [
  { id: 'all', label: 'All Posts' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'claimed', label: 'Claimed' },
  { id: 'rejected', label: 'Rejected' },
]

const SocialMedia: React.FC = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const loadSocialMediaData = async () => {
      try {
        const [postsData, accountsData] = await Promise.all([
          apiClient.getSocialMediaPosts(),
          apiClient.getSocialMediaAccounts(),
        ])
        setPosts(postsData)
        setAccounts(accountsData)
      } catch (error) {
        console.error('Failed to load social media data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSocialMediaData()
  }, [])

  const unclaimedPoints = posts
    .reduce((sum, post) => sum + post.score * 10, 0)

  const filteredPosts = posts;

  const handleClaimPoints = async () => {
    if (!user || unclaimedPoints === 0) return

    setClaiming(true)
    try {
      const result = await apiClient.claimSocialMediaPoints(user.id, user.email)
      updateUser({ pointsBalance: user.pointsBalance + result.pointsEarned })

      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Failed to claim points:', error)
    } finally {
      setClaiming(false)
    }
  }

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

      {accounts.map(account => (
        <AccountSection key={account.id}>
          <AccountHeader>
            <AccountAvatar src={account.profileImageUrl} alt={account.displayName} />
            <AccountInfo>
              <AccountName>{account.displayName}</AccountName>
              <AccountHandle>{account.handle} • {account.platform}</AccountHandle>
            </AccountInfo>
            <StatusBadge status="connected">Connected</StatusBadge>
          </AccountHeader>
        </AccountSection>
      ))}

      {unclaimedPoints > 0 && (
        <ClaimSection>
          <ClaimTitle>Ready to Claim Points!</ClaimTitle>
          <ClaimPoints>{unclaimedPoints} Points Available</ClaimPoints>
          <ClaimButton
            disabled={claiming}
            onClick={handleClaimPoints}
          >
            {claiming ? 'Claiming Points...' : 'Claim All Points'}
          </ClaimButton>
        </ClaimSection>
      )}

      <FilterSection>
        {statusFilters.map(filter => (
          <FilterButton
            key={filter.id}
            active={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </FilterButton>
        ))}
      </FilterSection>

      <PostsGrid>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.postId}>
              <PostHeader>
                <PostPlatform>
                  <span>{getPlatformIcon('facebook')}</span>
                  <span>Facebook</span>
                </PostPlatform>
                <StatusBadge status={'approved'}>
                  Approved
                </StatusBadge>
              </PostHeader>

              <PostContent>{post.message}</PostContent>

              <PostFooter>
                <PostDate>'29-07-25'</PostDate>
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