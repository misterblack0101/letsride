# Let's Ride - Online Bike Store

A modern e-commerce platform for cycling enthusiasts built with Next.js, Firebase, and Google AI.

## Features

- Browse and filter cycling products
- Shopping cart functionality  
- AI-powered gear recommendations
- Modern, responsive design with dark/light mode
- Firebase integration for data storage
- Google AI (Gemini) for intelligent recommendations

## Setup

### Prerequisites

- Node.js 18+ 
- Firebase account
- Google AI API key (for Gemini)

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual values:

   **Firebase Configuration:**
   - `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain  
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

   **Google AI Configuration:**
   - `GOOGLE_GENAI_API_KEY` - Your Google AI API key for Gemini

   **Development Settings:**
   - `PORT` - Port for development server (default: 3000)
   - `NODE_ENV` - Environment mode (development/production)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Verify your environment configuration:
   ```bash
   npm run check-env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Start the AI development server (optional):
   ```bash
   npm run genkit:dev
   ```

## Getting API Keys

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click "Add app" or select web app
5. Copy the configuration values to your `.env.local`

### Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add it to your `.env.local` as `GOOGLE_GENAI_API_KEY`

## Security Note

- Never commit your `.env.local` file to version control
- The `.env.example` file shows the required variables without sensitive values
- All Firebase variables are prefixed with `NEXT_PUBLIC_` as they're used in the browser
- The Google AI key is server-side only and should not be prefixed with `NEXT_PUBLIC_`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checking
- `npm run check-env` - Validate environment configuration
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit AI development server with watch mode
