import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  z-index: 50;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    left: 16rem;
  }
`

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const UserAvatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  object-fit: cover;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`

const ProfileDropdown = styled.div`
  position: relative;
  display: inline-block;
`

const DropdownContent = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 160px;
  z-index: 100;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  }
`

const UserName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`

const Header: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <HeaderContainer>
      <Logo>EcoDrizzle Rewards</Logo>
      
      <UserSection>
        {isAuthenticated && user ? (
          <ProfileDropdown ref={dropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={toggleDropdown}>
              {user.avatar && <UserAvatar src={user.avatar} alt={user.name} />}
              <UserName>{user.name}</UserName>
            </div>
            <DropdownContent isOpen={isDropdownOpen}>
              <DropdownItem onClick={handleProfileClick}>
                Profile
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownContent>
          </ProfileDropdown>
        ) : (
          <LoginButton onClick={handleLogin}>
            Login (Demo)
          </LoginButton>
        )}
      </UserSection>
    </HeaderContainer>
  )
}

export default Header