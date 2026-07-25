/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': 'hsl(var(--brand-50) / <alpha-value>)',
  				'100': 'hsl(var(--brand-100) / <alpha-value>)',
  				'200': 'hsl(var(--brand-200) / <alpha-value>)',
  				'300': 'hsl(var(--brand-300) / <alpha-value>)',
  				'400': 'hsl(var(--brand-400) / <alpha-value>)',
  				'500': 'hsl(var(--brand-500) / <alpha-value>)',
  				'600': 'hsl(var(--brand-600) / <alpha-value>)',
  				'700': 'hsl(var(--brand-700) / <alpha-value>)',
  				'800': 'hsl(var(--brand-800) / <alpha-value>)',
  				'900': 'hsl(var(--brand-900) / <alpha-value>)',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#faf5ff',
  				'100': '#f3e8ff',
  				'200': '#e9d5ff',
  				'300': '#d8b4fe',
  				'400': '#c084fc',
  				'500': '#a855f7',
  				'600': '#9333ea',
  				'700': '#7e22ce',
  				'800': '#6b21a8',
  				'900': '#581c87',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			lilac: {
  				'50': 'hsl(var(--accent-50) / <alpha-value>)',
  				'100': 'hsl(var(--accent-100) / <alpha-value>)',
  				'200': 'hsl(var(--accent-200) / <alpha-value>)',
  				'300': 'hsl(var(--accent-300) / <alpha-value>)',
  				'400': 'hsl(var(--accent-400) / <alpha-value>)',
  				'500': 'hsl(var(--accent-500) / <alpha-value>)',
  				'600': 'hsl(var(--accent-600) / <alpha-value>)',
  				'700': 'hsl(var(--accent-700) / <alpha-value>)',
  				'800': 'hsl(var(--accent-800) / <alpha-value>)',
  				'900': 'hsl(var(--accent-900) / <alpha-value>)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			'4xl': '2.5rem',
  			'5xl': '3rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
