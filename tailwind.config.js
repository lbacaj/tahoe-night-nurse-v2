module.exports = {
  content: ['./views/**/*.ejs', './public/**/*.js'],
  theme: {
    extend: {
      colors: {
        lake: {
          navy: '#0C1A2A',
          'navy-dark': '#08111E',
          'navy-light': '#1A2F4A'
        },
        gold: {
          DEFAULT: '#C7A24A',
          light: '#E5C76B',
          dark: '#A68838'
        },
        mist: '#F6F8FA',
        cream: '#FBF8F3',
      },
      maxWidth: {
        content: '1200px'
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'gold': '0 10px 30px -10px rgba(199, 162, 74, 0.3)',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C7A24A 0%, #E5C76B 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
};