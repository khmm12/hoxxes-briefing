import { afterEach, describe, expect, it } from 'vitest'
import { createSignal, flush } from 'solid-js'
import { render } from '@solidjs/testing-library'
import { Meta, Title } from './document-head'

afterEach(() => {
  document.title = ''
  for (const tag of document.head.querySelectorAll('meta[name="description"]')) tag.remove()
})

describe('Title', () => {
  it('writes the document title and tracks changes', () => {
    const [title, setTitle] = createSignal('First')

    render(() => <Title>{title()}</Title>)
    expect(document.title).toBe('First')

    setTitle('Second')
    flush()
    expect(document.title).toBe('Second')
  })
})

describe('Meta', () => {
  it('upserts an existing tag and restores its content on unmount', () => {
    const original = document.createElement('meta')
    original.setAttribute('name', 'description')
    original.setAttribute('content', 'static')
    document.head.appendChild(original)

    const { unmount } = render(() => <Meta name="description" content="page" />)

    const tags = document.head.querySelectorAll('meta[name="description"]')
    expect(tags).toHaveLength(1)
    expect(tags[0]).toBe(original)
    expect(original.getAttribute('content')).toBe('page')

    unmount()
    expect(original.getAttribute('content')).toBe('static')
  })

  it('creates a tag when none exists and removes it on unmount', () => {
    expect(document.head.querySelector('meta[name="description"]')).toBeNull()

    const { unmount } = render(() => <Meta name="description" content="page" />)

    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('page')

    unmount()
    expect(document.head.querySelector('meta[name="description"]')).toBeNull()
  })

  it('tracks content changes on the same tag', () => {
    const [content, setContent] = createSignal('one')

    render(() => <Meta name="description" content={content()} />)
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('one')

    setContent('two')
    flush()
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('two')
  })
})
