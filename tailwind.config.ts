import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				hype: {
					crimson: 'hsl(var(--hype-crimson))',
					'crimson-light': 'hsl(var(--hype-crimson-light))',
					'crimson-dark': 'hsl(var(--hype-crimson-dark))',
					gold: 'hsl(var(--hype-gold))',
					dark: 'hsl(var(--hype-dark))',
					darker: 'hsl(var(--hype-darker))',
					gray: 'hsl(var(--hype-gray))',
					'light-gray': 'hsl(var(--hype-light-gray))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--hype-crimson) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--hype-crimson) / 0.5)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
				'slide-in': 'slide-in 0.5s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'pulse-slow': 'pulse-slow 3s infinite',
				'glow': 'glow 2s infinite',
				'shimmer': 'shimmer 1.5s infinite'
			},
			fontFamily: {
				display: ['Bebas Neue', 'Impact', 'sans-serif'],
				sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			boxShadow: {
				'glow': '0 0 30px hsl(var(--hype-crimson) / 0.3)',
				'glow-lg': '0 0 50px hsl(var(--hype-crimson) / 0.4)',
				'card': '0 8px 32px hsl(0 0% 0% / 0.4)',
				'elevated': '0 16px 48px hsl(0 0% 0% / 0.5)',
				'inner-glow': 'inset 0 0 20px hsl(var(--hype-crimson) / 0.1)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-netflix': 'linear-gradient(to bottom, transparent, hsl(var(--background)))',
				'gradient-hero': 'linear-gradient(to right, hsl(var(--background)) 0%, transparent 50%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
