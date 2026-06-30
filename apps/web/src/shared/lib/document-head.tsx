import { createEffect } from 'solid-js'
import type { JSX } from '@solidjs/web'

// Reactive document <head> management for this client-rendered SPA. Replaces
// @solidjs/meta, whose SSR head-cascade machinery the app never uses and whose
// 0.30.0-next.0 <Title> trips STRICT_READ_UNTRACKED under solid-js 2.0.
//
// Each route mounts exactly one <Title>, so last-writer-wins is correct and no
// restore stack is needed — the incoming route's title overwrites the previous
// one on mount. <Meta> instead upserts a tag by name and restores it on unmount,
// so a page's meta never lingers after navigation and never duplicates the
// static tag already in index.html.

export function Title(props: { children: string }): JSX.Element {
  createEffect(
    () => props.children,
    (title) => {
      document.title = title
    },
  )

  return null
}

type MetaProps = {
  name: string
  content: string
}

export function Meta(props: MetaProps): JSX.Element {
  createEffect(
    () => ({ content: props.content, name: props.name }),
    ({ content, name }) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      const element = existing ?? appendMetaElement(name)
      const previousContent = existing?.getAttribute('content') ?? null

      element.setAttribute('content', content)

      return () => {
        if (previousContent == null) element.remove()
        else element.setAttribute('content', previousContent)
      }
    },
  )

  return null
}

function appendMetaElement(name: string): HTMLMetaElement {
  const element = document.createElement('meta')
  element.setAttribute('name', name)
  document.head.appendChild(element)

  return element
}
