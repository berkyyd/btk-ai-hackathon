import { Link } from 'react-router-dom'
import { ROUTES } from '../constants.ts'

function Header() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className='bg-card shadow-sm py-4'>
      <div className='container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8'>
        <Link
          to={ROUTES.HOME}
          className='text-2xl font-bold text-primary hover:text-text transition-colors duration-300'
        >
          YBS Buddy
        </Link>
        <nav>
          <ul className='flex space-x-8'>
            <li>
              <Link
                to={ROUTES.HOME}
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.MUFEDAT}
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Müfredat
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.DERS_NOTLARI}
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Ders Notları
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.SINAV_SIMULASYONU}
                className='text-text-light hover:text-primary transition-colors duration-300 font-medium'
              >
                Sınav Simülasyonu
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={toggleDarkMode}
          className='p-2 rounded-full bg-gray-100 text-text text-sm font-medium
                     hover:bg-gray-200 transition-colors duration-300'
        >
          🌙
        </button>
      </div>
    </header>
  )
}

export default Header
