import React from 'react'
import { render, screen } from '@testing-library/react'
import QuizForm from '../../../components/QuizForm'

describe('QuizForm Integration', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()
  const mockCourses = [
    { id: 'YBS101', name: 'Yönetim Bilişim Sistemleri', code: 'YBS101' },
    { id: 'YBS102', name: 'Veri Tabanı Yönetimi', code: 'YBS102' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    render(
      <QuizForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        loading={false}
        courses={mockCourses}
      />
    )
  })

  it('should render form fields', () => {
    expect(screen.getByText('Ders')).toBeInTheDocument()
    expect(screen.getByText('Zorluk')).toBeInTheDocument()
    expect(screen.getByText('Soru Sayısı')).toBeInTheDocument()
    expect(screen.getByText('Süre (Dakika)')).toBeInTheDocument()
    expect(screen.getByText('Sınav Türü')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    expect(screen.getByRole('button', { name: /sınav oluştur/i })).toBeInTheDocument()
  })

  it('should render course options', () => {
    expect(screen.getByText('Yönetim Bilişim Sistemleri (YBS101)')).toBeInTheDocument()
    expect(screen.getByText('Veri Tabanı Yönetimi (YBS102)')).toBeInTheDocument()
  })

  it('should render difficulty options', () => {
    expect(screen.getByText('Kolay')).toBeInTheDocument()
    expect(screen.getByText('Orta')).toBeInTheDocument()
    expect(screen.getByText('Zor')).toBeInTheDocument()
  })

  it('should render exam format options', () => {
    expect(screen.getByText('Test (Çoktan Seçmeli)')).toBeInTheDocument()
    expect(screen.getByText('Klasik (Açık Uçlu)')).toBeInTheDocument()
    expect(screen.getByText('Karışık (Test, Klasik, D/Y, Boşluk Doldurma)')).toBeInTheDocument()
  })
}) 