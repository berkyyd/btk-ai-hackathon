import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../../contexts/AuthContext'
import { onAuthStateChanged, signOut } from 'firebase/auth'

// Mock Firebase auth
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

// Test component to access context
const TestComponent = () => {
  const { user, loading, logout, role, isAuthenticated } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <div data-testid="role">{role || 'No Role'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <button onClick={logout} data-testid="logout">Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide initial loading state', () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Don't call callback immediately to test loading state
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('should update state when user is authenticated', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const logoutButton = screen.getByTestId('logout')
    await user.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle authentication state changes', async () => {
    let authCallback: ((user: any) => void) | null = null

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

    // Simulate user login
    if (authCallback) {
      authCallback({ uid: 'test-uid', email: 'test@example.com' })
    }

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Simulate user logout
    if (authCallback) {
      authCallback(null)
    }

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User')
    })
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
}) 