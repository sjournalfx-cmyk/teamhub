---
description: Steps to start the development server and work on the Kinetic application
---

# Development Workflow

## Prerequisites
Before starting development, ensure you have:
1. Node.js 18+ installed
2. npm or yarn package manager
3. A code editor (VS Code recommended)

## Getting Started

// turbo
1. Install dependencies if not already done:
```bash
npm install
```

// turbo
2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
teamhub/
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── types.ts             # TypeScript type definitions
├── constants.ts         # App constants and mock data
├── context/             # React context providers
│   └── AuthContext.tsx  # Authentication context
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── PerformerDashboard.tsx
│   ├── TaskCard.tsx
│   ├── WeeklyView.tsx
│   ├── ErrorBoundary.tsx
│   ├── Toast.tsx
│   ├── Loading.tsx
│   └── ...
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase database client
│   ├── errors.ts       # Custom error types
│   └── utils.ts        # Utility functions
└── services/           # External service integrations
    └── geminiService.ts # Gemini AI service
```

## Environment Variables

Create a `.env` file in the root with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Common Development Tasks

### Adding a New Component
1. Create the component file in `components/`
2. Add TypeScript interfaces if needed
3. Export from the file
4. Import and use in parent components

### Adding a New Database Operation
1. Add the operation to `lib/supabase.ts`
2. Use proper error handling with try/catch
3. Convert camelCase to snake_case for DB operations
4. Update column lists if adding new fields

### Using Toast Notifications
```tsx
import { useToast } from './components/Toast';

const MyComponent = () => {
  const toast = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Saved!', 'Your changes have been saved.');
    } catch (error) {
      toast.error('Error', 'Failed to save changes.');
    }
  };
};
```

### Using Loading States
```tsx
import { LoadingSpinner, LoadingButton } from './components/Loading';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <LoadingButton
      loading={loading}
      onClick={() => handleSubmit()}
      className="tactical-button"
    >
      Submit
    </LoadingButton>
  );
};
```

## Building for Production

// turbo
```bash
npm run build
```

The built files will be in the `dist/` folder.

## Testing the Build

// turbo
```bash
npm run preview
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env` file exists and has correct values
   - Restart the dev server after changing `.env`

2. **AI features not working**
   - Check that `VITE_GEMINI_API_KEY` is set
   - Verify the API key is valid

3. **Database operations failing**
   - Check browser console for detailed errors
   - Verify RLS policies in Supabase dashboard
   - Ensure user is authenticated

4. **Build errors**
   - Run `npm install` to ensure dependencies are up to date
   - Check for TypeScript errors with `npx tsc --noEmit`
