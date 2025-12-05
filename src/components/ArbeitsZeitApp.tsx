'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Clock, Settings, Calculator, Coffee, Moon, Sun, Wifi, WifiOff } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { storage } from '@/lib/storage'
import OfflineIndicator from './OfflineIndicator'
import SettingsPanel from './SettingsPanel'

// CSS-Klassen Konstanten für bessere Maintainability
const CSS_CLASSES = {
  container: "min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors",
  maxWidth: "max-w-4xl mx-auto space-y-6",
  targetCard: "p-4 rounded-lg border",
  targetTime: "text-2xl font-bold mb-2",
  mehrstundenText: "text-xs text-gray-600 dark:text-gray-300 mb-1",
  positiveOvertime: "text-sm font-semibold text-green-600 dark:text-green-400",
  negativeOvertime: "text-sm font-semibold text-red-600 dark:text-red-400"
} as const

// Konstanten
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR
const SIX_HOURS_IN_MINUTES = 6 * MINUTES_PER_HOUR
const STANDARD_BREAK_MINUTES = 30
const EXTENDED_BREAK_MINUTES = 45

interface WorkingHours {
  startTime: string
  endTime: string
  totalHours: string
  useAutomaticBreaks: boolean
}

interface TargetTimes {
  target1: string
  target2: string
  target3: string
}

