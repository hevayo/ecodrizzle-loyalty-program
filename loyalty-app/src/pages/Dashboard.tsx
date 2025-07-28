import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../api/apiClient'
import type { Transaction } from '../types'

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} 0;
`

const WelcomeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const PointsCard = styled.div`
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`

const PointsBalance = styled.div`
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const PointsLabel = styled.div`
  color: white;
  opacity: 0.9;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`

const TierBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const ActionCard = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  transition: ${({ theme }) => theme.transitions.default};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ActionTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`

const ActionDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`

const RecentActivity = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const TransactionInfo = styled.div`
  flex: 1;
`

const TransactionDescription = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const TransactionDate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const TransactionAmount = styled.div<{ type: 'earn' | 'spend' }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ type, theme }) => 
    type === 'earn' ? theme.colors.success : theme.colors.error};
`

// Animated Counter Component
interface AnimatedCounterProps {
  value: number
  duration?: number
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === 0) return

    let startTime: number
    const startValue = 0
    const endValue = value

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
      
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <>{displayValue.toLocaleString()}</>
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [pointsLoading, setPointsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load transactions and points balance in parallel
        const [transactionsData, pointsData] = await Promise.allSettled([
          apiClient.getTransactions(1, 5),
          apiClient.getPointsBalance()
        ])

        if (transactionsData.status === 'fulfilled') {
          setTransactions(transactionsData.value)
        } else {
          console.error('Failed to load transactions:', transactionsData.reason)
        }

        if (pointsData.status === 'fulfilled') {
          setPointsBalance(pointsData.value)
          // Also update the user context with the latest points balance
          if (user) {
            updateUser({ pointsBalance: pointsData.value })
          }
        } else {
          console.error('Failed to load points balance:', pointsData.reason)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
        // Add a small delay before showing the counter animation
        setTimeout(() => setPointsLoading(false), 500)
      }
    }

    if (isAuthenticated && user) {
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || !user) {
    return (
      <DashboardContainer>
        <WelcomeTitle>Welcome to EcoDrizzle Rewards</WelcomeTitle>
        <p>Please log in to view your dashboard.</p>
      </DashboardContainer>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome back, {user.name}!</WelcomeTitle>
      </WelcomeSection>

      <PointsCard>
        <PointsBalance>
          {pointsLoading ? (
            <LoadingSpinner />
          ) : (
            <AnimatedCounter value={pointsBalance} />
          )}
        </PointsBalance>
        <PointsLabel>Loyalty Points</PointsLabel>
        <TierBadge>{user.tier} Member</TierBadge>
      </PointsCard>

      <QuickActions>
        <ActionCard onClick={() => navigate('/social-media')}>
          <ActionIcon>📱</ActionIcon>
          <ActionTitle>Claim Social Media Points</ActionTitle>
          <ActionDescription>
            Earn points for posting about us on social media
          </ActionDescription>
        </ActionCard>

        <ActionCard onClick={() => navigate('/rewards')}>
          <ActionIcon>🎁</ActionIcon>
          <ActionTitle>Browse Rewards</ActionTitle>
          <ActionDescription>
            Discover and redeem amazing rewards with your points
          </ActionDescription>
        </ActionCard>

        <ActionCard onClick={() => navigate('/earn-points')}>
          <ActionIcon>💰</ActionIcon>
          <ActionTitle>Earn More Points</ActionTitle>
          <ActionDescription>
            Find new ways to earn points and boost your balance
          </ActionDescription>
        </ActionCard>
      </QuickActions>

      <RecentActivity>
        <SectionTitle>Recent Activity</SectionTitle>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id}>
              <TransactionInfo>
                <TransactionDescription>
                  {transaction.description}
                </TransactionDescription>
                <TransactionDate>
                  {formatDate(transaction.timestamp)}
                </TransactionDate>
              </TransactionInfo>
              <TransactionAmount type={transaction.type}>
                {transaction.type === 'earn' ? '+' : '-'}
                {transaction.amount} pts
              </TransactionAmount>
            </TransactionItem>
          ))
        ) : (
          <p>No recent activity found.</p>
        )}
      </RecentActivity>
    </DashboardContainer>
  )
}

export default Dashboard