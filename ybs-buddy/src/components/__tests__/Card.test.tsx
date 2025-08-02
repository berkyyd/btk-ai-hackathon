import { render, screen } from '@testing-library/react'
import Card from '../Card'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <div>Test Content</div>
      </Card>
    )
    
    const cardElement = screen.getByText('Test Content').parentElement
    expect(cardElement).toHaveClass('custom-class')
  })

  it('renders with default styling', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    )
    
    const cardElement = screen.getByText('Test Content').parentElement
    expect(cardElement).toHaveClass('bg-background-card', 'border', 'border-border-light', 'p-6', 'rounded-lg', 'shadow-dark-card')
  })
}) 