import React from 'react'
import type { CardProps } from '../types'

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-background-card border border-border-light p-6 rounded-lg shadow-dark-card transition-all duration-300 hover:shadow-hover-glow hover:border-border-accent hover-lift ${className}`}>
      {children}
    </div>
  )
}

export default Card
