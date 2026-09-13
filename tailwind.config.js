/** @type {import('tailwindcss').Config} */

/**
 * Semantic colours are driven by CSS custom properties declared in `src/index.css`
 * (channel triplets, so Tailwind's `/opacity` modifiers keep working). Light and
 * dark values live in one place there; components just use the semantic name.
 */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Surfaces
        canvas: token('--canvas'),
        surface: token('--surface'),
        subtle: token('--subtle'),
        muted: token('--muted'),
        // Hairlines
        line: token('--line'),
        'line-soft': token('--line-soft'),
        'line-faint': token('--line-faint'),
        // Ink
        ink: token('--ink'),
        'ink-2': token('--ink-2'),
        'ink-3': token('--ink-3'),
        'ink-4': token('--ink-4'),
        // Brand (WhatsApp emerald)
        brand: {
          DEFAULT: token('--brand'),
          strong: token('--brand-strong'),
          soft: token('--brand-soft'),
          line: token('--brand-line'),
          ink: token('--brand-ink'),
        },
        // Email / CRM accent
        accent: {
          DEFAULT: token('--accent'),
          soft: token('--accent-soft'),
          line: token('--accent-line'),
          ink: token('--accent-ink'),
        },
        // Status
        warn: {
          DEFAULT: token('--warn'),
          soft: token('--warn-soft'),
          line: token('--warn-line'),
        },
        danger: {
          DEFAULT: token('--danger'),
          soft: token('--danger-soft'),
          line: token('--danger-line'),
        },
      },
      borderRadius: {
        control: '6px',
        card: '8px',
        panel: '10px',
      },
      fontSize: {
        // The design works on a half-pixel scale below 14px.
        '2xs': ['11px', '1.4'],
        xs: ['11.5px', '1.45'],
        sm: ['12.5px', '1.5'],
        base: ['13.5px', '1.5'],
        md: ['14px', '1.5'],
        lg: ['16px', '1.4'],
        xl: ['17px', '1.35'],
        '2xl': ['22px', '1.2'],
        '3xl': ['24px', '1.2'],
        stat: ['28px', '1.1'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.03)',
        raised: '0 1px 2px rgb(15 23 42 / 0.06)',
        brand: '0 1px 2px rgb(16 185 129 / 0.25)',
        drawer: '-16px 0 40px rgb(15 23 42 / 0.12)',
        modal: '0 24px 60px rgb(15 23 42 / 0.2)',
      },
    },
  },
  plugins: [],
};
