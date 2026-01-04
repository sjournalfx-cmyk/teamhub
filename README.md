# Kinetic - Team Task Management Application

A modern, real-time team management application built with React, TypeScript, Supabase, and Gemini AI.

## Features

- **Role-Based Access**: Separate dashboards for Managers and Team Members
- **Task Management**: Create, assign, and track tasks with priorities and due dates
- **Goal Tracking**: Define strategic goals with milestones and progress tracking
- **AI-Powered Assistance**: Gemini AI integration for task analysis and optimization
- **Real-time Updates**: Live synchronization across team members
- **Mobile-Friendly**: Responsive design with touch support
- **Dark/Light Theme**: Automatic theme support

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (via custom implementation)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini AI
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd teamhub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Set up the database by running `setup_database.sql` in your Supabase SQL Editor.

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── types.ts             # TypeScript type definitions
├── constants.ts         # App constants
├── components/          # React components
│   ├── AdminDashboard.tsx
│   ├── PerformerDashboard.tsx
│   ├── ErrorBoundary.tsx
│   ├── Toast.tsx
│   └── ...
├── context/             # React context providers
│   └── AuthContext.tsx
├── hooks/               # Custom React hooks
│   ├── useForm.ts
│   └── useAsync.ts
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Database client
│   ├── errors.ts       # Custom error types
│   └── utils.ts        # Utility functions
└── services/           # External services
    └── geminiService.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Database Setup

The application uses Supabase with the following tables:
- `profiles` - User profiles
- `tasks` - Task management
- `goals` - Strategic goals
- `join_requests` - Team invitation system
- `activity_log` - Activity tracking

Run `setup_database.sql` in your Supabase SQL Editor to create all tables with proper RLS policies.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key |

## License

MIT
