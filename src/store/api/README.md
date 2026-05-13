# RTK Query API Documentation

This directory contains the RTK Query API configuration for the ArtGallery platform.

## Files

### apiSlice.ts
Base API slice configuration with:
- Base URL configuration (defaults to `http://localhost:3001/api`)
- Authentication header injection (Bearer token from localStorage)
- Cache tag types: `Exhibition`, `Artwork`, `User`

### authApi.ts
Authentication endpoints:
- `login` - POST /api/auth/login - User login with credentials
- `register` - POST /api/auth/register - User registration
- `getProfile` - GET /api/auth/me - Get current user profile

**Exported Hooks:**
- `useLoginMutation`
- `useRegisterMutation`
- `useGetProfileQuery`

### exhibitionsApi.ts
Exhibition management endpoints:
- `getExhibitions` - GET /api/exhibitions - List exhibitions with optional filters
- `getExhibitionById` - GET /api/exhibitions/:id - Get exhibition details with artworks
- `createExhibition` - POST /api/exhibitions - Create new exhibition (admin only)
- `updateExhibition` - PUT /api/exhibitions/:id - Update exhibition (admin only)
- `deleteExhibition` - DELETE /api/exhibitions/:id - Delete exhibition (admin only)

**Exported Hooks:**
- `useGetExhibitionsQuery`
- `useGetExhibitionByIdQuery`
- `useCreateExhibitionMutation`
- `useUpdateExhibitionMutation`
- `useDeleteExhibitionMutation`

**Cache Invalidation:**
- All mutations invalidate the `Exhibition` tag, triggering automatic refetch of exhibition queries

### artworksApi.ts
Artwork management endpoints:
- `getArtworks` - GET /api/artworks - List artworks with optional exhibition filter
- `getArtworkById` - GET /api/artworks/:id - Get artwork details
- `createArtwork` - POST /api/artworks - Create new artwork (admin only)
- `updateArtwork` - PUT /api/artworks/:id - Update artwork (admin only)
- `deleteArtwork` - DELETE /api/artworks/:id - Delete artwork (admin only)

**Exported Hooks:**
- `useGetArtworksQuery`
- `useGetArtworkByIdQuery`
- `useCreateArtworkMutation`
- `useUpdateArtworkMutation`
- `useDeleteArtworkMutation`

**Cache Invalidation:**
- All mutations invalidate the `Artwork` tag, triggering automatic refetch of artwork queries

## Type Safety

All API endpoints use TypeScript types imported from `@/lib/types` for consistency across the application:
- `User`, `LoginCredentials`, `RegisterData`, `AuthResponse`
- `Exhibition`, `ExhibitionFormData`, `FilterOptions`
- `Artwork`, `ArtworkFormData`

## Cache Management

RTK Query automatically manages caching with the following strategy:
- **Queries** provide cache tags to identify cached data
- **Mutations** invalidate cache tags to trigger automatic refetch
- This ensures the UI always displays up-to-date data after modifications

## Usage Example

```typescript
import { useGetExhibitionsQuery, useCreateExhibitionMutation } from '@/store/api/exhibitionsApi';

function ExhibitionsPage() {
  // Fetch exhibitions with automatic caching
  const { data, isLoading, error } = useGetExhibitionsQuery();
  
  // Create exhibition mutation
  const [createExhibition, { isLoading: isCreating }] = useCreateExhibitionMutation();
  
  const handleCreate = async (formData: ExhibitionFormData) => {
    try {
      await createExhibition(formData).unwrap();
      // Exhibition list will automatically refetch due to cache invalidation
    } catch (err) {
      console.error('Failed to create exhibition:', err);
    }
  };
  
  // ... render UI
}
```

## Requirements Validation

This implementation satisfies the following requirements:
- **Requirement 1.2**: Authentication API integration for login/register
- **Requirement 2.1**: Exhibition catalog data fetching
- **Requirement 3.1**: Exhibition detail data fetching
- **Requirement 12.1**: Frontend state management with caching

## Design Compliance

All endpoints match the design document specifications in:
- `.kiro/specs/art-gallery-platform/design.md`
- Section: "RTK Query API Setup"
- Section: "Backend API Endpoints"
