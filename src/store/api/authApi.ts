import { apiSlice } from './apiSlice';
import type { LoginCredentials, RegisterData, User, AuthResponse, UserProfileUpdateData } from '@/lib/types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data,
    }),
    updateProfile: builder.mutation<{ user: User }, UserProfileUpdateData>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
