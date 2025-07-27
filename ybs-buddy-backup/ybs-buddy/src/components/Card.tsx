import React from 'react'
import type { CardProps } from '../types.ts'

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-card p-6 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  )
}

export default Card
