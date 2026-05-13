# Redux Store Setup

This directory contains the Redux store configuration using Redux Toolkit and RTK Query.

## Structure

```
store/
├── store.ts              # Redux store configuration
├── StoreProvider.tsx     # React Provider component for Next.js
└── api/
    ├── apiSlice.ts       # Base RTK Query API slice
    ├── authApi.ts        # Authentication endpoints
    ├── exhibitionsApi.ts # Exhibition endpoints
    └── artworksApi.ts    # Artwork endpoints
```

## Usage

### Using RTK Query Hooks

RTK Query automatically generates React hooks for each endpoint:

```typescript
import { useGetExhibitionsQuery } from '@/store/api/exhibitionsApi';

function ExhibitionsPage() {
  const { data, isLoading, error } = useGetExhibitionsQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading exhibitions</div>;
  
  return (
    <div>
      {data?.exhibitions.map(exhibition => (
        <div key={exhibition.id}>{exhibition.title}</div>
      ))}
    </div>
  );
}
```

### Using Mutations

```typescript
import { useLoginMutation } from '@/store/api/authApi';

function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  
  const handleSubmit = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      localStorage.setItem('token', result.token);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Features

- **Automatic Caching**: RTK Query automatically caches API responses
- **Automatic Refetching**: Data is refetched when tags are invalidated
- **Loading States**: Built-in loading and error states
- **TypeScript Support**: Full type safety for all API calls
- **Authentication**: Automatic JWT token injection in headers

## Configuration

The API base URL is configured via environment variable:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Cache Tags

The following cache tags are used for automatic invalidation:

- `Exhibition`: Invalidated when exhibitions are created, updated, or deleted
- `Artwork`: Invalidated when artworks are created, updated, or deleted
- `User`: Invalidated when user profile is updated
