'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Clock, Settings, Calculator, Coffee, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'

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

  // Hilfsfunktion: Zeit in Minuten konvertieren
  const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(':')) return 0
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Hilfsfunktion: Minuten in Zeit konvertieren  
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Hilfsfunktion: Automatische Pausenzeit bestimmen (externe System-Logik)
  const getAutomaticBreakTime = (totalMinutes: number): number => {
    const totalHours = totalMinutes / 60
    
    if (totalHours < 6) {
      return 0 // Keine Pause unter 6 Stunden
    } else if (totalHours >= 6 && totalHours <= 9) {
      return 30 // 30 Min Pause von 6 bis 9 Stunden
    } else {
      return 45 // 30 Min + 15 Min zusätzlich = 45 Min ab über 9 Stunden
    }
  }

  // Berechne Gesamtstunden
  const calculateTotalHours = (start: string, end: string, useAutomaticBreaks: boolean): string => {
    if (!start || !end) return ''
    
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    
    let totalMinutes = endMinutes - startMinutes
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60 // Übernacht
    }
    
    // Automatische Pausenzeit abziehen, wenn aktiviert
    if (useAutomaticBreaks) {
      const breakMinutes = getAutomaticBreakTime(totalMinutes)
      totalMinutes -= breakMinutes
    }
    
    // Negative Zeiten vermeiden
    if (totalMinutes < 0) totalMinutes = 0
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Berechne Zielzeiten
  const calculateEndTimes = (startTime: string) => {
    if (!startTime) {
      setCalculatedEndTimes({ end1: '', end2: '', end3: '' })
      return
    }

    const startMinutes = timeToMinutes(startTime)
    
    // Für jede Zielzeit die benötigten Arbeitsminuten berechnen
    const calculateRequiredWorkTime = (targetHours: string): number => {
      const targetMinutes = timeToMinutes(targetHours)
      
      // Wenn Zielzeit 6:00 Std oder weniger ist, keine Pause berechnen
      if (targetMinutes <= 360) { // 360 Min = 6 Std
        return targetMinutes
      }
      
      if (workingHours.useAutomaticBreaks) {
        // Wir müssen iterativ die benötigte Gesamtzeit finden
        // da die Pausenzeit von der Gesamtzeit abhängt
        for (let totalMinutes = targetMinutes; totalMinutes <= targetMinutes + 60; totalMinutes++) {
          const breakMinutes = getAutomaticBreakTime(totalMinutes)
          const workingMinutes = totalMinutes - breakMinutes
          
          if (workingMinutes >= targetMinutes) {
            return totalMinutes
          }
        }
        return targetMinutes + getAutomaticBreakTime(targetMinutes + 45) // Fallback
      }
      
      return targetMinutes // Ohne Pausen
    }
    
    const end1Minutes = calculateRequiredWorkTime(targetTimes.target1)
    const end2Minutes = calculateRequiredWorkTime(targetTimes.target2)
    const end3Minutes = calculateRequiredWorkTime(targetTimes.target3)
    
    const end1 = minutesToTime(startMinutes + end1Minutes)
    const end2 = minutesToTime(startMinutes + end2Minutes)
    const end3 = minutesToTime(startMinutes + end3Minutes)
    
    setCalculatedEndTimes({ end1, end2, end3 })
  }

  // Hilfsfunktion: Aktuelle Pausenzeit ermitteln (für Anzeige)
  const getCurrentBreakTime = (): string => {
    if (workingHours.useAutomaticBreaks && workingHours.startTime && workingHours.endTime) {
      const startMinutes = timeToMinutes(workingHours.startTime)
      const endMinutes = timeToMinutes(workingHours.endTime)
      let totalMinutes = endMinutes - startMinutes
      if (totalMinutes < 0) totalMinutes += 24 * 60
      
      const automaticBreakMinutes = getAutomaticBreakTime(totalMinutes)
      return minutesToTime(automaticBreakMinutes)
    }
    
    return '00:00'
  }

  // Hilfsfunktion: Mehrstunden berechnen (externe System-Logik)
  const calculateOvertime = (targetHours: string): { text: string; isPositive: boolean } => {
    if (!workingHours.startTime || !workingHours.endTime || !targetHours) {
      return { text: '00:00 Std.', isPositive: true }
    }
    
    // Bruttoarbeitszeit berechnen
    const startMinutes = timeToMinutes(workingHours.startTime)
    const endMinutes = timeToMinutes(workingHours.endTime)
    let bruttoMinutes = endMinutes - startMinutes
    if (bruttoMinutes < 0) {
      bruttoMinutes += 24 * 60 // Übernacht
    }
    
    const targetMinutes = timeToMinutes(targetHours)
    let arbeitsMinutes = bruttoMinutes
    
    // Bei Zielzeiten ÜBER 6 Stunden: Pausenabzug für Mehrstunden-Berechnung
    if (targetMinutes > 360) { // 360 Min = 6 Std
      if (workingHours.useAutomaticBreaks) {
        const breakMinutes = getAutomaticBreakTime(bruttoMinutes)
        arbeitsMinutes = bruttoMinutes - breakMinutes
      }
    }
    // Bei Zielzeiten <= 6 Stunden: Keine Pausenabzüge (Bruttoarbeitszeit)
    
    const diffMinutes = arbeitsMinutes - targetMinutes
    
    const hours = Math.floor(Math.abs(diffMinutes) / 60)
    const minutes = Math.abs(diffMinutes) % 60
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Std.`
    
    if (diffMinutes >= 0) {
      return { text: `+ ${timeString}`, isPositive: true }
    } else {
      return { text: `- ${timeString}`, isPositive: false }
    }
  }

  // Effect für Gesamtstunden-Berechnung
  useEffect(() => {
    const total = calculateTotalHours(
      workingHours.startTime, 
      workingHours.endTime, 
      workingHours.useAutomaticBreaks
    )
    setWorkingHours(prev => ({ ...prev, totalHours: total }))
  }, [workingHours.startTime, workingHours.endTime, workingHours.useAutomaticBreaks])

  // Effect für Zielzeiten-Berechnung
  useEffect(() => {
    calculateEndTimes(workingHours.startTime)
  }, [workingHours.startTime, targetTimes, workingHours.useAutomaticBreaks])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6 relative">
          {/* Dark Mode Toggle */}
          <div className="absolute top-0 right-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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
                    <div className="text-blue-600 dark:text-blue-300">{getCurrentBreakTime()}</div>
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
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Einstellungen */}
            {showSettings && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Zielzeiten anpassen</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target1">Zielzeit 1</Label>
                    <Input
                      id="target1"
                      type="time"
                      value={targetTimes.target1}
                      onChange={(e) => setTargetTimes(prev => ({
                        ...prev,
                        target1: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target2">Zielzeit 2</Label>
                    <Input
                      id="target2"
                      type="time"
                      value={targetTimes.target2}
                      onChange={(e) => setTargetTimes(prev => ({
                        ...prev,
                        target2: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target3">Zielzeit 3</Label>
                    <Input
                      id="target3"
                      type="time"
                      value={targetTimes.target3}
                      onChange={(e) => setTargetTimes(prev => ({
                        ...prev,
                        target3: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>
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
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {targetTimes.target1} Stunden
                      </div>
                      <div className="text-2xl font-bold text-[#ff5a01] mb-2">
                        {calculatedEndTimes.end1}
                      </div>
                      {(workingHours.startTime && workingHours.endTime) && (
                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mehrstunden</div>
                          <div className={`text-sm font-semibold ${
                            calculateOvertime(targetTimes.target1).isPositive 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {calculateOvertime(targetTimes.target1).text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-[#2f53a7]/10 rounded-lg border border-[#2f53a7]/30">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {targetTimes.target2} Stunden
                      </div>
                      <div className="text-2xl font-bold text-[#2f53a7] mb-2">
                        {calculatedEndTimes.end2}
                      </div>
                      {(workingHours.startTime && workingHours.endTime) && (
                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mehrstunden</div>
                          <div className={`text-sm font-semibold ${
                            calculateOvertime(targetTimes.target2).isPositive 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {calculateOvertime(targetTimes.target2).text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {targetTimes.target3} Stunden
                      </div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-200 mb-2">
                        {calculatedEndTimes.end3}
                      </div>
                      {(workingHours.startTime && workingHours.endTime) && (
                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mehrstunden</div>
                          <div className={`text-sm font-semibold ${
                            calculateOvertime(targetTimes.target3).isPositive 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {calculateOvertime(targetTimes.target3).text}
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
