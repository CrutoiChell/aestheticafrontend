import { render, screen, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useGetExhibitionByIdQuery } from '@/store/api/exhibitionsApi';
import ExhibitionDetailPage from './page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock RTK Query hook
jest.mock('@/store/api/exhibitionsApi', () => ({
  useGetExhibitionByIdQuery: jest.fn(),
}));

// Mock Layout component
jest.mock('@/components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Exhibition gallery (avoids relying on nested images)
jest.mock('@/components/ExhibitionGallery', () => ({
  __esModule: true,
  default: () => <div data-testid="exhibition-gallery" />,
}));

// Mock ArtworkCard component
jest.mock('@/components/ArtworkCard', () => ({
  __esModule: true,
  default: ({ artwork }: any) => (
    <div data-testid={`artwork-${artwork.id}`}>
      <h3>{artwork.title}</h3>
      <p>{artwork.artist}</p>
      <p>{artwork.year}</p>
    </div>
  ),
}));

describe('ExhibitionDetailPage', () => {
  const mockPush = jest.fn();
  const mockExhibition = {
    id: '1',
    title: 'Тестовая выставка',
    description: 'Описание тестовой выставки',
    gallery: 'Тестовая галерея',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T00:00:00.000Z',
    imageUrl: 'https://example.com/image.jpg',
    imageUrls: ['https://example.com/image.jpg'],
    location: 'Москва',
    artworkIds: ['1', '2'],
    userId: 'u1',
    isPublic: true,
    likesCount: 0,
    commentsCount: 0,
    artworksCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockArtworks = [
    {
      id: '1',
      title: 'Произведение 1',
      artist: 'Художник 1',
      year: 2020,
      description: 'Описание произведения 1',
      imageUrl: 'https://example.com/artwork1.jpg',
      exhibitionId: '1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Произведение 2',
      artist: 'Художник 2',
      year: 2021,
      description: 'Описание произведения 2',
      imageUrl: 'https://example.com/artwork2.jpg',
      exhibitionId: '1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('displays loading state while fetching exhibition', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    expect(screen.getByText('Загрузка выставки...')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: {
        data: {
          error: {
            message: 'Выставка не найдена',
          },
        },
      },
    });

    render(<ExhibitionDetailPage />);

    expect(screen.getByText('Ошибка загрузки выставки. Попробуйте позже.')).toBeInTheDocument();
    expect(screen.getByText('Выставка не найдена')).toBeInTheDocument();
  });

  it('displays exhibition details with all required fields', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: mockExhibition,
        artworks: mockArtworks,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    // Check title
    expect(screen.getByText('Тестовая выставка')).toBeInTheDocument();

    // Check gallery
    expect(screen.getByText(/Тестовая галерея/)).toBeInTheDocument();

    // Check location
    expect(screen.getByText(/Москва/)).toBeInTheDocument();

    // Check dates (formatted)
    expect(screen.getByText(/Даты:/)).toBeInTheDocument();

    // Check description
    expect(screen.getByText('Описание тестовой выставки')).toBeInTheDocument();
  });

  it('displays list of artworks using ArtworkCard', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: mockExhibition,
        artworks: mockArtworks,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    // Check artworks section title
    expect(screen.getByText('Произведения искусства')).toBeInTheDocument();

    // Check that both artworks are rendered
    expect(screen.getByTestId('artwork-1')).toBeInTheDocument();
    expect(screen.getByTestId('artwork-2')).toBeInTheDocument();
    expect(screen.getByText('Произведение 1')).toBeInTheDocument();
    expect(screen.getByText('Произведение 2')).toBeInTheDocument();
  });

  it('displays message when exhibition has no artworks', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: mockExhibition,
        artworks: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    expect(screen.getByText('В этой выставке пока нет произведений искусства')).toBeInTheDocument();
  });

  it('provides back navigation to catalog', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: mockExhibition,
        artworks: mockArtworks,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    const backButton = screen.getByText('← Вернуться к каталогу');
    expect(backButton).toBeInTheDocument();

    backButton.click();
    expect(mockPush).toHaveBeenCalledWith('/exhibitions');
  });

  it('handles missing exhibition data gracefully', () => {
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: null,
        artworks: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    expect(screen.getByText('Выставка не найдена')).toBeInTheDocument();
    expect(screen.getByText('Вернуться к каталогу')).toBeInTheDocument();
  });

  it('fetches exhibition by ID from URL params', () => {
    (useParams as jest.Mock).mockReturnValue({ id: '123' });
    (useGetExhibitionByIdQuery as jest.Mock).mockReturnValue({
      data: {
        exhibition: mockExhibition,
        artworks: [],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<ExhibitionDetailPage />);

    expect(useGetExhibitionByIdQuery).toHaveBeenCalledWith('123');
  });
});