export default function ArbeitsZeitApp() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const { isOnline, isOfflineCapable } = useOnlineStatus()
  
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    startTime: '',
    endTime: '',
    totalHours: '',
    useAutomaticBreaks: true
  })

  const [targetTimes, setTargetTimes] = useState<TargetTimes>({
    target1: '06:00',
    target2: '07:48',
    target3: '08:24'
  })

  const [showSettings, setShowSettings] = useState(false)
  const [calculatedEndTimes, setCalculatedEndTimes] = useState({
    end1: '',
    end2: '',
    end3: ''
  })

  // Auto-Save für Offline-Persistierung
  const [autoSave, setAutoSave] = useState(true)
  // const [lastSaved, setLastSaved] = useState<Date | null>(null) // Für zukünftige Verwendung

  // OFFLINE-006, OFFLINE-007, OFFLINE-008: Daten beim Start laden
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Arbeitszeiten laden
        const savedWorkingHours = storage.getWorkingHours()
        if (savedWorkingHours) {
          setWorkingHours(prev => ({
            ...prev,
            startTime: savedWorkingHours.startTime || '',
            endTime: savedWorkingHours.endTime || '',
            useAutomaticBreaks: savedWorkingHours.useAutomaticBreaks ?? true
          }))
        }

        // Zielzeiten laden
        const savedTargetTimes = storage.getTargetTimes()
        if (savedTargetTimes) {
          setTargetTimes(savedTargetTimes)
        }

        // Einstellungen laden (inkl. Dark Mode)
        const savedSettings = storage.getSettings()
        if (savedSettings) {
          setAutoSave(savedSettings.autoSave ?? true)
          // Dark Mode wird bereits vom useDarkMode Hook geladen
        }

        console.log('📱 Offline-Daten erfolgreich geladen')
      } catch (error) {
        console.error('Fehler beim Laden der Offline-Daten:', error)
      }
    }

    loadSavedData()
  }, [])

  // Auto-Save Effect für Arbeitszeiten
  useEffect(() => {
    if (autoSave && (workingHours.startTime || workingHours.endTime)) {
      const saveData = () => {
        const success = storage.saveWorkingHours({
          startTime: workingHours.startTime,
          endTime: workingHours.endTime,
          totalHours: workingHours.totalHours,
          useAutomaticBreaks: workingHours.useAutomaticBreaks
        })
        
        if (success) {
          // setLastSaved(new Date()) // Für zukünftige Verwendung
        }
      }

      // Debounced Save (500ms Verzögerung)
      const timeoutId = setTimeout(saveData, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [workingHours, autoSave])

  // Auto-Save für Zielzeiten
  useEffect(() => {
    if (autoSave && targetTimes) {
      const timeoutId = setTimeout(() => {
        storage.saveTargetTimes(targetTimes)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [targetTimes, autoSave])

  // Hilfsfunktion: Zeit in Minuten konvertieren mit Validierung
  const timeToMinutes = (time: string): number => {
    if (!time?.includes(':')) return 0
    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 0
    }
    return hours * MINUTES_PER_HOUR + minutes
  }

  // Hilfsfunktion: Minuten in Zeit konvertieren  
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR)
    const mins = minutes % MINUTES_PER_HOUR
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Hilfsfunktion: Automatische Pausenzeit bestimmen (externe System-Logik)
  const getAutomaticBreakTime = (totalMinutes: number): number => {
    const totalHours = totalMinutes / MINUTES_PER_HOUR
    
    if (totalHours < 6) return 0
    if (totalHours <= 9) return STANDARD_BREAK_MINUTES
    return EXTENDED_BREAK_MINUTES
  }

  // Berechne Gesamtstunden
  const calculateTotalHours = useCallback((start: string, end: string, useAutomaticBreaks: boolean): string => {
    if (!start || !end) return ''
    
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    
    let totalMinutes = endMinutes - startMinutes
    if (totalMinutes < 0) totalMinutes += MINUTES_PER_DAY // Übernacht
    
    // Automatische Pausenzeit abziehen, wenn aktiviert
    if (useAutomaticBreaks) {
      totalMinutes -= getAutomaticBreakTime(totalMinutes)
    }
    
    // Negative Zeiten vermeiden
    if (totalMinutes < 0) totalMinutes = 0
    
    const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
    const minutes = totalMinutes % MINUTES_PER_HOUR
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [])

  // Berechne Zielzeiten
  const calculateEndTimes = useCallback((startTime: string) => {
    if (!startTime) {
      setCalculatedEndTimes({ end1: '', end2: '', end3: '' })
      return
    }

    const startMinutes = timeToMinutes(startTime)
    
    // Für jede Zielzeit die benötigten Arbeitsminuten berechnen
    const calculateRequiredWorkTime = (targetHours: string): number => {
      const targetMinutes = timeToMinutes(targetHours)
      
      // Wenn Zielzeit 6:00 Std oder weniger ist, keine Pause berechnen
      if (targetMinutes <= SIX_HOURS_IN_MINUTES) return targetMinutes
      
      if (workingHours.useAutomaticBreaks) {
        // Iterativ die benötigte Gesamtzeit finden
        for (let totalMinutes = targetMinutes; totalMinutes <= targetMinutes + 60; totalMinutes++) {
          const breakMinutes = getAutomaticBreakTime(totalMinutes)
          if (totalMinutes - breakMinutes >= targetMinutes) {
            return totalMinutes
          }
        }
        return targetMinutes + EXTENDED_BREAK_MINUTES // Fallback mit Standard-Pause
      }
      
      return targetMinutes
    }
    
    const targets = [targetTimes.target1, targetTimes.target2, targetTimes.target3]
    const endTimes = targets.map(target => {
      const requiredMinutes = calculateRequiredWorkTime(target)
      return minutesToTime(startMinutes + requiredMinutes)
    })
    
    setCalculatedEndTimes({
      end1: endTimes[0],
      end2: endTimes[1], 
      end3: endTimes[2]
    })
  }, [workingHours.useAutomaticBreaks, targetTimes.target1, targetTimes.target2, targetTimes.target3])

  // Memoized: Aktuelle Pausenzeit
  const memoizedBreakTime = useMemo(() => {
    if (!workingHours.useAutomaticBreaks || !workingHours.startTime || !workingHours.endTime) {
      return '00:00'
    }
    
    const startMinutes = timeToMinutes(workingHours.startTime)
    const endMinutes = timeToMinutes(workingHours.endTime)
    let totalMinutes = endMinutes - startMinutes
    if (totalMinutes < 0) totalMinutes += MINUTES_PER_DAY
    
    return minutesToTime(getAutomaticBreakTime(totalMinutes))
  }, [workingHours.useAutomaticBreaks, workingHours.startTime, workingHours.endTime])

  // Hilfsfunktion: Mehrstunden berechnen (externe System-Logik)
  const calculateOvertime = useCallback((targetHours: string): { text: string; isPositive: boolean } => {
    if (!workingHours.startTime || !workingHours.endTime || !targetHours) {
      return { text: '00:00 Std.', isPositive: true }
    }
    
    const startMinutes = timeToMinutes(workingHours.startTime)
    const endMinutes = timeToMinutes(workingHours.endTime)
    let bruttoMinutes = endMinutes - startMinutes
    if (bruttoMinutes < 0) bruttoMinutes += MINUTES_PER_DAY // Übernacht
    
    const targetMinutes = timeToMinutes(targetHours)
    let arbeitsMinutes = bruttoMinutes
    
    // Bei Zielzeiten ÜBER 6 Stunden: Pausenabzug für Mehrstunden-Berechnung
    if (targetMinutes > SIX_HOURS_IN_MINUTES && workingHours.useAutomaticBreaks) {
      arbeitsMinutes = bruttoMinutes - getAutomaticBreakTime(bruttoMinutes)
    }
    
    const diffMinutes = arbeitsMinutes - targetMinutes
    const hours = Math.floor(Math.abs(diffMinutes) / MINUTES_PER_HOUR)
    const minutes = Math.abs(diffMinutes) % MINUTES_PER_HOUR
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Std.`
    
    return {
      text: diffMinutes >= 0 ? `+ ${timeString}` : `- ${timeString}`,
      isPositive: diffMinutes >= 0
    }
  }, [workingHours.startTime, workingHours.endTime, workingHours.useAutomaticBreaks])

  // Effect für Gesamtstunden-Berechnung
  useEffect(() => {
    const total = calculateTotalHours(
      workingHours.startTime, 
      workingHours.endTime, 
      workingHours.useAutomaticBreaks
    )
    setWorkingHours(prev => ({ ...prev, totalHours: total }))
  }, [workingHours.startTime, workingHours.endTime, workingHours.useAutomaticBreaks, calculateTotalHours])

  // Memoized: Check if both times are entered
  const hasValidTimes = useMemo(() => 
    Boolean(workingHours.startTime && workingHours.endTime),
    [workingHours.startTime, workingHours.endTime]
  )

  // Memoized berechnete Werte für bessere Performance
  const memoizedOvertimes = useMemo(() => ({
    overtime1: calculateOvertime(targetTimes.target1),
    overtime2: calculateOvertime(targetTimes.target2),
    overtime3: calculateOvertime(targetTimes.target3)
  }), [calculateOvertime, targetTimes])

  // Berechnung zur Historie hinzufügen (für zukünftige Verwendung)
  // const saveToHistory = useCallback(() => {
  //   if (workingHours.startTime && workingHours.endTime && workingHours.totalHours) {
  //     const success = storage.addToHistory({
  //       date: new Date().toISOString(),
  //       startTime: workingHours.startTime,
  //       endTime: workingHours.endTime,
  //       totalHours: workingHours.totalHours,
  //       breakTime: memoizedBreakTime,
  //       overtime: memoizedOvertimes.overtime2.text // Standard-Zielzeit als Referenz
  //     })
  //     
  //     if (success) {
  //       console.log('✅ Berechnung zur Historie hinzugefügt')
  //     }
  //   }
  // }, [workingHours, memoizedBreakTime, memoizedOvertimes.overtime2.text])

  // Effect für Zielzeiten-Berechnung
  useEffect(() => {
    calculateEndTimes(workingHours.startTime)
  }, [workingHours.startTime, targetTimes, workingHours.useAutomaticBreaks, calculateEndTimes])
  return (
    <div className={CSS_CLASSES.container}>
      {/* Offline-Indikator */}
      <OfflineIndicator showWhenOnline={false} />
      
      <div className={CSS_CLASSES.maxWidth}>
        <div className="text-center py-6 relative">
          {/* Dark Mode Toggle */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            {/* Offline-Status für Header */}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-orange-500" />
              )}
              <span>
                {isOnline ? 'Online' : isOfflineCapable ? 'Offline-bereit' : 'Offline'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={darkMode ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Logo und Titel */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <circle cx="50" cy="50" r="45" fill="#ff5a01" stroke="#2f53a7" strokeWidth="3"/>
              <circle cx="50" cy="50" r="35" fill="white" opacity="0.95"/>
              <g stroke="#2f53a7" strokeWidth="2" fill="#2f53a7">
                <rect x="49" y="18" width="2" height="8" rx="1"/>
                <rect x="74" y="49" width="8" height="2" rx="1"/>
                <rect x="49" y="74" width="2" height="8" rx="1"/>
                <rect x="18" y="49" width="8" height="2" rx="1"/>
              </g>
              <g stroke="#ff5a01" strokeWidth="1.5" opacity="0.7">
                <line x1="65.5" y1="22.5" x2="64" y2="25"/>
                <line x1="77.5" y1="34.5" x2="75" y2="36"/>
                <line x1="77.5" y1="65.5" x2="75" y2="64"/>
                <line x1="65.5" y1="77.5" x2="64" y2="75"/>
                <line x1="34.5" y1="77.5" x2="36" y2="75"/>
                <line x1="22.5" y1="65.5" x2="25" y2="64"/>
                <line x1="22.5" y1="34.5" x2="25" y2="36"/>
                <line x1="34.5" y1="22.5" x2="36" y2="25"/>
              </g>
              <line x1="50" y1="50" x2="40" y2="42" stroke="#2f53a7" strokeWidth="4" strokeLinecap="round"/>
              <line x1="50" y1="50" x2="68" y2="60" stroke="#ff5a01" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="3" fill="#2f53a7"/>
              <g opacity="0.8">
                <g transform="translate(75, 25)">
                  <circle r="8" fill="white" stroke="#ff5a01" strokeWidth="1.5"/>
                  <line x1="-4" y1="0" x2="4" y2="0" stroke="#ff5a01" strokeWidth="2"/>
                  <line x1="0" y1="-4" x2="0" y2="4" stroke="#ff5a01" strokeWidth="2"/>
                </g>
                <g transform="translate(25, 75)">
                  <circle r="8" fill="white" stroke="#2f53a7" strokeWidth="1.5"/>
                  <rect x="-3" y="-4" width="2" height="8" fill="#2f53a7" rx="1"/>
                  <rect x="1" y="-4" width="2" height="8" fill="#2f53a7" rx="1"/>
                </g>
              </g>
            </svg>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              Arbeitszeit Rechner
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Berechnen Sie Ihre Arbeitszeiten einfach und präzise
          </p>
        </div>

        {/* Hauptbereich: Arbeitszeit Eingabe */}
        <Card className="shadow-lg dark:shadow-xl">
          <CardHeader className="bg-[#ff5a01] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-white" />
              Arbeitszeit Eingabe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Startzeit */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium dark:text-gray-200">
                  Startzeit
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={workingHours.startTime}
                  onChange={(e) => setWorkingHours(prev => ({
                    ...prev,
                    startTime: e.target.value
                  }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault()
                      const endTimeInput = document.getElementById('endTime')
                      endTimeInput?.focus()
                    }
                  }}
                  className="text-lg"
                />
              </div>

              {/* Endzeit */}
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium dark:text-gray-200">
                  Endzeit
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={workingHours.endTime}
                  onChange={(e) => setWorkingHours(prev => ({
                    ...prev,
                    endTime: e.target.value
                  }))}
                  className="text-lg"
                />
              </div>

              {/* Pausenzeiten */}
              <div className="space-y-2">
                <Label htmlFor="breakTime" className="text-sm font-medium flex items-center gap-2 dark:text-gray-200">
                  <Coffee className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  Pausenzeiten
                </Label>
                
                {/* Automatische Pausenzeiten Toggle */}
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="useAutomaticBreaks"
                    checked={workingHours.useAutomaticBreaks}
                    onCheckedChange={(checked) => setWorkingHours(prev => ({
                      ...prev,
                      useAutomaticBreaks: checked
                    }))}
                  />
                  <Label htmlFor="useAutomaticBreaks" className="text-xs text-gray-600 dark:text-gray-400">
                    Automatische Pausenzeiten
                  </Label>
                </div>

                {/* Aktuelle Pausenzeit Anzeige */}
                {workingHours.useAutomaticBreaks && (
                  <div className="text-sm bg-blue-50 dark:bg-blue-900/30 p-2 rounded border dark:border-blue-800">
                    <div className="font-medium text-blue-800 dark:text-blue-200">Aktuelle Pause:</div>
                    <div className="text-blue-600 dark:text-blue-300">{memoizedBreakTime}</div>
                  </div>
                )}

                {/* Keine Pausenzeit Anzeige */}
                {!workingHours.useAutomaticBreaks && (
                  <div className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                    <div className="font-medium text-gray-600 dark:text-gray-300">Keine Pausenabzüge</div>
                  </div>
                )}

                {/* Pausenregeln Anzeige */}
                {workingHours.useAutomaticBreaks && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <div>• &lt; 6 Std: 0 Min</div>
                    <div>• 6 - 9 Std: 30 Min</div>
                    <div>• &gt; 9 Std: 45 Min (30+15)</div>
                  </div>
                )}
              </div>

              {/* Gesamtstunden */}
              <div className="space-y-2">
                <Label className="text-sm font-medium dark:text-gray-200">
                  Gesamtstunden
                  {workingHours.useAutomaticBreaks && (
                    <span className="text-xs text-gray-500 ml-1">
                      (ohne Pause)
                    </span>
                  )}
                </Label>
                <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md bg-muted">
                  <span className="text-lg font-semibold text-[#ff5a01]">
                    {workingHours.totalHours || '00:00'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zielzeiten Bereich */}
        <Card className="shadow-lg dark:shadow-xl">
          <CardHeader className="bg-[#2f53a7] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-white" />
                Zielzeiten Rechner
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
                aria-label={showSettings ? "Einstellungen schließen" : "Einstellungen öffnen"}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Einstellungen */}
            {showSettings && (
              <SettingsPanel 
                targetTimes={targetTimes}
                onTargetTimesChange={setTargetTimes}
              />
            )}

            {/* Berechnete Endzeiten */}
            {workingHours.startTime && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Basierend auf Startzeit: <span className="font-semibold">{workingHours.startTime}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#ff5a01]/10 rounded-lg border border-[#ff5a01]/30">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {targetTimes.target1} Stunden
                      </div>
                      <div className="text-2xl font-bold text-[#ff5a01] mb-2">
                        {calculatedEndTimes.end1}
                      </div>
                      {hasValidTimes && (
                        <div className="border-t pt-2">
                          <div className={CSS_CLASSES.mehrstundenText}>Mehrstunden</div>
                          <div className={
                            memoizedOvertimes.overtime1.isPositive 
                              ? CSS_CLASSES.positiveOvertime
                              : CSS_CLASSES.negativeOvertime
                          }>
                            {memoizedOvertimes.overtime1.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-[#2f53a7]/10 rounded-lg border border-[#2f53a7]/30">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {targetTimes.target2} Stunden
                      </div>
                      <div className="text-2xl font-bold text-[#2f53a7] mb-2">
                        {calculatedEndTimes.end2}
                      </div>
                      {hasValidTimes && (
                        <div className="border-t pt-2">
                          <div className={CSS_CLASSES.mehrstundenText}>Mehrstunden</div>
                          <div className={
                            memoizedOvertimes.overtime2.isPositive 
                              ? CSS_CLASSES.positiveOvertime
                              : CSS_CLASSES.negativeOvertime
                          }>
                            {memoizedOvertimes.overtime2.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {targetTimes.target3} Stunden
                      </div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-200 mb-2">
                        {calculatedEndTimes.end3}
                      </div>
                      {hasValidTimes && (
                        <div className="border-t pt-2">
                          <div className={CSS_CLASSES.mehrstundenText}>Mehrstunden</div>
                          <div className={
                            memoizedOvertimes.overtime3.isPositive 
                              ? CSS_CLASSES.positiveOvertime
                              : CSS_CLASSES.negativeOvertime
                          }>
                            {memoizedOvertimes.overtime3.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!workingHours.startTime && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geben Sie eine Startzeit ein, um die Zielzeiten zu berechnen</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          <p>Arbeitszeit Rechner - Präzise Zeiterfassung für Ihren Arbeitsalltag</p>
        </div>
      </div>
    </div>
  )
}
