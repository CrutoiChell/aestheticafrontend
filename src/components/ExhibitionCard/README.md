# ExhibitionCard Component

A card component that displays a preview of an exhibition with an image, title, gallery name, and dates. The card is clickable and navigates to the exhibition detail page.

## Features

- Displays exhibition image using Next.js Image component for optimization
- Shows exhibition title, gallery name, and formatted dates
- Clickable card that navigates to `/exhibitions/[id]`
- Responsive design with hover effects
- Styled with CSS Modules for scoped styling

## Props

```typescript
interface ExhibitionCardProps {
  exhibition: Exhibition;
}
```

### Exhibition Type

```typescript
interface Exhibition {
  id: string;
  title: string;
  description: string;
  gallery: string;
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  imageUrl: string;
  location?: string;
  artworkIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Usage

```tsx
import ExhibitionCard from '@/components/ExhibitionCard';

function ExhibitionList({ exhibitions }) {
  return (
    <div>
      {exhibitions.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
      ))}
    </div>
  );
}
```

## Styling

The component uses CSS Modules for styling. Key features:
- Responsive image container with fixed height
- Hover effect with elevation and transform
- Mobile-responsive adjustments
- Clean, modern card design

## Requirements

Validates **Requirement 2.2**: Display each exhibition with image, title, gallery name, and dates.

## Testing

The component includes comprehensive unit tests covering:
- Rendering of all required fields
- Date formatting
- Navigation link generation
- Edge cases (long titles, different date formats)
