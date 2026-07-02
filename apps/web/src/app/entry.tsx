import { render } from '@solidjs/web'
import { createAppI18n } from '~/app/i18n/config'
import { App } from '~/app/shell/App'

const appRoot = document.querySelector('#app')
if (appRoot == null) throw new Error('App container element not found')

;(async function bootstrap() {
  const i18n = await createAppI18n()

  render(() => <App i18n={i18n} />, appRoot)
})()
