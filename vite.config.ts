import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This section makes environment variables available to your client-side code
  define: {
    // Vite performs a direct string replacement, so we need to stringify the value
    // to ensure it's passed as a string.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
