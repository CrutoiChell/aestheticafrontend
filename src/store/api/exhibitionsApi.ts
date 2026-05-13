import { apiSlice } from './apiSlice';
import type { Exhibition, Artwork, ExhibitionFormData, FilterOptions } from '@/lib/types';

interface ExhibitionDetailResponse {
  exhibition: Exhibition;
  artworks: Artwork[];
}

interface ExhibitionsResponse {
  exhibitions: Exhibition[];
  total: number;
}

interface UpdateExhibitionData extends Partial<ExhibitionFormData> {
  id: string;
}

/** Backend wraps payloads in `{ success, data }` */
type ApiSuccess<T> = { success: boolean; data: T };

export const exhibitionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExhibitions: builder.query<ExhibitionsResponse, FilterOptions | void>({
      query: (params) => {
        if (params && Object.keys(params).length > 0) {
          return {
            url: '/exhibitions',
            params,
          };
        }
        return '/exhibitions';
      },
      transformResponse: (response: ApiSuccess<ExhibitionsResponse>) => response.data,
      providesTags: ['Exhibition'],
    }),
    getExhibitionById: builder.query<ExhibitionDetailResponse, string>({
      query: (id) => `/exhibitions/${id}`,
      transformResponse: (response: ApiSuccess<{ exhibition: Exhibition; artworks?: Artwork[] }>) => ({
        exhibition: response.data.exhibition,
        artworks: response.data.artworks ?? [],
      }),
      providesTags: ['Exhibition'],
    }),
    createExhibition: builder.mutation<{ exhibition: Exhibition }, ExhibitionFormData>({
      query: (data) => ({
        url: '/exhibitions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiSuccess<{ exhibition: Exhibition }>) => response.data,
      invalidatesTags: ['Exhibition'],
    }),
    updateExhibition: builder.mutation<{ exhibition: Exhibition }, UpdateExhibitionData>({
      query: ({ id, ...data }) => ({
        url: `/exhibitions/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiSuccess<{ exhibition: Exhibition }>) => response.data,
      invalidatesTags: ['Exhibition'],
    }),
    deleteExhibition: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/exhibitions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: ['Exhibition'],
    }),
    addUserExhibitionImage: builder.mutation<
      { message: string },
      { exhibitionId: string; imageUrl: string }
    >({
      query: ({ exhibitionId, imageUrl }) => ({
        url: `/exhibitions/${exhibitionId}/user-images`,
        method: 'POST',
        body: { imageUrl },
      }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      invalidatesTags: ['Exhibition'],
    }),
  }),
});

export const {
  useGetExhibitionsQuery,
  useLazyGetExhibitionsQuery,
  useGetExhibitionByIdQuery,
  useCreateExhibitionMutation,
  useUpdateExhibitionMutation,
  useDeleteExhibitionMutation,
  useAddUserExhibitionImageMutation,
} = exhibitionsApi;
