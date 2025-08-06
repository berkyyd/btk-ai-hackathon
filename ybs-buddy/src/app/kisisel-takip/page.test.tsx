import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KisiselTakipPage from './page';
import { useAuth } from '../../contexts/AuthContext';

// Mock the dependencies
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  db: {},
}));

jest.mock('../../utils/geminiService', () => ({
  geminiService: {},
}));

describe('KisiselTakipPage', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockClear();
  });

  it('renders login prompt when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      role: 'student',
      loading: false,
    });

    render(<KisiselTakipPage />);
    
    expect(screen.getByText(/Kişisel Takip Sayfasına Erişim/i)).toBeInTheDocument();
    expect(screen.getByText(/giriş yapmanız gerekiyor/i)).toBeInTheDocument();
  });

  it('renders loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      role: 'student',
      loading: true,
    });

    render(<KisiselTakipPage />);
    
    expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
  });
}); 