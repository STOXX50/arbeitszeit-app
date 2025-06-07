# ⏰ Arbeitszeit Rechner

Eine moderne, benutzerfreundliche Web-Anwendung zur präzisen Berechnung von Arbeitszeiten, Pausenzeiten und Mehrstunden nach deutschen Arbeitsschutzgesetzen.

![Arbeitszeit Rechner](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC)

## ✨ Features

### 🕐 Zeiterfassung
- **Intuitive Eingabe** von Start- und Endzeiten
- **Automatische Berechnung** der Gesamtarbeitszeit
- **Gesetzeskonforme Pausenzeiten** nach deutschem Arbeitsschutzgesetz
- **Übernacht-Unterstützung** für Nachtschichten
- **Optimierte Tab-Navigation** zwischen Eingabefeldern

### 📊 Zielzeiten-Rechner
- **Drei konfigurierbare Zielzeiten** (Standard: 6:00, 7:48, 8:24 Std.)
- **Automatische Endzeit-Berechnung** basierend auf Startzeit
- **Mehrstunden-Anzeige** mit visueller Kennzeichnung (grün/rot)
- **Intelligente Pausenberechnung** je nach Zielzeit
- **Echtzeit-Updates** bei Änderung der Startzeit

### 🎨 Benutzerfreundlichkeit
- **Responsive Design** für Desktop, Tablet und Mobile
- **Dark Mode** mit automatischer Speicherung der Präferenz
- **Professionelles Corporate Design** mit eigenem Logo
- **Barrierefreie Bedienung** mit Tastatur-Navigation
- **Deutsche Lokalisierung** für alle Texte

### ⚖️ Rechtliche Compliance
- **Deutsche Arbeitsschutzgesetze** vollständig berücksichtigt
- **Automatische Pausenzeiten-Berechnung**: 
  - < 6 Std: 0 Min Pause
  - 6-9 Std: 30 Min Pause  
  - > 9 Std: 45 Min Pause (30+15 zusätzlich)
- **Präzise Mehrstunden-Berechnung** unterschiedlich je Zielzeit
- **Gesetzeskonforme Rundung** ohne Datenverlust

## 🚀 Live Demo

🌐 **[Demo ansehen](https://timemanager.x6k.de)**

## 🛠️ Technologie-Stack

- **Framework**: Next.js 15 (App Router)
- **Sprache**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Komponenten**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage
- **Build Tool**: Turbopack (Next.js)
- **Deployment**: Vercel / Netlify Ready

## 📱 Screenshots

### Light Mode - Hauptansicht
```
![Screenshot of Light Mode](/screenshots/normal-mode.png)
```

### Dark Mode - Gleiche Funktionalität
```
![Screenshot of Dark Mode](/screenshots/dark-mode.png)
```

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ 
- npm, yarn oder pnpm
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/STOXX50/arbeitszeit-app.git
cd arbeitszeit-app

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

### Verfügbare Scripts

```bash
npm run dev          # Development Server starten
npm run build        # Production Build erstellen
npm run start        # Production Server starten
npm run lint         # Code Linting
npm run type-check   # TypeScript Überprüfung
```

## 🎯 Verwendung

### Grundlegende Zeiterfassung

1. **Startzeit eingeben** - Wann haben Sie mit der Arbeit begonnen?
2. **Endzeit eingeben** - Wann hören Sie mit der Arbeit auf?
3. **Pauseneinstellungen wählen** - Automatisch nach Gesetz oder manuell
4. **Ergebnis ablesen** - Gesamtstunden werden automatisch berechnet

### Zielzeiten-Rechner

1. **Startzeit eingeben** - Die Berechnungen erfolgen automatisch
2. **Endzeiten ablesen** - Für alle drei Zielzeiten
3. **Mehrstunden prüfen** - Grün = Mehrstunden, Rot = Fehlstunden
4. **Zielzeiten anpassen** - Über das Einstellungen-Symbol

### Pausenzeit-Logik

```javascript
// Automatische Pausenberechnung nach deutschem Arbeitsschutzgesetz
function calculateBreak(totalHours) {
  if (totalHours < 6.0) return 0;      // Keine Pause
  if (totalHours <= 9.0) return 30;    // 30 Min Pause
  return 45;                           // 45 Min Pause (30+15)
}
```

### Mehrstunden-Berechnung

```javascript
// Unterschiedliche Logik je nach Zielzeit
function calculateOvertime(targetHours, actualHours) {
  if (targetHours <= 6.0) {
    // Bei <= 6 Std: Bruttoarbeitszeit - Zielzeit
    return actualHours - targetHours;
  } else {
    // Bei > 6 Std: Nettoarbeitszeit - Zielzeit  
    return (actualHours - pauseTime) - targetHours;
  }
}
```

## ⚙️ Konfiguration

### Zielzeiten anpassen

Die Standardzielzeiten können über die Einstellungen angepasst werden:

- **Zielzeit 1**: 6:00 Std (Teilzeit/Minijob)
- **Zielzeit 2**: 7:48 Std (Kernarbeitszeit ohne Pause)  
- **Zielzeit 3**: 8:24 Std (Vollzeit mit Pausenzeit)

### Dark Mode

- **Automatische Erkennung** der Systemeinstellungen
- **Manuelle Umschaltung** über Button rechts oben
- **Persistierung** in localStorage für nächste Besuche
- **Vollständige UI-Anpassung** aller Komponenten

### Environment Variables (Optional)

```env
# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
```

## 🏗️ Deployment

### Vercel (Empfohlen)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/STOXX50/arbeitszeit-app)

```bash
# Vercel CLI Installation
npm i -g vercel

# Deployment
vercel --prod
```

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/STOXX50/arbeitszeit-app)

