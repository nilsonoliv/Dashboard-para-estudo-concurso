import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase client to prevent initialization errors in unit tests
vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  googleAuthProvider: {},
}));

// Mock Firebase Auth module
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return () => {};
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

// Mock Firebase Admin
vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}));
