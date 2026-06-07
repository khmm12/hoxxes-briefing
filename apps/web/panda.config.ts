import {
  defineAnimationStyles,
  defineConfig,
  defineGlobalStyles,
  defineKeyframes,
  defineLayerStyles,
  defineTextStyles,
} from '@pandacss/dev'

const keyframes = defineKeyframes({
  spin: {
    to: {
      transform: 'rotate(360deg)',
    },
  },
  // Refresh feedback lives on the button itself: hold the outcome tint
  // (text / surface — no border: the flash fires after the cursor has long
  // left, and an unprovoked box reads as noise), then ease back to the
  // resting style (no `to` frame = computed style). The hover border takes
  // the outcome tone while the flash is held (see icon-button).
  flashSuccess: {
    '0%, 60%': {
      color: '{colors.success}',
      background: '{colors.success.surface}',
    },
  },
  flashDanger: {
    '0%, 60%': {
      color: '{colors.danger}',
      background: '{colors.danger.surface}',
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
  fadeIn: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
})

// The 13 typography roles from DESIGN.md. Uppercase comes from the roles via
// text-transform, never typed in copy; a role owns exactly one casing.
const textStyles = defineTextStyles({
  display: {
    xl: {
      description: 'Dive names, brand title (desktop)',
      value: {
        fontFamily: 'display',
        fontSize: '1.5rem',
        fontWeight: '700',
        letterSpacing: '0.04em',
        lineHeight: '1.2',
        textTransform: 'uppercase',
      },
    },
    lg: {
      description: 'Brand title (mobile)',
      value: {
        fontFamily: 'display',
        fontSize: '1.25rem',
        fontWeight: '700',
        letterSpacing: '0.04em',
        lineHeight: '1.2',
        textTransform: 'uppercase',
      },
    },
  },
  headline: {
    description: 'State-screen titles (the single sentence-case display role)',
    value: {
      fontFamily: 'display',
      fontSize: '1.5rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      lineHeight: '1.2',
    },
  },
  control: {
    description: 'Dive switch tabs',
    value: {
      fontFamily: 'display',
      fontSize: '1rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      lineHeight: '1.2',
      textTransform: 'uppercase',
    },
  },
  action: {
    description: 'Button labels',
    value: {
      fontFamily: 'body',
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: '1.2',
    },
  },
  eyebrow: {
    description: 'Eyebrows, stage index',
    value: {
      fontFamily: 'display',
      fontSize: '0.875rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      lineHeight: '1.333',
      textTransform: 'uppercase',
    },
  },
  // `metric` is the design system's `value` role — Panda reserves the key
  // `value` as the token-leaf marker, so the group cannot carry that name.
  metric: {
    DEFAULT: {
      description: 'Primary objective values',
      value: {
        fontFamily: 'body',
        fontSize: '1.25rem',
        fontWeight: '600',
        lineHeight: '1.3',
        fontVariantNumeric: 'tabular-nums',
      },
    },
    sm: {
      description: 'Secondary objective values, timing strip (desktop)',
      value: {
        fontFamily: 'body',
        fontSize: '1rem',
        fontWeight: '600',
        lineHeight: '1.3',
        fontVariantNumeric: 'tabular-nums',
      },
    },
  },
  body: {
    md: {
      description: 'Intel notes, state bodies',
      value: {
        fontFamily: 'body',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.55',
      },
    },
    sm: {
      description: 'Secondary copy, footer, slogans',
      value: {
        fontFamily: 'body',
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.55',
      },
    },
  },
  label: {
    DEFAULT: {
      description: 'Objective/hazard labels, chips, biome line',
      value: {
        fontFamily: 'body',
        fontSize: '0.875rem',
        fontWeight: '500',
        letterSpacing: '0.02em',
        lineHeight: '1.4',
      },
    },
    strong: {
      description: 'Timing strip (mobile), chip accents, freshness notes',
      value: {
        fontFamily: 'body',
        fontSize: '0.875rem',
        fontWeight: '600',
        lineHeight: '1.4',
      },
    },
  },
  caption: {
    description: 'Fine print',
    value: {
      fontFamily: 'body',
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.4',
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
  // Holds the element invisible for the delay, then fades it in. Lets a
  // loading fallback skip painting entirely when cached data lands fast.
  delayedFadeIn: {
    value: {
      animationName: 'fadeIn',
      animationDuration: 'fade',
      animationTimingFunction: 'fade',
      animationDelay: '200',
      animationFillMode: 'backwards',
    },
  },
  enterUp: {
    value: {
      animationName: 'enterUp',
      animationDuration: 'enter',
      animationTimingFunction: 'enter',
      animationFillMode: 'both',
      // Reduced motion replaces movement with a plain opacity fade.
      '@media (prefers-reduced-motion: reduce)': {
        animationName: 'fadeIn',
      },
    },
  },
  // The spinner keeps rotating under reduced motion: it is status, not
  // decoration.
  spin: {
    value: {
      animationName: 'spin',
      animationDuration: 'spin',
      animationTimingFunction: 'spin',
      animationIterationCount: 'infinite',
    },
  },
  flashSuccess: {
    value: {
      animationName: 'flashSuccess',
      animationDuration: 'feedback',
      animationTimingFunction: 'feedback',
    },
  },
  flashDanger: {
    value: {
      animationName: 'flashDanger',
      animationDuration: 'feedback',
      animationTimingFunction: 'feedback',
    },
  },
})

// Tailwind-compatible base-4 scale: key × 0.25rem.
const spacing = {
  0: { value: '0' },
  0.5: { value: '0.125rem' },
  1: { value: '0.25rem' },
  1.5: { value: '0.375rem' },
  2: { value: '0.5rem' },
  2.5: { value: '0.625rem' },
  3: { value: '0.75rem' },
  4: { value: '1rem' },
  5: { value: '1.25rem' },
  6: { value: '1.5rem' },
  7: { value: '1.75rem' },
  8: { value: '2rem' },
  10: { value: '2.5rem' },
  11: { value: '2.75rem' },
  12: { value: '3rem' },
  16: { value: '4rem' },
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
      flashSuccess: '&[data-flash=success]',
      flashDanger: '&[data-flash=danger]',
    },
  },
  theme: {
    extend: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
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
          // Primitives — carry values, referenced only by semantic tokens.
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
          // Biome accents — domain constants; hue anchors sampled from the
          // planet map (mostly the 69/d3 channel language), hues re-spread
          // for separability. The one sanctioned primitive-level use: biome
          // glyphs reference them directly.
          biome: {
            crystallineCaverns: { value: '#b069d3' },
            fungusBogs: { value: '#a8d369' },
            magmaCore: { value: '#d36969' },
            radioactiveExclusionZone: { value: '#70d369' },
            denseBiozone: { value: '#69d3c5' },
            sandblastedCorridors: { value: '#d3c569' },
            saltPits: { value: '#d369a2' },
            glacialStrata: { value: '#6994d3' },
            azureWeald: { value: '#7a69d3' },
            hollowBough: { value: '#d2906a' },
            ossuaryDepths: { value: '#d3a269' },
          },
        },
        spacing,
        sizes: {
          ...spacing,
          full: { value: '100%' },
          control: {
            button: { value: '3rem' },
            tab: { value: '2.75rem' },
          },
          // Icon slots — glyphs render only at these sizes, from a single
          // 24×24 viewBox. No sizes in between.
          icon: {
            12: { value: '0.75rem' },
            14: { value: '0.875rem' },
            16: { value: '1rem' },
            20: { value: '1.25rem' },
            24: { value: '1.5rem' },
            64: { value: '4rem' },
          },
          content: {
            board: { value: '80rem' },
            state: { value: '28rem' },
            tooltip: { value: '18rem' },
          },
        },
        radii: {
          sm: { value: '0.25rem' },
          md: { value: '0.5rem' },
          lg: { value: '0.75rem' },
          full: { value: '9999px' },
        },
        shadows: {
          elevation: {
            low: { value: '0 2px 8px {colors.black/18}' },
            medium: { value: '0 8px 24px {colors.black/24}' },
            high: { value: '0 16px 40px {colors.black/28}' },
          },
        },
        durations: {
          100: { value: '100ms' },
          150: { value: '150ms' },
          200: { value: '200ms' },
          300: { value: '300ms' },
          500: { value: '500ms' },
          900: { value: '900ms' },
        },
        // Material 3 curves: standard for within-screen state changes,
        // decelerate for entrances, accelerate for exits, linear for
        // continuous rotation only.
        easings: {
          standard: { value: 'cubic-bezier(0.2, 0, 0, 1)' },
          decelerate: { value: 'cubic-bezier(0, 0, 0, 1)' },
          accelerate: { value: 'cubic-bezier(0.3, 0, 1, 1)' },
          linear: { value: 'linear' },
        },
        zIndex: {
          base: { value: 0 },
          // Local nudge above sibling content (e.g. over a decorative wash)
          // within an isolated stacking context — not a page layer.
          raised: { value: 1 },
          sticky: { value: 100 },
          overlay: { value: 200 },
        },
        opacity: {
          full: { value: 1 },
          disabled: { value: 0.56 },
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
            primary: { value: '{colors.parchment.100}' },
            secondary: { value: '{colors.parchment.300}' },
            muted: { value: '{colors.parchment.500}' },
            inverse: { value: '{colors.neutral.950}' },
          },
          border: {
            subtle: { value: '{colors.parchment.100/10}' },
            strong: { value: '{colors.parchment.100/20}' },
          },
          primary: {
            DEFAULT: { value: '{colors.gold.400}' },
            hover: { value: '{colors.gold.300}' },
            active: { value: '{colors.gold.500}' },
            surface: {
              DEFAULT: { value: '{colors.gold.400/12}' },
              hover: { value: '{colors.gold.400/18}' },
            },
            border: { value: '{colors.gold.400/24}' },
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
            surface: { value: '{colors.orange.400/12}' },
            border: { value: '{colors.orange.400/24}' },
          },
          info: {
            DEFAULT: { value: '{colors.blue.300}' },
            surface: { value: '{colors.blue.300/12}' },
            border: { value: '{colors.blue.300/24}' },
          },
          // 40% is the minimum that clears the 3:1 focus-indicator contrast
          // requirement over `bg`.
          focus: {
            ring: { value: '{colors.parchment.100/40}' },
          },
          // Primary at 40% behind unchanged text.
          selection: { value: '{colors.gold.400/40}' },
        },
        // Motion roles — numeric primitives below, semantic roles on top;
        // the same two-level architecture as color.
        durations: {
          press: { value: '{durations.150}' },
          fade: { value: '{durations.200}' },
          enter: { value: '{durations.300}' },
          exit: { value: '{durations.200}' },
          feedback: { value: '{durations.900}' },
          spin: { value: '{durations.900}' },
        },
        easings: {
          press: { value: '{easings.standard}' },
          fade: { value: '{easings.standard}' },
          enter: { value: '{easings.decelerate}' },
          exit: { value: '{easings.accelerate}' },
          feedback: { value: '{easings.standard}' },
          spin: { value: '{easings.linear}' },
        },
      },
      textStyles,
      layerStyles,
      animationStyles,
    },
  },
  outdir: 'styled-system',
  globalCss: defineGlobalStyles({
    html: {
      // Set color scheme to dark by default,
      colorScheme: {
        base: 'dark',
        // a dirty hack for dark mode detection
        '@media(prefers-color-scheme: dark)': 'dark',
      },
      backgroundColor: 'bg',
      color: 'text.secondary',
      minHeight: '100%',
      textRendering: 'optimizeLegibility',
      // Default browser chrome looks alien on the dark theme.
      scrollbarWidth: 'thin',
      scrollbarColor: '{colors.border.strong} {colors.transparent}',
    },
    body: {
      margin: 0,
      minHeight: '100%',
      backgroundColor: 'bg',
      color: 'text.secondary',
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
    },
  }),
})
