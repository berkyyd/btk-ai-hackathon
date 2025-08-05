import React from 'react'
import type { CardProps } from '../types'

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`card-glass p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`}>
      {children}
    </div>
  )
}

export default Card
