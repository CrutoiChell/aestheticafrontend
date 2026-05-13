import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from './page';
import { apiSlice } from '@/store/api/apiSlice';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockUser: User = {
  id: '1',
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  role: 'user',
  preferences: {
    favoriteArtists: [],
    favoriteStyles: [],
    notificationEnabled: true,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Helper function to create a mock store with RTK Query
function createMockStore(queryState: any) {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: () => queryState,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

describe('ProfilePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('redirects to login if no token is present', () => {
    const store = createMockStore({
      queries: {},
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.1: Check authentication before displaying profile
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('displays loading state while fetching profile', () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'pending',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          startedTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.1: Display loading state while fetching user data
    expect(screen.getByText('Загрузка профиля...')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'rejected',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          error: {
            status: 500,
            data: {
              error: {
                message: 'Server error',
              },
            },
          },
          startedTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.1: Display error message when fetch fails
    expect(screen.getByText(/Ошибка загрузки профиля/)).toBeInTheDocument();
  });

  it('displays user profile data', () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'fulfilled',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          data: { user: mockUser },
          startedTimeStamp: Date.now(),
          fulfilledTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.2: Display user name, email, and preferences
    expect(screen.getByText('Профиль пользователя')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ivan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Пользователь')).toBeInTheDocument();
  });

  it('displays admin role correctly', () => {
    localStorageMock.setItem('token', 'fake-token');

    const adminUser = { ...mockUser, role: 'admin' as const };

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'fulfilled',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          data: { user: adminUser },
          startedTimeStamp: Date.now(),
          fulfilledTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.2: Display user role correctly
    expect(screen.getByText('Администратор')).toBeInTheDocument();
  });

  it('validates form inputs before submission', async () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'fulfilled',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          data: { user: mockUser },
          startedTimeStamp: Date.now(),
          fulfilledTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    const nameInput = screen.getByLabelText('Имя');
    const submitButton = screen.getByText('Сохранить изменения');

    // Clear name field and submit
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Validates Requirement 5.5: Validate form inputs before sending to API
      expect(screen.getByText('Имя обязательно')).toBeInTheDocument();
    });
  });

  it('handles notification checkbox toggle', () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'fulfilled',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          data: { user: mockUser },
          startedTimeStamp: Date.now(),
          fulfilledTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    // Validates Requirement 5.2: Display user preferences
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('displays account creation date', () => {
    localStorageMock.setItem('token', 'fake-token');

    const store = createMockStore({
      queries: {
        'getProfile(undefined)': {
          status: 'fulfilled',
          endpointName: 'getProfile',
          requestId: 'test-request-id',
          data: { user: mockUser },
          startedTimeStamp: Date.now(),
          fulfilledTimeStamp: Date.now(),
        },
      },
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'api',
      },
    });

    render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    // Validates Requirement 5.2: Display account information
    expect(screen.getByText('Дата регистрации:')).toBeInTheDocument();
    expect(screen.getByText('01.01.2024')).toBeInTheDocument();
  });
});
