# Navigation Component

A responsive navigation menu component with mobile hamburger menu functionality.

## Features

- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Mobile Hamburger Menu**: Slide-in drawer navigation for mobile devices
- **Authentication-Aware**: Shows/hides links based on user authentication state
- **Role-Based Access**: Displays admin links only for admin users
- **Accessible**: Proper ARIA labels and keyboard navigation support
- **CSS Modules**: Scoped styling with no global CSS conflicts

## Usage

```tsx
import Navigation from '@/components/Navigation/Navigation';

export default function Header() {
  return (
    <header>
      <Navigation />
    </header>
  );
}
```

## Features by Screen Size

### Desktop (> 768px)
- Horizontal navigation bar
- All links visible inline
- No hamburger menu

### Mobile (≤ 768px)
- Hamburger menu button (three horizontal lines)
- Slide-in drawer from the right
- Overlay background when menu is open
- Menu closes when:
  - Hamburger button is clicked again
  - A navigation link is clicked
  - The overlay is clicked

## Authentication States

### Guest (Not Authenticated)
- Exhibitions
- Login
- Register

### Authenticated User
- Exhibitions
- Profile
- Logout button
- User name display

### Admin User
- Exhibitions
- Admin
- Profile
- Logout button
- User name display

## Styling

The component uses CSS Modules for styling. Key features:

- **Hamburger Animation**: Transforms into an X when menu is open
- **Smooth Transitions**: 0.3s ease transitions for menu and overlay
- **Mobile Drawer**: Fixed position, 70% width (max 300px)
- **Overlay**: Semi-transparent black background (rgba(0, 0, 0, 0.5))

## Accessibility

- `aria-label="Toggle navigation menu"` on hamburger button
- `aria-expanded` attribute reflects menu state
- `aria-hidden="true"` on overlay element
- Keyboard accessible (can be tabbed through)

## Testing

Unit tests are available in `Navigation.test.tsx` and cover:

- Desktop navigation rendering
- Mobile hamburger menu functionality
- Menu open/close behavior
- Authentication state handling
- Logout functionality
- Accessibility attributes

Run tests with:
```bash
npm test Navigation.test.tsx
```

## Integration

The Navigation component is integrated into the Layout component:

```tsx
import Navigation from '@/components/Navigation/Navigation';

export default function Layout({ children }) {
  return (
    <div>
      <header>
        <Link href="/">ArtGallery</Link>
        <Navigation />
      </header>
      <main>{children}</main>
      <footer>...</footer>
    </div>
  );
}
```

## Dependencies

- React 18+
- Next.js 14+ (for `Link` and `useRouter`)
- Redux Toolkit Query (for authentication state via `useGetProfileQuery`)
- CSS Modules (built into Next.js)

## Requirements Satisfied

- **Requirement 1.5**: Shows user-specific navigation based on authentication
- **Requirement 7.1**: Responsive navigation menu for all screen sizes
- **Requirement 7.2**: Hamburger menu for mobile devices
