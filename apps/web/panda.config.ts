import {
  defineAnimationStyles,
  defineConfig,
  defineGlobalStyles,
  defineKeyframes,
  defineLayerStyles,
} from '@pandacss/dev'

const keyframes = defineKeyframes({
  spin: {
    to: {
      transform: 'rotate(360deg)',
    },
  },
  enterUp: {
    from: {
      opacity: 0,
      transform: 'translateY(1.5rem)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
})

const layerStyles = defineLayerStyles({
  focusRing: {
    value: {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'focus.ring',
      outlineOffset: '2px',
    },
  },
})

const animationStyles = defineAnimationStyles({
  enterUp: {
    value: {
      animationName: 'enterUp',
      animationDuration: 'normal',
      animationTimingFunction: 'standard',
      animationFillMode: 'both',
    },
  },
  spin: {
    value: {
      animationName: 'spin',
      animationDuration: 'slow',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    },
  },
})

const spacing = {
  0: { value: '0' },
  ui0: { value: '0' },
  ui2: { value: '0.125rem' },
  ui4: { value: '0.25rem' },
  ui8: { value: '0.5rem' },
  ui12: { value: '0.75rem' },
  ui16: { value: '1rem' },
  ui24: { value: '1.5rem' },
  ui32: { value: '2rem' },
  ui36: { value: '2.25rem' },
  ui40: { value: '2.5rem' },
  ui48: { value: '3rem' },
  ui64: { value: '4rem' },
  ui80: { value: '5rem' },
  ui100: { value: '6.25' },
}

export default defineConfig({
  preflight: true,
  hash: true,
  strictTokens: true,
  presets: [],
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  jsxFramework: 'solid',
  conditions: {
    extend: {
      hover: '&:is(:hover, [data-hover]):not(:disabled)',
    },
  },
  theme: {
    extend: {
      breakpoints: {
        sm: '640px',
        md: '720px',
        lg: '980px',
        xl: '1280px',
      },
      keyframes,
      tokens: {
        aspectRatios: {
          square: { value: '1 / 1' },
        },
        fonts: {
          display: {
            value: "'Rajdhani', 'Avenir Next Condensed', 'Arial Narrow', sans-serif",
          },
          body: {
            value: "'IBM Plex Sans', 'Avenir Next', 'Segoe UI', sans-serif",
          },
        },
        colors: {
          current: { value: 'currentColor' },
          inherit: { value: 'inherit' },
          black: { value: '#000' },
          white: { value: '#fff' },
          transparent: { value: 'rgb(0 0 0 / 0)' },
          neutral: {
            950: { value: '#090909' },
            900: { value: '#0e0e0c' },
            850: { value: '#12120f' },
            800: { value: '#171713' },
            700: { value: '#22211c' },
          },
          parchment: {
            100: { value: '#f5ecd4' },
            300: { value: '#c6bda7' },
            500: { value: '#8d867a' },
          },
          gold: {
            300: { value: '#f0c75f' },
            400: { value: '#e2b948' },
            500: { value: '#c9a140' },
          },
          green: {
            400: { value: '#87b97b' },
          },
          orange: {
            400: { value: '#e8825c' },
          },
          blue: {
            300: { value: '#b0c0c8' },
          },
        },
        spacing,
        sizes: {
          ...spacing,
          full: { value: '100%' },
          control: {
            compact: { value: '2.75rem' },
            default: { value: '3rem' },
          },
          icon: {
            sm: { value: '1rem' },
            md: { value: '1.5rem' },
            lg: { value: '4rem' },
          },
          content: {
            board: { value: '80rem' },
            state: { value: '28rem' },
          },
        },
        radii: {
          ui0: { value: '0' },
          ui2: { value: '0.125rem' },
          ui4: { value: '0.25rem' },
          ui8: { value: '0.5rem' },
          ui12: { value: '0.75rem' },
          full: { value: '9999px' },
        },
        shadows: {
          elevation: {
            none: { value: 'none' },
            low: { value: '0 2px 8px {colors.black/18}' },
            medium: { value: '0 8px 24px {colors.black/24}' },
            high: { value: '0 16px 40px {colors.black/28}' },
          },
          focus: {
            ring: { value: '0 0 0 3px {colors.parchment.100/26}' },
          },
        },
        durations: {
          fast: { value: '160ms' },
          normal: { value: '220ms' },
          slow: { value: '900ms' },
        },
        easings: {
          standard: { value: 'ease' },
          linear: { value: 'linear' },
        },
      },
      semanticTokens: {
        colors: {
          bg: { value: '{colors.neutral.950}' },
          surface: {
            DEFAULT: { value: '{colors.neutral.850}' },
            raised: { value: '{colors.neutral.800}' },
            sunken: { value: '{colors.neutral.900}' },
            muted: { value: '{colors.parchment.100/4}' },
          },
          text: {
            DEFAULT: { value: '{colors.parchment.300}' },
            primary: { value: '{colors.parchment.100}' },
            secondary: { value: '{colors.parchment.300}' },
            disabled: { value: '{colors.parchment.500}' },
            inverse: { value: '{colors.neutral.950}' },
          },
          border: {
            subtle: { value: '{colors.parchment.100/10}' },
            strong: { value: '{colors.parchment.100/20}' },
          },
          brand: {
            DEFAULT: { value: '{colors.gold.400}' },
            base: { value: '{colors.gold.400}' },
            hover: { value: '{colors.gold.300}' },
            active: { value: '{colors.gold.500}' },
            surface: {
              DEFAULT: { value: '{colors.gold.400/12}' },
              hover: { value: '{colors.gold.400/18}' },
            },
            border: { value: '{colors.gold.400/24}' },
          },
          focus: {
            ring: { value: '{colors.parchment.100}' },
          },
          success: {
            DEFAULT: { value: '{colors.green.400}' },
            surface: { value: '{colors.green.400/12}' },
            border: { value: '{colors.green.400/24}' },
          },
          warning: {
            DEFAULT: { value: '{colors.gold.300}' },
            surface: { value: '{colors.gold.300/12}' },
            border: { value: '{colors.gold.300/24}' },
          },
          danger: {
            DEFAULT: { value: '{colors.orange.400}' },
            base: { value: '{colors.orange.400}' },
            surface: { value: '{colors.orange.400/12}' },
            border: { value: '{colors.orange.400/24}' },
          },
          info: {
            DEFAULT: { value: '{colors.blue.300}' },
            surface: { value: '{colors.blue.300/12}' },
            border: { value: '{colors.blue.300/24}' },
          },
          selection: {
            DEFAULT: { value: '{colors.gold.400/28}' },
            text: { value: '{colors.parchment.100}' },
          },
        },
      },
      layerStyles,
      animationStyles,
    },
  },
  outdir: 'styled-system',
  globalCss: defineGlobalStyles({
    html: {
      colorScheme: 'dark',
      backgroundColor: 'bg',
      color: 'text',
      minHeight: '100%',
      textRendering: 'optimizeLegibility',
    },
    body: {
      margin: 0,
      minHeight: '100%',
      backgroundColor: 'bg',
      color: 'text',
      fontFamily: 'body',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.55',
      touchAction: 'manipulation',
    },
    '#app': {
      minHeight: '100%',
      isolation: 'isolate',
    },
    button: {
      font: 'inherit',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
    '::selection': {
      backgroundColor: 'selection',
      color: 'selection.text',
    },
  }),
})
