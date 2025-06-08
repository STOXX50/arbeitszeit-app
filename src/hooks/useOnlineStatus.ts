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
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const handleConnectionChange = () => {
        setConnectionType(connection?.effectiveType || connection?.type)
      }
      connection?.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateOnlineStatus, checkOfflineCapability])

  // Service Worker Updates überwachen
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        checkOfflineCapability()
      })
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
      const connection = (navigator as any).connection
      
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