import { render, screen } from '@testing-library/react';
import ExhibitionGrid from './ExhibitionGrid';
import { Exhibition } from '@/lib/types';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe('ExhibitionGrid Component', () => {
  const exDefaults = {
    userId: 'u1',
    isPublic: true,
    likesCount: 0,
    commentsCount: 0,
    artworksCount: 0,
  };

  const mockExhibitions: Exhibition[] = [
    {
      id: '1',
      title: 'Modern Art Exhibition',
      description: 'A collection of modern artworks',
      gallery: 'Metropolitan Museum',
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-03-30T00:00:00.000Z',
      imageUrl: 'https://example.com/exhibition1.jpg',
      location: 'New York',
      artworkIds: ['art1', 'art2'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ...exDefaults,
    },
    {
      id: '2',
      title: 'Classical Paintings',
      description: 'Renaissance masterpieces',
      gallery: 'Louvre Museum',
      startDate: '2024-02-01T00:00:00.000Z',
      endDate: '2024-04-15T00:00:00.000Z',
      imageUrl: 'https://example.com/exhibition2.jpg',
      location: 'Paris',
      artworkIds: ['art3', 'art4'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ...exDefaults,
    },
    {
      id: '3',
      title: 'Contemporary Sculptures',
      description: 'Modern sculpture collection',
      gallery: 'Tate Modern',
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-05-30T00:00:00.000Z',
      imageUrl: 'https://example.com/exhibition3.jpg',
      location: 'London',
      artworkIds: ['art5', 'art6'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ...exDefaults,
    },
  ];

  it('renders all exhibition cards', () => {
    render(<ExhibitionGrid exhibitions={mockExhibitions} />);
    
    expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
    expect(screen.getByText('Classical Paintings')).toBeInTheDocument();
    expect(screen.getByText('Contemporary Sculptures')).toBeInTheDocument();
  });

  it('renders the correct number of exhibition cards', () => {
    render(<ExhibitionGrid exhibitions={mockExhibitions} />);
    
    // Each exhibition should have a link
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('displays empty state when no exhibitions are provided', () => {
    render(<ExhibitionGrid exhibitions={[]} />);
    
    expect(screen.getByText('Выставки не найдены.')).toBeInTheDocument();
  });

  it('renders a single exhibition correctly', () => {
    render(<ExhibitionGrid exhibitions={[mockExhibitions[0]]} />);
    
    expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
    expect(screen.getByText('Metropolitan Museum')).toBeInTheDocument();
  });

  it('renders multiple exhibitions with unique keys', () => {
    const { container } = render(<ExhibitionGrid exhibitions={mockExhibitions} />);
    
    // Check that the grid container exists
    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
    
    // Check that all exhibitions are rendered
    expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
    expect(screen.getByText('Classical Paintings')).toBeInTheDocument();
    expect(screen.getByText('Contemporary Sculptures')).toBeInTheDocument();
  });

  it('passes exhibition data correctly to ExhibitionCard components', () => {
    render(<ExhibitionGrid exhibitions={mockExhibitions} />);
    
    // Validates Requirement 2.2: Display each exhibition with image, title, gallery name, and dates
    mockExhibitions.forEach((exhibition) => {
      expect(screen.getByText(exhibition.title)).toBeInTheDocument();
      expect(screen.getByText(exhibition.gallery)).toBeInTheDocument();
    });
  });

  it('handles large number of exhibitions', () => {
    const manyExhibitions: Exhibition[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Exhibition ${i + 1}`,
      description: `Description ${i + 1}`,
      gallery: `Gallery ${i + 1}`,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T00:00:00.000Z',
      imageUrl: `https://example.com/exhibition${i + 1}.jpg`,
      location: 'Location',
      artworkIds: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ...exDefaults,
    }));
    
    render(<ExhibitionGrid exhibitions={manyExhibitions} />);
    
    // Check that all exhibitions are rendered
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(20);
  });

  it('applies grid layout class', () => {
    const { container } = render(<ExhibitionGrid exhibitions={mockExhibitions} />);
    
    // Validates Requirement 7.3: Responsive grid layout
    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  it('renders empty state with proper styling', () => {
    const { container } = render(<ExhibitionGrid exhibitions={[]} />);
    
    const emptyState = container.querySelector('[role="status"]');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('Выставки не найдены.')).toBeInTheDocument();
  });
});
