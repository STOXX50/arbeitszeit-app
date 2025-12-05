// Erweiterte LocalStorage Utils für Offline-Persistierung
// Erfüllt Testfälle: DATA-001, DATA-002, DATA-003, DATA-004, OFFLINE-006, OFFLINE-007, OFFLINE-008

export interface StorageData {
  workingHours?: {
    startTime: string
    endTime: string
    totalHours: string
    useAutomaticBreaks: boolean
    lastCalculated?: string
  } | null
  targetTimes?: {
    target1: string
    target2: string
    target3: string
  } | null
  settings?: {
    darkMode: boolean
    notifications: boolean
    autoSave: boolean
  } | null
  history?: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    totalHours: string
    breakTime: string
    overtime?: string
  }>
}

class LocalStorageManager {
  private readonly PREFIX = 'arbeitszeit_app_'
  private readonly MAX_HISTORY_ENTRIES = 50
  private readonly VERSION = '1.0.0'

  constructor() {
    this.migrateData()
  }

  // DATA-003: Ungültige Daten behandeln
  private isValidData(data: unknown): boolean {
    try {
      return data !== null && typeof data === 'object'
    } catch {
      return false
    }
  }

  // DATA-004: Quota Management
  private checkStorageQuota(): boolean {
    try {
      const testKey = `${this.PREFIX}quota_test`
      const testData = 'x'.repeat(1024) // 1KB Test
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      console.warn('LocalStorage Quota erreicht:', error)
      this.cleanupOldData()
      return false
    }
  }

  // Alte Daten aufräumen
  private cleanupOldData(): void {
    try {
      const history = this.getHistory()
      if (history.length > this.MAX_HISTORY_ENTRIES) {
        const trimmedHistory = history
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, this.MAX_HISTORY_ENTRIES)
        this.saveHistory(trimmedHistory)
      }
    } catch (error) {
      console.error('Fehler beim Aufräumen der Daten:', error)
    }
  }

  // Daten-Migration für neue Versionen
  private migrateData(): void {
    const currentVersion = this.get('version')
    if (currentVersion !== this.VERSION) {
      console.log('Daten-Migration wird durchgeführt...')
      // Hier könnten zukünftige Migrationen stehen
      this.set('version', this.VERSION)
    }
  }

  // Basis Get/Set Methoden
  public get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      return this.isValidData(parsed) ? parsed : null
    } catch (error) {
      console.error(`Fehler beim Laden von ${key}:`, error)
      return null
    }
  }

  public set<T>(key: string, value: T): boolean {
    try {
      if (!this.checkStorageQuota()) {
        return false
      }
      
      const serialized = JSON.stringify(value)
      localStorage.setItem(`${this.PREFIX}${key}`, serialized)
      return true
    } catch (error) {
      console.error(`Fehler beim Speichern von ${key}:`, error)
      return false
    }
  }

  public remove(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`)
    } catch (error) {
      console.error(`Fehler beim Löschen von ${key}:`, error)
    }
  }

  // OFFLINE-006: Arbeitszeiten persistieren
  public saveWorkingHours(data: StorageData['workingHours']): boolean {
    if (!data) return false
    
    const enhancedData = {
      ...data,
      lastCalculated: new Date().toISOString()
    }
    
    return this.set('workingHours', enhancedData)
  }

  public getWorkingHours(): StorageData['workingHours'] | null {
    return this.get<StorageData['workingHours']>('workingHours')
  }

  // OFFLINE-007: Zielzeiten persistieren
  public saveTargetTimes(data: StorageData['targetTimes']): boolean {
    return this.set('targetTimes', data)
  }

  public getTargetTimes(): StorageData['targetTimes'] | null {
    return this.get<StorageData['targetTimes']>('targetTimes')
  }

  // OFFLINE-008: Einstellungen persistieren
  public saveSettings(data: StorageData['settings']): boolean {
    return this.set('settings', data)
  }

  public getSettings(): StorageData['settings'] | null {
    const defaultSettings = {
      darkMode: false,
      notifications: true,
      autoSave: true
    }
    
    const saved = this.get<StorageData['settings']>('settings')
    return saved ? { ...defaultSettings, ...saved } : defaultSettings
  }

  // OFFLINE-009: Historie verwalten
  public addToHistory(entry: {
    date: string
    startTime: string
    endTime: string
    totalHours: string
    breakTime: string
    overtime?: string
  }): boolean {
    const history = this.getHistory()
    const newEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...entry
    }
    
    const updatedHistory = [newEntry, ...history]
      .slice(0, this.MAX_HISTORY_ENTRIES)
    
    return this.saveHistory(updatedHistory)
  }

  public getHistory(): NonNullable<StorageData['history']> {
    return this.get<StorageData['history']>('history') || []
  }

  public saveHistory(history: StorageData['history']): boolean {
    return this.set('history', history)
  }

  public clearHistory(): boolean {
    return this.set('history', [])
  }

  // Komplett-Export für Backup
  public exportData(): StorageData {
    return {
      workingHours: this.getWorkingHours(),
      targetTimes: this.getTargetTimes(),
      settings: this.getSettings(),
      history: this.getHistory()
    }
  }

  // Komplett-Import für Restore
  public importData(data: StorageData): boolean {
    try {
      let success = true
      
      if (data.workingHours) {
        success = success && this.saveWorkingHours(data.workingHours)
      }
      if (data.targetTimes) {
        success = success && this.saveTargetTimes(data.targetTimes)
      }
      if (data.settings) {
        success = success && this.saveSettings(data.settings)
      }
      if (data.history) {
        success = success && this.saveHistory(data.history)
      }
      
      return success
    } catch (error) {
      console.error('Fehler beim Importieren der Daten:', error)
      return false
    }
  }

  // Alles löschen
  public clearAll(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Fehler beim Löschen aller Daten:', error)
    }
  }

  // Storage-Info abrufen
  public getStorageInfo(): {
    used: number
    available: number
    percentage: number
  } {
    try {
      let used = 0
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          used += new Blob([localStorage.getItem(key) || '']).size
        }
      })
      
      // Grober Schätzwert für verfügbaren Speicher (5MB in den meisten Browsern)
      const estimated = 5 * 1024 * 1024
      
      return {
        used,
        available: estimated,
        percentage: (used / estimated) * 100
      }
    } catch {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

// Singleton Instance
export const storage = new LocalStorageManager()

// Utility-Funktionen
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}