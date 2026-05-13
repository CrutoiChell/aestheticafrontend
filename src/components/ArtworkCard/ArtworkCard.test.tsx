import { render, screen } from '@testing-library/react';
import ArtworkCard from './ArtworkCard';
import { Artwork } from '@/lib/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('ArtworkCard Component', () => {
  const mockArtwork: Artwork = {
    id: '1',
    title: 'Звёздная ночь',
    artist: 'Винсент ван Гог',
    year: 1889,
    description: 'Знаменитая картина с изображением ночного неба',
    imageUrl: 'https://example.com/starry-night.jpg',
    dimensions: {
      width: 73.7,
      height: 92.1,
      unit: 'cm',
    },
    medium: 'Масло на холсте',
    exhibitionId: 'exhibition1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders artwork title', () => {
    render(<ArtworkCard artwork={mockArtwork} />);
    expect(screen.getByText('Звёздная ночь')).toBeInTheDocument();
  });

  it('renders artist name with Russian label', () => {
    render(<ArtworkCard artwork={mockArtwork} />);
    expect(screen.getByText('Художник: Винсент ван Гог')).toBeInTheDocument();
  });

  it('renders year with Russian label', () => {
    render(<ArtworkCard artwork={mockArtwork} />);
    expect(screen.getByText('Год: 1889')).toBeInTheDocument();
  });

  it('renders artwork image with correct src and alt', () => {
    render(<ArtworkCard artwork={mockArtwork} />);
    const image = screen.getByAltText('Звёздная ночь');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/starry-night.jpg');
  });

  it('displays all required fields (image, title, artist, year)', () => {
    render(<ArtworkCard artwork={mockArtwork} />);
    
    // Validates Requirement 3.3: Display artwork details (title, artist, year, description, image)
    expect(screen.getByAltText('Звёздная ночь')).toBeInTheDocument();
    expect(screen.getByText('Звёздная ночь')).toBeInTheDocument();
    expect(screen.getByText('Художник: Винсент ван Гог')).toBeInTheDocument();
    expect(screen.getByText('Год: 1889')).toBeInTheDocument();
  });

  it('handles artworks with different years', () => {
    const artwork: Artwork = {
      ...mockArtwork,
      year: 2024,
    };
    
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Год: 2024')).toBeInTheDocument();
  });

  it('handles artworks with long titles', () => {
    const artwork: Artwork = {
      ...mockArtwork,
      title: 'Очень длинное название произведения искусства которое должно правильно отображаться',
    };
    
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText(/Очень длинное название произведения искусства/i)).toBeInTheDocument();
  });

  it('handles artworks with long artist names', () => {
    const artwork: Artwork = {
      ...mockArtwork,
      artist: 'Очень длинное имя художника с несколькими частями',
    };
    
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText(/Художник: Очень длинное имя художника/i)).toBeInTheDocument();
  });

  it('handles artworks without optional fields', () => {
    const artwork: Artwork = {
      id: '2',
      title: 'Простая картина',
      artist: 'Неизвестный художник',
      year: 1900,
      description: 'Описание',
      imageUrl: 'https://example.com/simple.jpg',
      exhibitionId: 'exhibition1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Простая картина')).toBeInTheDocument();
    expect(screen.getByText('Художник: Неизвестный художник')).toBeInTheDocument();
    expect(screen.getByText('Год: 1900')).toBeInTheDocument();
  });

  it('handles ancient artworks with early years', () => {
    const artwork: Artwork = {
      ...mockArtwork,
      year: 1500,
    };
    
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Год: 1500')).toBeInTheDocument();
  });
});
