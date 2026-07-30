import { createMemo, omit, Show } from 'solid-js'
import { Dynamic, type JSX } from '@solidjs/web'
import { css, cva } from 'styled-system/css'
import { Spinner } from '~/shared/ui/spinner'
import { resolveClass, type WithStylingProps } from '~/shared/ui/styling'

type ActionControlComponent = 'button' | 'a'
type ActionControlOwnProps = {
  busy?: boolean
  children?: JSX.Element
  leadingIcon?: JSX.Element
}

type ActionControlTone = 'danger' | 'ghost' | 'primary' | 'secondary'
type ActionControlVariants = {
  tone?: ActionControlTone
}

const actionControlRecipe = cva({
  base: {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    minHeight: 'control.button',
    paddingInline: '5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 'full',
    color: 'text.primary',
    textStyle: 'action',
    textAlign: 'center',
    cursor: 'pointer',
    transitionDuration: 'press',
    transitionProperty: '[background-color, border-color, color, transform]',
    transitionTimingFunction: 'press',
    _hover: {
      transform: 'translateY(-1px)',
    },
    _focusVisible: {
      layerStyle: 'focusRing',
    },
    _disabled: {
      cursor: 'default',
      opacity: 'disabled',
      transform: 'none',
    },
  },
  variants: {
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
          opacity: 'full',
        },
      },
      primary: {
        borderColor: 'primary.border',
        background: 'primary.surface',
        color: 'text.primary',
        _hover: {
          borderColor: 'primary',
          background: 'primary.surface.hover',
        },
        _disabled: {
          borderColor: 'primary.border',
          background: 'primary.surface',
          color: 'primary.hover',
          opacity: 'full',
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
    tone: 'primary',
  },
})

type ActionControlComponentProps<TComponent extends ActionControlComponent> = TComponent extends 'button'
  ? JSX.ButtonHTMLAttributes<HTMLButtonElement>
  : JSX.AnchorHTMLAttributes<HTMLAnchorElement>

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

type AnyActionControlProps = ActionControlProps<'button'> | ActionControlProps<'a'>

// Busy keeps the control size; the spinner rides the 12px icon slot.
const busySpinnerStyles = css.raw({
  fontSize: '[token(sizes.icon.12)]',
})

type DynamicActionControlProps = {
  children: JSX.Element
  class: JSX.ClassValue
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
        class={resolveActionControlClass(actionProps.class, actionProps.css, actionProps.tone)}
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
    const rest = omit(props, 'busy', 'children', 'class', 'component', 'css', 'disabled', 'leadingIcon', 'tone')

    return {
      ...rest,
      disabled: props.disabled || props.busy || undefined,
    }
  }

  return omit(props, 'busy', 'children', 'class', 'component', 'css', 'leadingIcon', 'tone')
}

function ActionControlContent(props: ActionControlOwnProps): JSX.Element {
  return (
    <>
      {props.leadingIcon}
      <Show when={props.children}>
        <span>{props.children}</span>
      </Show>
      {props.busy === true ? <Spinner css={busySpinnerStyles} /> : null}
    </>
  )
}

function resolveActionControlClass(
  className: AnyActionControlProps['class'],
  cssProp: AnyActionControlProps['css'],
  tone: ActionControlTone | undefined,
): JSX.ClassValue {
  return resolveClass(className, cssProp, actionControlRecipe.raw({ tone }))
}

function isButtonAction(props: AnyActionControlProps): props is ActionControlProps<'button'> {
  return props.component == null || props.component === 'button'
}
