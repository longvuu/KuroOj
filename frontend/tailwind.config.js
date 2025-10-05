module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        // Dark mode specific colors
        dark: {
          bg: '#0F172A',        // Slate-900 - Main background
          card: '#1E293B',      // Slate-800 - Cards
          border: '#334155',    // Slate-700 - Borders
          hover: '#475569',     // Slate-600 - Hover states
          input: '#1E293B',     // Input background
          text: {
            primary: '#F1F5F9',   // Slate-100 - Primary text
            secondary: '#CBD5E1', // Slate-300 - Secondary text
            muted: '#94A3B8',     // Slate-400 - Muted text
          }
        }
      },
    },
  },
  plugins: [],
}
