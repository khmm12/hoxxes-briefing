import { render } from '@solidjs/web'
import { App } from '~/app/App'
import { createAppI18n } from '~/app/i18n/config'

const appRoot = document.querySelector('#app')

if (appRoot == null) {
  throw new Error('App container element not found')
}

const mountNode = appRoot

async function bootstrap() {
  const i18n = await createAppI18n()

  render(() => <App i18n={i18n} />, mountNode)
}

void bootstrap()
