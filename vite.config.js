import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser DOM environment for React component tests
    environment: 'jsdom',
    // Run the setup file before each test suite to load @testing-library/jest-dom matchers
    setupFiles: ['./src/test/setup.js'],
    // Allow using describe/it/expect without explicit imports in test files
    globals: true,
  },
});
