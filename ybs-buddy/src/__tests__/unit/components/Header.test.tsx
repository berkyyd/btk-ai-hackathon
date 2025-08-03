import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../../../components/Header'

// Mock the contexts
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
    logout: jest.fn(),
    role: 'student',
    isAuthenticated: true
  })
}))

jest.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: jest.fn()
  })
}))

describe('Header', () => {
  beforeEach(() => {
    render(<Header />)
  })

  it('should render the logo', () => {
    expect(screen.getByText('YBS Buddy')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
    expect(screen.getByText('Eğitim')).toBeInTheDocument()
    expect(screen.getByText('Kişisel')).toBeInTheDocument()
  })

  it('should show education dropdown when hovered', async () => {
    const educationButton = screen.getByText('Eğitim')
    
    // Use mouseEnter to trigger dropdown
    fireEvent.mouseEnter(educationButton)
    
    await waitFor(() => {
      expect(screen.getByText('📚 Müfredat')).toBeInTheDocument()
      expect(screen.getByText('📝 Ders Notları')).toBeInTheDocument()
      expect(screen.getByText('🎯 Sınav Simülasyonu')).toBeInTheDocument()
    })
  })

  it('should show personal dropdown when hovered', async () => {
    const personalButton = screen.getByText('Kişisel')
    
    // Use mouseEnter to trigger dropdown
    fireEvent.mouseEnter(personalButton)
    
    await waitFor(() => {
      expect(screen.getByText('📊 Kişisel Takip')).toBeInTheDocument()
      expect(screen.getByText('👤 Profilim')).toBeInTheDocument()
    })
  })

  it('should close dropdown when clicking outside', async () => {
    const educationButton = screen.getByText('Eğitim')
    
    fireEvent.mouseEnter(educationButton)
    await waitFor(() => {
      expect(screen.getByText('📚 Müfredat')).toBeInTheDocument()
    })
    
    // Click outside
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('📚 Müfredat')).not.toBeInTheDocument()
    })
  })

  it('should render theme toggle button', () => {
    const themeButton = screen.getByRole('button', { name: /light mode/i })
    expect(themeButton).toBeInTheDocument()
  })

  it('should render user menu when authenticated', () => {
    expect(screen.getByText(/merhaba, test user/i)).toBeInTheDocument()
  })

  it('should render logout button when authenticated', () => {
    expect(screen.getByRole('button', { name: /çıkış/i })).toBeInTheDocument()
  })
}) 