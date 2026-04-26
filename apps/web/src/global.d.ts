declare module '*.po' {
  export const messages: Record<string, string>
}

interface BeforeInstallPromptEvent extends Event {
  platforms?: string[]
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface Navigator {
  standalone?: boolean
}

interface WindowEventMap {
  appinstalled: Event
  beforeinstallprompt: BeforeInstallPromptEvent
}
