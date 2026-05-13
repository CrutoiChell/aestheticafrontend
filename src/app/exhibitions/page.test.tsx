import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ExhibitionsPage from './page';
import { apiSlice } from '@/store/api/apiSlice';
import { Exhibition } from '@/lib/types';
import { useLazyGetExhibitionsQuery } from '@/store/api/exhibitionsApi';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/exhibitions',
}));

jest.mock('@/store/api/exhibitionsApi', () => ({
  useLazyGetExhibitionsQuery: jest.fn(),
}));

const mockedLazy = useLazyGetExhibitionsQuery as jest.Mock;

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
];

function createStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (gdm) => gdm().concat(apiSlice.middleware),
  });
}

describe('ExhibitionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state while fetching exhibitions', async () => {
    mockedLazy.mockReturnValue([
      () => ({
        unwrap: () => new Promise(() => {}),
      }),
      { isError: false, error: undefined, isFetching: true },
    ]);

    render(
      <Provider store={createStore()}>
        <ExhibitionsPage />
      </Provider>
    );

    expect(screen.getByText('Загружаем выставки...')).toBeInTheDocument();
  });

  it('displays exhibitions when fetch succeeds', async () => {
    const trigger = jest.fn().mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          exhibitions: mockExhibitions,
          total: mockExhibitions.length,
        }),
    });
    mockedLazy.mockReturnValue([
      trigger,
      { isError: false, error: undefined, isFetching: false },
    ]);

    render(
      <Provider store={createStore()}>
        <ExhibitionsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Modern Art Exhibition')).toBeInTheDocument();
    });
    expect(screen.getByText('Classical Paintings')).toBeInTheDocument();
    expect(trigger).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 6, offset: 0 })
    );
  });

  it('displays empty state when no exhibitions are returned', async () => {
    const trigger = jest.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ exhibitions: [], total: 0 }),
    });
    mockedLazy.mockReturnValue([
      trigger,
      { isError: false, error: undefined, isFetching: false },
    ]);

    render(
      <Provider store={createStore()}>
        <ExhibitionsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Выставки не найдены')).toBeInTheDocument();
    });
  });

  it('renders page title', async () => {
    const trigger = jest.fn().mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          exhibitions: mockExhibitions,
          total: mockExhibitions.length,
        }),
    });
    mockedLazy.mockReturnValue([
      trigger,
      { isError: false, error: undefined, isFetching: false },
    ]);

    render(
      <Provider store={createStore()}>
        <ExhibitionsPage />
      </Provider>
    );

    await waitFor(() => {
      const titles = screen.getAllByText('Выставки');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  it('shows load more when more items exist on server', async () => {
    const trigger = jest.fn().mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          exhibitions: mockExhibitions,
          total: 10,
        }),
    });
    mockedLazy.mockReturnValue([
      trigger,
      { isError: false, error: undefined, isFetching: false },
    ]);

    render(
      <Provider store={createStore()}>
        <ExhibitionsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Показать ещё/i })).toBeInTheDocument();
    });
  });
});