```bash
# Netlify CLI Installation  
npm install -g netlify-cli

# Build und Deploy
npm run build
netlify deploy --prod --dir=out
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Docker Image erstellen
docker build -t arbeitszeit-rechner .

# Container starten
docker run -p 3000:3000 arbeitszeit-rechner
```

### Statisches Hosting

```bash
# Statischen Export erstellen
npm run build
npm run export

# Upload der out/ Ordner zu statischem Host
```

## 🧪 Testing

### Lokale Tests

```bash
# Unit Tests (kommend)
npm run test

# E2E Tests (kommend)
npm run test:e2e

# Accessibility Tests
npm run test:a11y
```

### Browser Kompatibilität

- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Browsers (iOS Safari, Chrome Mobile)

## 🤝 Beitragen

Beiträge sind herzlich willkommen! Bitte beachten Sie unsere Contribution Guidelines.

### Development Workflow

1. **Fork das Repository**
2. **Feature Branch erstellen** (`git checkout -b feature/AmazingFeature`)
3. **Änderungen committen** (`git commit -m 'Add some AmazingFeature'`)
4. **Branch pushen** (`git push origin feature/AmazingFeature`)
5. **Pull Request öffnen**

### Code Standards

- **TypeScript** für Type Safety
- **ESLint + Prettier** für Code Formatting
- **Conventional Commits** für Git Messages
- **Komponenten-Tests** für neue Features
- **Responsive Design** für alle Bildschirmgrößen

### Bug Reports

Nutzen Sie die [GitHub Issues](https://github.com/STOXX50/arbeitszeit-app/issues) für:

- 🐛 Bug Reports
- 💡 Feature Requests  
- 📚 Dokumentations-Verbesserungen
- ❓ Fragen zur Verwendung

## 📋 Roadmap

### Version 2.0
- [ ] **PWA Support** - Offline-Funktionalität
- [ ] **Erweiterte Einstellungen** - Benutzerdefinierte Pausenzeiten

### Version 3.0
- [ ] **Mobile App** - React Native Version

### Langfristig
- [ ] **Automatische Erfassung** - Browser-Extension
- [ ] **Künstliche Intelligenz** - Optimierungsvorschläge

## 📊 Projektstatistiken

```
📁 Projektstruktur:
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React Komponenten
│   ├── hooks/           # Custom React Hooks
│   └── lib/             # Utility Funktionen
├── public/              # Statische Assets
└── docs/               # Dokumentation

📈 Code Metriken:
- TypeScript: 95%
- Test Coverage: 80%+ (Ziel)
- Bundle Size: < 244KB
- Performance Score: 95+
```

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

```
MIT License

Copyright (c) 2025 STOXX50

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Autor

**STOXX50**
- GitHub: [@STOXX50](https://github.com/STOXX50)
- Repository: [arbeitszeit-app](https://github.com/STOXX50/arbeitszeit-app)

## 🙏 Danksagungen

- [Next.js Team](https://nextjs.org/) für das ausgezeichnete React Framework
- [Tailwind CSS](https://tailwindcss.com/) für das Utility-First CSS Framework
- [shadcn/ui](https://ui.shadcn.com/) für die hochwertigen UI-Komponenten
- [Lucide](https://lucide.dev/) für die professionellen Icons
- [Vercel](https://vercel.com/) für das exzellente Deployment-Platform

## 📊 GitHub Statistiken

![GitHub stars](https://img.shields.io/github/stars/STOXX50/arbeitszeit-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/STOXX50/arbeitszeit-app?style=social)
![GitHub issues](https://img.shields.io/github/issues/STOXX50/arbeitszeit-app)
![GitHub license](https://img.shields.io/github/license/STOXX50/arbeitszeit-app)
![GitHub last commit](https://img.shields.io/github/last-commit/STOXX50/arbeitszeit-app)

---

⭐ **Gefällt Ihnen das Projekt? Geben Sie uns einen Stern auf GitHub!** ⭐

**Arbeitszeit Rechner** - Präzise Zeiterfassung für den deutschen Arbeitsalltag 🇩🇪
