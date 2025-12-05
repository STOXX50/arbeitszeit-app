// Online/Offline Status Hook
// Erfüllt Testfälle: STATUS-001, STATUS-002, STATUS-005, STATUS-006, STATUS-007, STATUS-008

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface OnlineStatus {
  isOnline: boolean
  isOfflineCapable: boolean
  connectionType?: string
  lastOnline?: Date
  lastOffline?: Date
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [isOfflineCapable, setIsOfflineCapable] = useState(false)
  const [connectionType, setConnectionType] = useState<string>()
  const [lastOnline, setLastOnline] = useState<Date>()
  const [lastOffline, setLastOffline] = useState<Date>()

  // STATUS-001: Online/Offline Status Detection
  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine
    setIsOnline(online)
    
    if (online) {
      setLastOnline(new Date())
    } else {
      setLastOffline(new Date())
    }

    // Connection Type Detection (wenn verfügbar)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection // eslint-disable-line @typescript-eslint/no-explicit-any
      setConnectionType(connection?.effectiveType || connection?.type)
    }
  }, [])

  // Service Worker Status für Offline-Fähigkeit
  const checkOfflineCapability = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      setIsOfflineCapable(!!registration?.active)
    }
  }, [])

  useEffect(() => {
    // Initial Status setzen
    updateOnlineStatus()
    checkOfflineCapability()

    // STATUS-002: Event Listener für Status-Änderungen
    const handleOnline = () => {
      updateOnlineStatus()
      console.log('🌐 Verbindung wiederhergestellt')
    }

    const handleOffline = () => {
      updateOnlineStatus()
      console.log('📱 Offline-Modus aktiviert')
    }

    // Event Listeners registrieren
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection Change Events (wenn verfügbar)
    let connectionChangeCleanup: (() => void) | undefined

    if ('connection' in navigator) {
      const connection = (navigator as any).connection // eslint-disable-line @typescript-eslint/no-explicit-any
      const handleConnectionChange = () => {
        setConnectionType(connection?.effectiveType || connection?.type)
      }
      connection?.addEventListener('change', handleConnectionChange)
      
      connectionChangeCleanup = () => {
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }

    // Cleanup-Funktion
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connectionChangeCleanup?.()
    }
  }, [updateOnlineStatus, checkOfflineCapability])

  // Service Worker Updates überwachen
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        checkOfflineCapability()
      }
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
      
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [checkOfflineCapability])

  return {
    isOnline,
    isOfflineCapable,
    connectionType,
    lastOnline,
    lastOffline
  }
}

// Hook für erweiterte Network Information
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }>({})

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection // eslint-disable-line @typescript-eslint/no-explicit-any
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)

      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}