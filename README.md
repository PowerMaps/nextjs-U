# PowerMaps Frontend

This is the frontend application for PowerMaps, built with Next.js and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
4. Create a `.env.local` file based on `.env.local.example` and fill in your environment variables

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running Production Build

```bash
npm run start
# or
yarn start
```

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable React components
  - `ui`: UI components (buttons, inputs, etc.)
  - `forms`: Form components
  - `maps`: Map-related components
  - `charts`: Data visualization components
  - `layout`: Layout components
- `src/lib`: Utility functions and services
  - `api`: API client and type definitions
  - `hooks`: Custom React hooks
  - `utils`: Utility functions
  - `store`: State management
  - `validation`: Form validation schemas
- `public`: Static assets
- `styles`: Global styles

## Features

- Authentication and user management
- Vehicle management
- Route planning and navigation
- Charging station finder
- Weather integration
- Wallet and payments
- Notifications
- Internationalization
- Dark mode support

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- React Hook Form with Zod
- Mapbox GL
- Firebase Cloud Messaging
- Recharts# nextjs-U
