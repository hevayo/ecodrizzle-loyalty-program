import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gradient.primary};
  padding: ${({ theme }) => theme.spacing.lg};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
`

const LoginCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  text-align: center;
  max-width: 400px;
  width: 100%;
  
  @media (min-width: 768px) {
    max-width: 450px;
    padding: ${({ theme }) => theme.spacing.xxl} 3rem;
    margin: 0 auto;
  }
`

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  line-height: 1.5;
`

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xxl};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const DemoCredentials = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const DemoTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const DemoText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error}15;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.sm};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const FeatureList = styled.ul`
  text-align: left;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  padding: 0;
  list-style: none;
`

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  &::before {
    content: '✨';
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await login('demo@example.com', 'demo123')
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>EcoDrizzle Rewards</Logo>
        <Subtitle>
          Welcome to your loyalty rewards program. Earn points, redeem rewards, and connect your social media!
        </Subtitle>

        <FeatureList>
          <FeatureItem>Track your loyalty points balance</FeatureItem>
          <FeatureItem>Browse and redeem amazing rewards</FeatureItem>
          <FeatureItem>Claim points for social media posts</FeatureItem>
          <FeatureItem>Manage your profile and preferences</FeatureItem>
        </FeatureList>

        <LoginButton onClick={handleLogin} disabled={isLoading}>
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Logging in...' : 'Login to Dashboard'}
        </LoginButton>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <DemoCredentials>
          <DemoTitle>Demo Credentials</DemoTitle>
          <DemoText>Email: demo@example.com</DemoText>
          <DemoText>Password: demo123</DemoText>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  )
}

export default Login