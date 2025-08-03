import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to home page', async ({ page }) => {
    await expect(page).toHaveTitle(/YBS Buddy/)
    await expect(page.locator('h1')).toContainText('YBS Buddy')
  })

  test('should show navigation menu', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByText('Ana Sayfa')).toBeVisible()
    await expect(page.getByText('Eğitim')).toBeVisible()
  })

  test('should open education dropdown', async ({ page }) => {
    await page.getByText('Eğitim').click()
    
    await expect(page.getByText('📚 Müfredat')).toBeVisible()
    await expect(page.getByText('📝 Ders Notları')).toBeVisible()
    await expect(page.getByText('🎯 Sınav Simülasyonu')).toBeVisible()
  })

  test('should navigate to curriculum page', async ({ page }) => {
    await page.getByText('Eğitim').click()
    await page.getByText('📚 Müfredat').click()
    
    await expect(page).toHaveURL('/mufredat')
    await expect(page.locator('h1')).toContainText('Müfredat')
  })

  test('should navigate to notes page', async ({ page }) => {
    await page.getByText('Eğitim').click()
    await page.getByText('📝 Ders Notları').click()
    
    await expect(page).toHaveURL('/ders-notlari')
    await expect(page.locator('h1')).toContainText('Ders Notları')
  })

  test('should navigate to quiz page', async ({ page }) => {
    await page.getByText('Eğitim').click()
    await page.getByText('🎯 Sınav Simülasyonu').click()
    
    await expect(page).toHaveURL('/sinav-simulasyonu')
    await expect(page.locator('h1')).toContainText('Sınav Simülasyonu')
  })

  test('should open personal dropdown', async ({ page }) => {
    await page.getByText('Kişisel').click()
    
    await expect(page.getByText('👤 Profil')).toBeVisible()
    await expect(page.getByText('📊 Analiz')).toBeVisible()
    await expect(page.getByText('📝 Kişisel Takip')).toBeVisible()
  })

  test('should navigate to profile page', async ({ page }) => {
    await page.getByText('Kişisel').click()
    await page.getByText('👤 Profil').click()
    
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('h1')).toContainText('Profil')
  })

  test('should navigate to personal tracking page', async ({ page }) => {
    await page.getByText('Kişisel').click()
    await page.getByText('📝 Kişisel Takip').click()
    
    await expect(page).toHaveURL('/kisisel-takip')
    await expect(page.locator('h1')).toContainText('Kişisel Takip')
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    await page.getByText('Eğitim').click()
    await expect(page.getByText('📚 Müfredat')).toBeVisible()
    
    // Click outside dropdown
    await page.click('body')
    
    await expect(page.getByText('📚 Müfredat')).not.toBeVisible()
  })

  test('should show login/register buttons when not authenticated', async ({ page }) => {
    await expect(page.getByText('Giriş Yap')).toBeVisible()
    await expect(page.getByText('Kayıt Ol')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByText('Giriş Yap').click()
    
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Giriş Yap')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByText('Kayıt Ol').click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('Kayıt Ol')
  })
}) 