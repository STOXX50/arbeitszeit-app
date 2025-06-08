// Offline-Indikator Komponente
// Erfüllt Testfälle: UI-001, UI-002, UI-003, UI-004, STATUS-003, STATUS-004

'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { swManager } from '@/lib/serviceWorker'

interface OfflineIndicatorProps {
  className?: string
  showWhenOnline?: boolean
}

export default function OfflineIndicator({ 
  className = '', 
  showWhenOnline = false 
}: OfflineIndicatorProps) {
  const { isOnline, isOfflineCapable, connectionType, lastOffline } = useOnlineStatus()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Update Detection
  useEffect(() => {
    swManager.onUpdate(() => {
      setUpdateAvailable(true)
    })
  }, [])

  // Toast für Status-Änderungen (UI-004)
  useEffect(() => {
    if (!isOnline && lastOffline) {
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, lastOffline])

  // Update anwenden
  const handleUpdate = async () => {
    setIsUpdating(true)
    swManager.applyUpdate()
  }

  // Nichts anzeigen wenn online und showWhenOnline false (STATUS-004)
  if (isOnline && !showWhenOnline && !updateAvailable) {
    return null
  }

  return (
    <>
      {/* Hauptindikator (UI-001, STATUS-003) */}
      <div className={`
        fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
        transition-all duration-300 ease-in-out
        ${isOnline 
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
          : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
        }
        ${className}
      `}>
        {/* Status Icon */}
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        
        {/* Status Text */}
        <span className="text-sm font-medium">
          {isOnline ? (
            <>
              Online
              {connectionType && (
                <span className="text-xs opacity-75 ml-1">
                  ({connectionType})
                </span>
              )}
            </>
          ) : (
            'Offline'
          )}
        </span>

        {/* Offline-Fähigkeit Indicator */}
        {!isOnline && isOfflineCapable && (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        )}
        
        {!isOnline && !isOfflineCapable && (
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Update Verfügbar Indicator (UI-002) */}
      {updateAvailable && (
        <div className="fixed top-16 right-4 z-50 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isUpdating ? 'Wird aktualisiert...' : 'Update verfügbar'}
            </span>
            {!isUpdating && (
              <button
                onClick={handleUpdate}
                className="ml-2 text-xs underline hover:no-underline"
              >
                Jetzt aktualisieren
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast-Benachrichtigung (UI-004) */}
      {showToast && (
        <div className={`
          fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
          px-4 py-2 rounded-lg shadow-lg transition-all duration-300
          ${!isOnline 
            ? 'bg-orange-500 text-white' 
            : 'bg-green-500 text-white'
          }
        `}>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {!isOnline 
                ? isOfflineCapable 
                  ? 'Offline-Modus aktiviert - App funktioniert weiter!'
                  : 'Keine Internetverbindung'
                : 'Verbindung wiederhergestellt'
              }
            </span>
          </div>
        </div>
      )}
    </>
  )
}