# Layout Component

A reusable layout component that provides consistent header, navigation, and footer across all pages of the ArtGallery platform.

## Features

- **Responsive Header**: Includes logo and navigation links that adapt to different screen sizes
- **Authentication Integration**: Automatically displays user-specific navigation based on authentication state using RTK Query
- **Role-Based Navigation**: Shows admin links only for users with admin role
- **Sticky Header**: Header stays visible when scrolling
- **Footer**: Consistent footer with copyright and links
- **CSS Modules**: Scoped styling to prevent conflicts

## Usage

```tsx
import Layout from '@/components/Layout';

export default function MyPage() {
  return (
    <Layout>
      <h1>Page Content</h1>
      <p>Your page content goes here</p>
    </Layout>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | The page content to be wrapped by the layout |

## Authentication State

The Layout component automatically:
- Fetches user profile data using `useGetProfileQuery` from RTK Query
- Skips the query if no authentication token is present in localStorage
- Shows Login/Register links for unauthenticated users
- Shows Profile/Logout and user name for authenticated users
- Shows Admin link for users with admin role

## Navigation Links

### For All Users
- **Home** (logo link): `/`
- **Exhibitions**: `/exhibitions`

### For Unauthenticated Users
- **Login**: `/auth/login`
- **Register**: `/auth/register`

### For Authenticated Users
- **Profile**: `/profile`
- **Logout**: Clears token and redirects to login

### For Admin Users
- **Admin**: `/admin`

## Styling

The component uses CSS Modules for styling. The styles are defined in `Layout.module.css` and include:
- Responsive breakpoints at 768px and 480px
- Sticky header with shadow
- Flexbox layout for header and footer
- Hover effects on links and buttons
- Mobile-friendly navigation

## Testing

Unit tests are available in `Layout.test.tsx` and cover:
- Header rendering with logo
- Navigation links display
- Authentication state handling
- Children content rendering
- Footer rendering with copyright and links

Run tests with:
```bash
npm test Layout.test.tsx
```

## Dependencies

- React
- Next.js (Link, useRouter)
- RTK Query (useGetProfileQuery)
- CSS Modules

## Notes

- The component uses `'use client'` directive as it requires client-side hooks
- localStorage is used to store the authentication token
- The component gracefully handles SSR by checking for window object
