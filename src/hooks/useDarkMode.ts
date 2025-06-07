'use client'

import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Dark Mode aus localStorage laden
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      const isDark = JSON.parse(savedMode)
      setDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    
    // Dark Mode in localStorage speichern
    localStorage.setItem('darkMode', JSON.stringify(newMode))
    
    // CSS Klasse hinzufügen/entfernen
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { darkMode, toggleDarkMode }
}
