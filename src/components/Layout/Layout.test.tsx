import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from './Layout';
import { apiSlice } from '@/store/api/apiSlice';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
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

describe('Layout Component', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    });
    localStorageMock.clear();
  });

  it('renders the header with logo', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    expect(screen.getByText('ArtGallery')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    expect(screen.getByText('Exhibitions')).toBeInTheDocument();
  });

  it('renders login and register links when user is not authenticated', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} ArtGallery Platform. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders footer links', () => {
    render(
      <Provider store={store}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </Provider>
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });
});
