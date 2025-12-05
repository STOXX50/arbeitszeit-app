// Service Worker Registration und Utils
// Erfüllt Testfälle: SW-001, SW-002, SW-003, SW-004, SW-006, SW-007, SW-008

import { Workbox } from 'workbox-window'

export class ServiceWorkerManager {
  //private workbox: unknown = null
  //private workbox: WorkboxLike | null = null
  private workbox: Workbox | null = null
  private updateAvailable = false
  //private onUpdateCallback?: (registration: ServiceWorkerRegistration) => void
  private onUpdateCallback?: (sw: ServiceWorker) => void

  constructor() {
    this.initServiceWorker()
  }

  // SW-001, SW-002: Service Worker Registrierung
  private async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker nicht unterstützt')
      return
    }

    try {
      // Workbox Window für besseres Update-Handling
      if (process.env.NODE_ENV === 'production') {
        const { Workbox } = await import('workbox-window')
        this.workbox = new Workbox('/sw.js')
        
        /*
        type WorkboxWaitingEvent = Event & {
          sw: ServiceWorker
        }
        */

        // SW-006, SW-007: Update Detection
        /*
        this.workbox.addEventListener('waiting', (event: any) => {
          this.updateAvailable = true
          this.onUpdateCallback?.(event.sw)
          this.showUpdatePrompt()
        })
        */
        this.workbox?.addEventListener('waiting', (event) => {
          this.updateAvailable = true

          if (event.sw) {
            this.onUpdateCallback?.(event.sw)
          }
          //this.onUpdateCallback?.(event.sw)

          this.showUpdatePrompt()
        })


        // SW-008: Update ohne Datenverlust
        this.workbox.addEventListener('controlling', () => {
          window.location.reload()
        })

        // Registrierung starten
        await this.workbox.register()
        console.log('Service Worker erfolgreich registriert')
      } else {
        // Development Mode: Einfache Registrierung für Testing
        await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registriert (Development)')
      }
    } catch (error) {
      console.error('Service Worker Registrierung fehlgeschlagen:', error)
    }
  }

  // SW-007: Update Prompt anzeigen
  private showUpdatePrompt() {
    const shouldUpdate = confirm(
      'Eine neue Version der App ist verfügbar. Möchten Sie jetzt aktualisieren?'
    )
    
    if (shouldUpdate) {
      this.applyUpdate()
    }
  }

  // SW-008: Update anwenden
  public applyUpdate() {
    if (this.workbox && this.updateAvailable) {
      this.workbox.messageSkipWaiting()
    }
  }

  // SW-004: Service Worker deregistrieren
  public async unregister() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      console.log('Service Worker deregistriert')
    }
  }

  // SW-002: Service Worker Status prüfen
  public async getStatus(): Promise<'activated' | 'installing' | 'waiting' | 'redundant' | 'not_supported'> {
    if (!('serviceWorker' in navigator)) {
      return 'not_supported'
    }

    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return 'not_supported'
    }

    if (registration.active) return 'activated'
    if (registration.installing) return 'installing'
    if (registration.waiting) return 'waiting'
    
    return 'redundant'
  }

  // Callback für Update-Events
  /*
  public onUpdate(callback: (registration: ServiceWorkerRegistration) => void) {
    this.onUpdateCallback = callback
  }
  */
  public onUpdate(callback: (sw: ServiceWorker) => void) {
    this.onUpdateCallback = callback
  }

  // SW-003: Check ob Service Worker läuft
  public isActive(): boolean {
    return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller
  }
}

// Singleton Instance
export const swManager = new ServiceWorkerManager()

// Utility Functions
export const isServiceWorkerSupported = (): boolean => {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

export const isOfflineCapable = (): boolean => {
  return isServiceWorkerSupported() && swManager.isActive()
}