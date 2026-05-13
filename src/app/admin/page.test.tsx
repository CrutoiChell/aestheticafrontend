import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminDashboard from './page';
import { useGetProfileQuery } from '@/store/api/authApi';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth API
jest.mock('@/store/api/authApi', () => ({
  useGetProfileQuery: jest.fn(),
}));

describe('AdminDashboard Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('shows loading state while fetching profile', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    render(<AdminDashboard />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('redirects to login if user is not authenticated', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 401 },
    });

    render(<AdminDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to login if user is not admin', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Иван Иванов',
          email: 'ivan@example.com',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      isLoading: false,
      error: undefined,
    });

    render(<AdminDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('renders admin dashboard for admin users', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Администратор',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      isLoading: false,
      error: undefined,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText('Панель администратора')).toBeInTheDocument();
    expect(screen.getByText('Добро пожаловать, Администратор!')).toBeInTheDocument();
  });

  it('displays content management options', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Администратор',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      isLoading: false,
      error: undefined,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText('Управление выставками')).toBeInTheDocument();
    expect(screen.getByText('Управление произведениями')).toBeInTheDocument();
    expect(screen.getByText('Управление пользователями')).toBeInTheDocument();
    expect(screen.getByText('Статистика')).toBeInTheDocument();
  });

  it('has link to exhibitions management', () => {
    (useGetProfileQuery as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Администратор',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      isLoading: false,
      error: undefined,
    });

    render(<AdminDashboard />);
    
    const exhibitionsLink = screen.getByRole('link', { name: /Управление выставками/i });
    expect(exhibitionsLink).toHaveAttribute('href', '/admin/exhibitions');
  });
});
