import React from 'react'
import type { CardProps } from '../types'

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`card-glass p-6 rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default Card
