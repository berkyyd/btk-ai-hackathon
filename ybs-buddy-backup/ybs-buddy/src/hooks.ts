import { useState } from 'react'

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)
  
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true)
    try {
      return await fn()
    } finally {
      setIsLoading(false)
    }
  }
  
  return { isLoading, setIsLoading, withLoading }
}

export const useApiState = <T>(initialData?: T) => {
  const [state, setState] = useState<{
    data?: T
    isLoading: boolean
    error?: string
    message?: string
  }>({
    data: initialData,
    isLoading: false,
    error: undefined,
    message: undefined
  })

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: undefined }))
  }

  const setData = (data: T) => {
    setState(prev => ({ ...prev, data, isLoading: false, error: undefined }))
  }

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }))
  }

  const setMessage = (message: string) => {
    setState(prev => ({ ...prev, message }))
  }

  const reset = () => {
    setState({
      data: initialData,
      isLoading: false,
      error: undefined,
      message: undefined
    })
  }

  const withLoading = async <R>(fn: () => Promise<R>): Promise<R> => {
    setLoading(true)
    try {
      const result = await fn()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    ...state,
    setLoading,
    setData,
    setError,
    setMessage,
    reset,
    withLoading
  }
} 