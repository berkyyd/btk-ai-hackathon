import { Outlet } from 'react-router-dom'
import Header from '../components/Header.tsx'
import Footer from '../components/Footer.tsx'

function MainLayout() {
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <Header />

      {/* Ana İçerik */}
      <main className='flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8'>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
