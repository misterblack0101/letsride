import dotenv from 'dotenv';

/**
 * Environment configuration and validation utilities
 */
dotenv.config({ path: '.env' });


interface EnvironmentConfig {
  // Firebase configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  // Development settings
  nodeEnv: string;
  port: number;
}

/**
 * Validates and returns environment configuration
 * Throws error if required variables are missing
 */
export function getEnvironmentConfig(): EnvironmentConfig {

  // Required environment variables for Firebase (client-side)
  const requiredPublicVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  // console.log(process.env);

  // Check for missing public environment variables
  const missingPublicVars = requiredPublicVars.filter(varName => !process.env[varName]);

  // if (missingPublicVars.length > 0) {
  //   throw new Error(
  //     `Missing required public environment variables: ${missingPublicVars.join(', ')}\n` +
  //     `Please check your .env.local file and ensure all variables are set.`
  //   );
  // }

  return {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  };
}
