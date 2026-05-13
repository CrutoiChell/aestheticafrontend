import { render, screen } from '@testing-library/react';
import ExhibitionCard from './ExhibitionCard';
import { Exhibition } from '@/lib/types';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

function fmtCardDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

describe('ExhibitionCard Component', () => {
  const mockExhibition: Exhibition = {
    id: '1',
    title: 'Modern Art Exhibition',
    description: 'A collection of modern artworks',
    gallery: 'Metropolitan Museum',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-03-30T00:00:00.000Z',
    imageUrl: 'https://example.com/exhibition.jpg',
    location: 'New York',
    artworkIds: ['art1', 'art2'],
    userId: 'u1',
    isPublic: true,
    likesCount: 0,
    commentsCount: 1,
    artworksCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders exhibition title', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);
    expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
  });

  it('renders gallery name', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);
    expect(screen.getByText('Metropolitan Museum')).toBeInTheDocument();
  });

  it('renders formatted dates', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);
    expect(
      screen.getByText(
        `${fmtCardDate(mockExhibition.startDate)} — ${fmtCardDate(mockExhibition.endDate)}`
      )
    ).toBeInTheDocument();
  });

  it('renders exhibition image with correct src and alt', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);
    const image = screen.getByAltText('Modern Art Exhibition');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/exhibition.jpg');
  });

  it('creates a clickable link to exhibition detail page', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/exhibitions/1');
  });

  it('displays all required fields (image, title, gallery, dates)', () => {
    render(<ExhibitionCard exhibition={mockExhibition} />);

    expect(screen.getByAltText('Modern Art Exhibition')).toBeInTheDocument();
    expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
    expect(screen.getByText('Metropolitan Museum')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${fmtCardDate(mockExhibition.startDate)} — ${fmtCardDate(mockExhibition.endDate)}`
      )
    ).toBeInTheDocument();
  });

  it('handles exhibitions with different date formats', () => {
    const exhibition: Exhibition = {
      ...mockExhibition,
      startDate: '2024-12-01T00:00:00.000Z',
      endDate: '2024-12-31T00:00:00.000Z',
    };

    render(<ExhibitionCard exhibition={exhibition} />);
    expect(
      screen.getByText(`${fmtCardDate(exhibition.startDate)} — ${fmtCardDate(exhibition.endDate)}`)
    ).toBeInTheDocument();
  });

  it('handles exhibitions with long titles', () => {
    const exhibition: Exhibition = {
      ...mockExhibition,
      title: 'A Very Long Exhibition Title That Should Still Display Properly Without Breaking The Layout',
    };

    render(<ExhibitionCard exhibition={exhibition} />);
    expect(screen.getByText(/A Very Long Exhibition Title/i)).toBeInTheDocument();
  });

  it('handles exhibitions with long gallery names', () => {
    const exhibition: Exhibition = {
      ...mockExhibition,
      gallery: 'The Very Long Name of an International Museum of Contemporary Art',
    };

    render(<ExhibitionCard exhibition={exhibition} />);
    expect(screen.getByText(/The Very Long Name of an International Museum/i)).toBeInTheDocument();
  });
});
