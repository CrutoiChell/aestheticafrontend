import { apiSlice } from './apiSlice';
import type { Artwork, ArtworkFormData } from '@/lib/types';

interface ArtworkQueryParams {
  exhibitionId?: string;
}

interface ArtworksResponse {
  artworks: Artwork[];
}

interface UpdateArtworkData extends Partial<ArtworkFormData> {
  id: string;
}

/** Backend wraps payloads in `{ success, data }` */
type ApiSuccess<T> = { success: boolean; data: T };

export const artworksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getArtworks: builder.query<ArtworksResponse, ArtworkQueryParams | void>({
      query: (params) => {
        if (params) {
          return {
            url: '/artworks',
            params,
          };
        }
        return '/artworks';
      },
      transformResponse: (response: ApiSuccess<{ artworks: Artwork[] }>) => response.data,
      providesTags: ['Artwork'],
    }),
    getArtworkById: builder.query<{ artwork: Artwork }, string>({
      query: (id) => `/artworks/${id}`,
      transformResponse: (response: ApiSuccess<{ artwork: Artwork }>) => response.data,
      providesTags: ['Artwork'],
    }),
    createArtwork: builder.mutation<{ artwork: Artwork }, ArtworkFormData>({
      query: (data) => ({
        url: '/artworks',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiSuccess<{ artwork: Artwork }>) => response.data,
      invalidatesTags: ['Artwork'],
    }),
    updateArtwork: builder.mutation<{ artwork: Artwork }, UpdateArtworkData>({
      query: ({ id, ...data }) => ({
        url: `/artworks/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiSuccess<{ artwork: Artwork }>) => response.data,
      invalidatesTags: ['Artwork'],
    }),
    deleteArtwork: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/artworks/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: ['Artwork'],
    }),
  }),
});

export const {
  useGetArtworksQuery,
  useGetArtworkByIdQuery,
  useCreateArtworkMutation,
  useUpdateArtworkMutation,
  useDeleteArtworkMutation,
} = artworksApi;
