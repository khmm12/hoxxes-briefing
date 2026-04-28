import { createMemo, type JSX, omit } from 'solid-js'
import type { A, AnchorProps } from '@solidjs/router'
import { Dynamic } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { Spinner } from '~/shared/ui/spinner'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type ActionControlComponent = 'button' | 'a' | typeof A
type ActionControlOwnProps = {
  busy?: boolean
  children: JSX.Element
  leadingIcon?: JSX.Element
}

type ActionControlSize = 'compact' | 'default'
type ActionControlTone = 'danger' | 'ghost' | 'primary' | 'secondary'
type ActionControlVariants = {
  size?: ActionControlSize
  tone?: ActionControlTone
}

const actionControlRecipe = cva({
  base: {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'ui8',
    paddingInline: 'ui16',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'full',
    color: 'text.primary',
    fontFamily: 'body',
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '1.55',
    textAlign: 'center',
    cursor: 'pointer',
    transitionDuration: 'fast',
    transitionProperty: 'background-color, border-color, color, transform',
    transitionTimingFunction: 'standard',
    _hover: {
      transform: 'translateY(-1px)',
    },
    _focusVisible: {
      layerStyle: 'focusRing',
    },
    _disabled: {
      cursor: 'default',
      opacity: 0.56,
      transform: 'none',
    },
  },
  variants: {
    size: {
      compact: {
        minHeight: 'control.compact',
      },
      default: {
        minHeight: 'control.default',
      },
    },
    tone: {
      danger: {
        borderColor: 'danger.border',
        background: 'danger.surface',
        _hover: {
          borderColor: 'danger',
          background: 'danger.surface',
        },
      },
      ghost: {
        borderColor: 'transparent',
        background: 'transparent',
        color: 'text.secondary',
        _hover: {
          borderColor: 'border.subtle',
          background: 'surface.sunken',
          color: 'text.primary',
        },
        _disabled: {
          borderColor: 'border.subtle',
          background: 'transparent',
          color: 'text.secondary',
          opacity: 1,
        },
      },
      primary: {
        borderColor: 'brand.border',
        background: 'brand.surface',
        color: 'text.primary',
        _hover: {
          borderColor: 'brand',
          background: 'brand.surface.hover',
        },
        _disabled: {
          borderColor: 'brand.border',
          background: 'brand.surface',
          color: 'brand.hover',
          opacity: 1,
        },
      },
      secondary: {
        borderColor: 'border.strong',
        background: 'surface.sunken',
        _hover: {
          background: 'surface.raised',
        },
      },
    },
  },
  defaultVariants: {
    size: 'default',
    tone: 'primary',
  },
})

type ActionControlComponentProps<TComponent extends ActionControlComponent> = TComponent extends 'button'
  ? JSX.ButtonHTMLAttributes<HTMLButtonElement>
  : TComponent extends 'a'
    ? JSX.AnchorHTMLAttributes<HTMLAnchorElement>
    : TComponent extends typeof A
      ? AnchorProps
      : never

type ActionControlComponentProp<TComponent extends ActionControlComponent> = TComponent extends 'button'
  ? { component?: TComponent }
  : { component: TComponent }

type ActionControlBaseProps<TComponent extends ActionControlComponent> = Omit<
  ActionControlComponentProps<TComponent>,
  'children' | 'class' | 'component' | 'css' | keyof ActionControlOwnProps | keyof ActionControlVariants
> &
  ActionControlOwnProps &
  ActionControlVariants &
  ActionControlComponentProp<TComponent>

export type ActionControlProps<TComponent extends ActionControlComponent = 'button'> = WithStylingProps<
  ActionControlBaseProps<TComponent>
>

type AnyActionControlProps = ActionControlProps<'button'> | ActionControlProps<'a'> | ActionControlProps<typeof A>

const busySpinnerStyles = css.raw({
  fontSize: '0.75rem',
})

type DynamicActionControlProps = {
  children: JSX.Element
  class: JSX.ClassList
  component: ActionControlComponent
} & Record<string, unknown>

const DynamicActionControl = Dynamic as (props: DynamicActionControlProps) => JSX.Element

export function ActionControl<TComponent extends ActionControlComponent = 'button'>(
  props: ActionControlProps<TComponent>,
): JSX.Element {
  const rendered = createMemo(() => {
    const actionProps = props as AnyActionControlProps
    const component = actionProps.component ?? 'button'
    const controlProps = resolveDynamicActionControlProps(actionProps)

    return (
      <DynamicActionControl
        component={component}
        class={resolveActionControlClass(actionProps.class, actionProps.css, actionProps.tone, actionProps.size)}
        {...controlProps}
      >
        <ActionControlContent busy={actionProps.busy} leadingIcon={actionProps.leadingIcon}>
          {actionProps.children}
        </ActionControlContent>
      </DynamicActionControl>
    )
  })

  return <>{rendered()}</>
}

function resolveDynamicActionControlProps(props: AnyActionControlProps): Record<string, unknown> {
  if (isButtonAction(props)) {
    const rest = omit(props, 'busy', 'children', 'class', 'component', 'css', 'disabled', 'leadingIcon', 'size', 'tone')

    return {
      ...rest,
      disabled: props.disabled || props.busy || undefined,
    }
  }

  return omit(props, 'busy', 'children', 'class', 'component', 'css', 'leadingIcon', 'size', 'tone')
}

function ActionControlContent(props: ActionControlOwnProps): JSX.Element {
  return (
    <>
      {props.leadingIcon}
      <span>{props.children}</span>
      {props.busy === true ? <Spinner css={busySpinnerStyles} /> : null}
    </>
  )
}

function resolveActionControlClass(
  className: AnyActionControlProps['class'],
  cssProp: AnyActionControlProps['css'],
  tone: ActionControlTone | undefined,
  size: ActionControlSize | undefined,
): JSX.ClassList {
  return resolveClass(className, cssProp, actionControlRecipe.raw({ size, tone }))
}

function isButtonAction(props: AnyActionControlProps): props is ActionControlProps<'button'> {
  return props.component == null || props.component === 'button'
}
