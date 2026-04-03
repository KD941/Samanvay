# KarmDeep Frontend

Modern React application for the KarmDeep B2B industrial machinery platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── vendors/        # Vendor pages
│   │   ├── products/       # Product pages
│   │   ├── tenders/        # Tender pages
│   │   ├── orders/         # Order pages
│   │   ├── maintenance/    # Maintenance pages
│   │   └── analytics/      # Analytics pages
│   ├── services/           # API service layer
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   ├── lib/                # Utilities and helpers
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API URL and AWS Cognito details
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript compiler
npm run type-check
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Features

### Authentication
- Login with email/password
- User registration
- Role-based access (Manufacturer, Vendor, Engineer, Admin)
- JWT token management
- Protected routes

### Dashboard
- Overview statistics
- Recent orders
- Active tenders
- Quick actions

### Vendor Management
- Browse vendors
- View vendor profiles
- Vendor ratings and reviews

### Product Catalog
- Search and filter products
- Product details
- Product comparison
- Add to cart

### Digital Tendering
- Create tenders
- Browse active tenders
- Submit bids
- Bid evaluation

### Order Management
- Place orders
- Track order status
- Order history
- Invoice generation

### Maintenance
- Schedule maintenance
- Work order management
- Maintenance history

### Analytics
- Platform metrics
- Business intelligence reports
- Recommendations

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in service files:

- `vendorService.ts` - Vendor and product APIs
- `tenderService.ts` - Tender and bid APIs
- `orderService.ts` - Order management APIs

### API Client

```typescript
import { api } from './lib/api';

// GET request
const data = await api.get('/vendors');

// POST request
const result = await api.post('/vendors', { name: 'ABC Corp' });

// PUT request
const updated = await api.put('/vendors/123', { name: 'New Name' });

// DELETE request
await api.delete('/vendors/123');
```

### Authentication

The API client automatically adds the JWT token to all requests:

```typescript
// Token is stored in localStorage
localStorage.setItem('authToken', token);

// Automatically added to headers
Authorization: Bearer <token>
```

## State Management

### Auth Store (Zustand)

```typescript
import { useAuthStore } from './stores/authStore';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // Use auth state
}
```

### Server State (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { vendorService } from './services/vendorService';

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorService.listVendors(),
  });
}
```

## Routing

Routes are defined in `App.tsx`:

- `/login` - Login page
- `/register` - Registration page
- `/` - Dashboard (protected)
- `/vendors` - Vendors list (protected)
- `/products` - Products catalog (protected)
- `/tenders` - Tenders list (protected)
- `/orders` - Orders list (protected)
- `/maintenance` - Maintenance (protected)
- `/analytics` - Analytics (protected, admin only)

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom utility classes:

```tsx
// Button styles
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>

// Card
<div className="card">Card content</div>

// Input
<input className="input" />

// Label
<label className="label">Label text</label>
```

### Custom Colors

Primary color palette is defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... through 900
  }
}
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://api.karmdeep.com/v1
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Deployment

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy to S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://karmdeep-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id XXXXX \
  --paths "/*"
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Development Guidelines

### Component Structure

```tsx
import { useState } from 'react';

interface Props {
  title: string;
  onSubmit: (data: any) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  const [state, setState] = useState('');

  return (
    <div className="card">
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### API Service Pattern

```typescript
export const myService = {
  async list(params?: any): Promise<PaginatedResponse<T>> {
    return api.get('/endpoint', params);
  },

  async get(id: string): Promise<T> {
    return api.get(`/endpoint/${id}`);
  },

  async create(data: Partial<T>): Promise<T> {
    return api.post('/endpoint', data);
  },

  async update(id: string, data: Partial<T>): Promise<T> {
    return api.put(`/endpoint/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/endpoint/${id}`);
  },
};
```

## Testing (To Be Implemented)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- API response caching with TanStack Query
- Memoization with useMemo and useCallback
- Virtual scrolling for large lists

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

Proprietary - All rights reserved
