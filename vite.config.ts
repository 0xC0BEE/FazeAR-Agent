import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "react", replacement: "https://aistudiocdn.com/react@^18.2.0" },
      { find: "react-dom", replacement: "https://aistudiocdn.com/react-dom@^18.2.0" },
      { find: /^react-dom\/(.*)/, replacement: "https://aistudiocdn.com/react-dom@^18.2.0/$1" },
      { find: /^react\/(.*)/, replacement: "https://aistudiocdn.com/react@^18.2.0/$1" },
      { find: "uuid", replacement: "https://aistudiocdn.com/uuid@^13.0.0" },
      { find: "@google/genai", replacement: "https://aistudiocdn.com/@google/genai@^1.25.0" },
      { find: "clsx", replacement: "https://aistudiocdn.com/clsx@^2.1.1" },
      { find: "tailwind-merge", replacement: "https://aistudiocdn.com/tailwind-merge@^3.3.1" },
      { find: "class-variance-authority", replacement: "https://aistudiocdn.com/class-variance-authority@^0.7.1" },
      { find: "@radix-ui/react-slot", replacement: "https://esm.sh/@radix-ui/react-slot@1.2.3?external=react" },
      { find: "@radix-ui/react-label", replacement: "https://esm.sh/@radix-ui/react-label@2.1.7?external=react" },
      { find: "@radix-ui/react-switch", replacement: "https://esm.sh/@radix-ui/react-switch@1.2.6?external=react" },
      { find: "@radix-ui/react-dropdown-menu", replacement: "https://esm.sh/@radix-ui/react-dropdown-menu@2.1.16?external=react,react-dom" },
      { find: "@radix-ui/react-dialog", replacement: "https://esm.sh/@radix-ui/react-dialog@1.1.1?external=react,react-dom" },
    ]
  }
});
