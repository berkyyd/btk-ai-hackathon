import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show login form', async ({ page }) => {
    await page.getByText('Giriş Yap').click()
    
    await expect(page).toHaveURL('/login')
    await expect(page.getByLabel('Email adresi')).toBeVisible()
    await expect(page.getByLabel('Şifre')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Giriş Yap' })).toBeVisible()
  })

  test('should show register form', async ({ page }) => {
    await page.getByText('Kayıt Ol').click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.getByLabel('Ad Soyad')).toBeVisible()
    await expect(page.getByLabel('Email adresi')).toBeVisible()
    await expect(page.getByLabel('Şifre')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kayıt Ol' })).toBeVisible()
  })

  test('should validate login form fields', async ({ page }) => {
    await page.goto('/login')
    
    const loginButton = page.getByRole('button', { name: 'Giriş Yap' })
    await loginButton.click()
    
    // Should show validation errors
    await expect(page.getByText(/email adresi gereklidir/i)).toBeVisible()
    await expect(page.getByText(/şifre gereklidir/i)).toBeVisible()
  })

  test('should validate register form fields', async ({ page }) => {
    await page.goto('/register')
    
    const registerButton = page.getByRole('button', { name: 'Kayıt Ol' })
    await registerButton.click()
    
    // Should show validation errors
    await expect(page.getByText(/ad soyad gereklidir/i)).toBeVisible()
    await expect(page.getByText(/email adresi gereklidir/i)).toBeVisible()
    await expect(page.getByText(/şifre gereklidir/i)).toBeVisible()
  })

  test('should show password requirements', async ({ page }) => {
    await page.goto('/register')
    
    const passwordInput = page.getByLabel('Şifre')
    await passwordInput.fill('weak')
    
    // Should show password strength indicator
    await expect(page.getByText(/şifre çok zayıf/i)).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login')
    
    const passwordInput = page.getByLabel('Şifre')
    await passwordInput.fill('testpassword')
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '👁' })
    await toggleButton.click()
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('should show invitation code field', async ({ page }) => {
    await page.goto('/register')
    
    const invitationCodeInput = page.getByLabel('Davet Kodu (Opsiyonel)')
    await expect(invitationCodeInput).toBeVisible()
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    
    // Navigate to register
    await page.getByText('yeni hesap oluşturun').click()
    await expect(page).toHaveURL('/register')
    
    // Navigate back to login
    await page.getByText('mevcut hesabınıza giriş yapın').click()
    await expect(page).toHaveURL('/login')
  })

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel('Email adresi').fill('test@example.com')
    await page.getByLabel('Şifre').fill('password123')
    
    const loginButton = page.getByRole('button', { name: 'Giriş Yap' })
    await loginButton.click()
    
    // Should show loading state
    await expect(page.getByText('Giriş yapılıyor...')).toBeVisible()
  })

  test('should show loading state during register', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel('Ad Soyad').fill('Test User')
    await page.getByLabel('Email adresi').fill('test@example.com')
    await page.getByLabel('Şifre').fill('password123')
    
    const registerButton = page.getByRole('button', { name: 'Kayıt Ol' })
    await registerButton.click()
    
    // Should show loading state
    await expect(page.getByText('Kayıt olunuyor...')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel('Ad Soyad').fill('Test User')
    await page.getByLabel('Email adresi').fill('invalid-email')
    await page.getByLabel('Şifre').fill('password123')
    
    const registerButton = page.getByRole('button', { name: 'Kayıt Ol' })
    await registerButton.click()
    
    // Should show email format error
    await expect(page.getByText(/geçerli bir email adresi girin/i)).toBeVisible()
  })

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/register')
    
    await page.getByLabel('Ad Soyad').fill('Test User')
    await page.getByLabel('Email adresi').fill('test@example.com')
    await page.getByLabel('Şifre').fill('123')
    
    const registerButton = page.getByRole('button', { name: 'Kayıt Ol' })
    await registerButton.click()
    
    // Should show password strength error
    await expect(page.getByText(/şifre en az 6 karakter olmalıdır/i)).toBeVisible()
  })
}) 