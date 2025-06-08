# Offline-Funktionalität Testsuite - Arbeitszeit App

## 🎯 Testziele
Diese Testfälle müssen **vollständig erfüllt** werden, bevor die Offline-Features als implementiert gelten.

---

## 1. Service Worker Tests

### 1.1 Service Worker Registrierung
- [ ] **SW-001**: Service Worker registriert sich erfolgreich beim ersten Seitenaufruf
- [ ] **SW-002**: Service Worker Status ist "activated" nach erfolgreicher Registrierung
- [ ] **SW-003**: Service Worker überlebt Seitenaktualisierung (F5)
- [ ] **SW-004**: Service Worker wird korrekt deregistriert bei Deaktivierung
- [ ] **SW-005**: Console zeigt keine Service Worker Fehler in Production Build

### 1.2 Service Worker Updates
- [ ] **SW-006**: Neue Service Worker Version wird erkannt und aktiviert
- [ ] **SW-007**: Update-Prompt erscheint bei verfügbarem Service Worker Update
- [ ] **SW-008**: App aktualisiert sich nach Service Worker Update ohne Datenverlust
- [ ] **SW-009**: Alte Caches werden bei Service Worker Update gelöscht

### 1.3 Service Worker Scope
- [ ] **SW-010**: Service Worker kontrolliert alle Seiten unter "/" Pfad
- [ ] **SW-011**: Service Worker intercepted alle Netzwerk-Requests korrekt
- [ ] **SW-012**: Service Worker funktioniert in allen unterstützten Browsern

---

## 2. PWA Manifest Tests

### 2.1 Manifest Validierung
- [ ] **PWA-001**: Web App Manifest ist über `/manifest.json` erreichbar
- [ ] **PWA-002**: Manifest enthält alle erforderlichen Felder (name, short_name, start_url, display, icons)
- [ ] **PWA-003**: Manifest ist syntaktisch valides JSON
- [ ] **PWA-004**: Lighthouse PWA Score ist mindestens 90/100

### 2.2 App Installation
- [ ] **PWA-005**: "App installieren" Prompt erscheint in unterstützten Browsern
- [ ] **PWA-006**: App kann erfolgreich installiert werden (Chrome, Edge, Safari)
- [ ] **PWA-007**: Installierte App startet im Standalone-Modus
- [ ] **PWA-008**: App-Icon erscheint korrekt im Homescreen/Desktop
- [ ] **PWA-009**: App-Name wird korrekt in der Taskleiste angezeigt

### 2.3 Manifest Icons
- [ ] **PWA-010**: Icons werden in allen angegebenen Größen korrekt angezeigt
- [ ] **PWA-011**: Maskable Icons funktionieren auf Android
- [ ] **PWA-012**: Favicon wird korrekt im Browser-Tab angezeigt
---

## 3. Caching-Strategien Tests

### 3.1 App Shell Caching
- [ ] **CACHE-001**: Alle CSS-Dateien werden beim ersten Besuch gecacht
- [ ] **CACHE-002**: Alle JavaScript-Bundles werden gecacht
- [ ] **CACHE-003**: HTML-Seiten werden mit Network-First Strategie gecacht
- [ ] **CACHE-004**: Statische Assets (Icons, Bilder) werden gecacht
- [ ] **CACHE-005**: Next.js `_next/static/*` Dateien werden korrekt gecacht

### 3.2 Cache-Performance
- [ ] **CACHE-006**: Gecachte Ressourcen laden in unter 100ms
- [ ] **CACHE-007**: Cache-Größe überschreitet nicht 50MB
- [ ] **CACHE-008**: Veraltete Caches werden automatisch nach 7 Tagen gelöscht
- [ ] **CACHE-009**: Cache-Update erfolgt im Hintergrund ohne UI-Blockierung

### 3.3 Cache-Strategien Verifikation
- [ ] **CACHE-010**: Network-First für HTML bestätigt (DevTools Network Tab)
- [ ] **CACHE-011**: Cache-First für statische Assets bestätigt
- [ ] **CACHE-012**: Stale-While-Revalidate für Google Fonts bestätigt

---

## 4. Offline-Funktionalität Tests

### 4.1 Vollständige Offline-Nutzung
- [ ] **OFFLINE-001**: App lädt vollständig bei deaktiviertem Internet
- [ ] **OFFLINE-002**: Alle UI-Komponenten funktionieren offline
- [ ] **OFFLINE-003**: Arbeitszeitberechnungen funktionieren offline
- [ ] **OFFLINE-004**: Dark Mode Toggle funktioniert offline
- [ ] **OFFLINE-005**: Alle Eingabefelder sind offline benutzbar

### 4.2 Offline-Datenpersistierung
- [ ] **OFFLINE-006**: Eingaben bleiben nach Browser-Neustart erhalten
- [ ] **OFFLINE-007**: Zielzeiten-Konfiguration wird offline gespeichert
- [ ] **OFFLINE-008**: Dark Mode Einstellung bleibt offline erhalten
- [ ] **OFFLINE-009**: Berechnungshistorie wird lokal gespeichert
- [ ] **OFFLINE-010**: Daten synchronisieren sich beim Zurückkehren online

### 4.3 Offline-Fallbacks
- [ ] **OFFLINE-011**: Offline-Seite wird angezeigt bei fehlender Cache
- [ ] **OFFLINE-012**: Fehlermeldungen sind benutzerfreundlich
- [ ] **OFFLINE-013**: App zeigt Offline-Status deutlich an

---

## 5. Online/Offline Status Tests

### 5.1 Status Detection
- [ ] **STATUS-001**: Online/Offline Status wird korrekt erkannt
- [ ] **STATUS-002**: Status-Änderungen werden sofort in UI reflektiert
- [ ] **STATUS-003**: Offline-Indikator ist deutlich sichtbar
- [ ] **STATUS-004**: Online-Indikator verschwindet bei stabiler Verbindung

### 5.2 Verbindungs-Wechsel
- [ ] **STATUS-005**: Smooth Transition von Online zu Offline
- [ ] **STATUS-006**: Automatische Synchronisation bei Online-Rückkehr
- [ ] **STATUS-007**: Keine Datenverluste bei Verbindungsabbruch
- [ ] **STATUS-008**: UI bleibt responsiv während Status-Wechsel

---

## 6. Datenpersistierung Tests

### 6.1 LocalStorage Integration
- [ ] **DATA-001**: Arbeitszeiten werden in localStorage gespeichert
- [ ] **DATA-002**: LocalStorage Daten überleben Browser-Neustart
- [ ] **DATA-003**: Ungültige localStorage Daten werden korrekt behandelt
- [ ] **DATA-004**: LocalStorage Quota wird nicht überschritten

### 6.2 IndexedDB Integration (falls implementiert)
- [ ] **DATA-005**: IndexedDB wird erfolgreich initialisiert
- [ ] **DATA-006**: Komplexe Datenstrukturen werden korrekt gespeichert
- [ ] **DATA-007**: IndexedDB Transaktionen sind fehlertolerant
- [ ] **DATA-008**: Datenbank-Schema Updates funktionieren

### 6.3 Daten-Synchronisation
- [ ] **DATA-009**: Lokale Änderungen werden bei Online-Rückkehr synchronisiert
- [ ] **DATA-010**: Konflikte zwischen lokalen und Remote-Daten werden behandelt
- [ ] **DATA-011**: Backup/Restore Funktionalität arbeitet korrekt
---

## 7. UI/UX Tests für Offline-Features

### 7.1 Offline-Indikatoren
- [ ] **UI-001**: Offline-Badge ist deutlich sichtbar und nicht störend
- [ ] **UI-002**: Sync-Status wird visuell kommuniziert
- [ ] **UI-003**: Loading-States während Cache-Operationen
- [ ] **UI-004**: Toast-Benachrichtigungen für Status-Änderungen

### 7.2 Offline-spezifische UI
- [ ] **UI-005**: Deaktivierte Features sind klar markiert
- [ ] **UI-006**: Offline-Fallback Seite ist benutzerfreundlich
- [ ] **UI-007**: Fehlermeldungen bieten konkrete Lösungsvorschläge
- [ ] **UI-008**: UI bleibt konsistent zwischen Online/Offline Modi

### 7.3 Accessibility
- [ ] **UI-009**: Screen Reader kann Offline-Status vorlesen
- [ ] **UI-010**: Keyboard-Navigation funktioniert offline
- [ ] **UI-011**: Farbkontrast erfüllt WCAG-Standards auch offline
- [ ] **UI-012**: Focus-Management funktioniert in allen Modi

---

## 8. Performance Tests

### 8.1 Loading-Performance
- [ ] **PERF-001**: Erste Seite lädt in unter 2 Sekunden (3G)
- [ ] **PERF-002**: Offline-Seite lädt in unter 500ms
- [ ] **PERF-003**: Cache-Hit lädt in unter 100ms
- [ ] **PERF-004**: Service Worker Installation blockiert nicht UI

### 8.2 Runtime-Performance
- [ ] **PERF-005**: UI bleibt responsiv während Cache-Operationen
- [ ] **PERF-006**: Memory Usage steigt nicht kontinuierlich
- [ ] **PERF-007**: CPU-Usage ist akzeptabel bei Background-Sync
- [ ] **PERF-008**: App startet offline schneller als online

### 8.3 Bundle-Size
- [ ] **PERF-009**: Service Worker Code ist unter 50KB
- [ ] **PERF-010**: Offline-Features erhöhen Bundle um max. 100KB
- [ ] **PERF-011**: Tree-shaking eliminiert ungenutzten Code
- [ ] **PERF-012**: Lighthouse Performance Score bleibt über 90

---

## 9. Browser-Kompatibilität Tests

### 9.1 Desktop Browser
- [ ] **BROWSER-001**: Chrome 100+ vollständig funktionsfähig
- [ ] **BROWSER-002**: Firefox 100+ vollständig funktionsfähig
- [ ] **BROWSER-003**: Edge 100+ vollständig funktionsfähig
- [ ] **BROWSER-004**: Safari 15+ grundlegend funktionsfähig

### 9.2 Mobile Browser
- [ ] **BROWSER-005**: Chrome Mobile vollständig funktionsfähig
- [ ] **BROWSER-006**: Safari iOS grundlegend funktionsfähig
- [ ] **BROWSER-007**: Samsung Internet funktionsfähig
- [ ] **BROWSER-008**: Firefox Mobile funktionsfähig

### 9.3 Fallback-Verhalten
- [ ] **BROWSER-009**: Graceful degradation in nicht-unterstützten Browsern
- [ ] **BROWSER-010**: Feature Detection verhindert JavaScript-Fehler
- [ ] **BROWSER-011**: Polyfills funktionieren korrekt

---

## 10. Sicherheit & Privacy Tests

### 10.1 Service Worker Sicherheit
- [ ] **SEC-001**: Service Worker läuft nur über HTTPS (außer localhost)
- [ ] **SEC-002**: Cross-Origin Requests werden korrekt behandelt
- [ ] **SEC-003**: Sensitive Daten werden nicht im Cache gespeichert
- [ ] **SEC-004**: Cache-Keys enthalten keine sensitive Informationen

### 10.2 Daten-Privacy
- [ ] **SEC-005**: Lokale Daten sind nicht zwischen Domains teilbar
- [ ] **SEC-006**: Private/Incognito Mode wird respektiert
- [ ] **SEC-007**: Daten-Löschung entfernt alle lokalen Spuren
- [ ] **SEC-008**: Keine unbeabsichtigte Daten-Übertragung
---

## 11. Development & Production Tests

### 11.1 Development Environment
- [ ] **DEV-001**: Service Worker funktioniert in dev mode
- [ ] **DEV-002**: Hot Reload funktioniert mit Service Worker
- [ ] **DEV-003**: Development Tools zeigen Cache-Status korrekt
- [ ] **DEV-004**: Console Warnings sind hilfreich

### 11.2 Production Build
- [ ] **PROD-001**: Production Build generiert korrekte Service Worker
- [ ] **PROD-002**: Minification bricht Service Worker nicht
- [ ] **PROD-003**: Asset Hashing funktioniert mit Caching
- [ ] **PROD-004**: Source Maps sind verfügbar für Debugging

---

## 12. Edge Cases & Error Handling

### 12.1 Speicher-Limits
- [ ] **EDGE-001**: App funktioniert bei vollem localStorage
- [ ] **EDGE-002**: Graceful handling bei Cache Quota exceeded
- [ ] **EDGE-003**: Alte Daten werden automatisch gelöscht
- [ ] **EDGE-004**: User wird über Speicher-Probleme informiert

### 12.2 Netzwerk-Edge Cases
- [ ] **EDGE-005**: Langsame Verbindung (2G) wird korrekt behandelt
- [ ] **EDGE-006**: Intermittierende Verbindung funktioniert
- [ ] **EDGE-007**: Timeout-Handling für Netzwerk-Requests
- [ ] **EDGE-008**: Retry-Logic für fehlgeschlagene Requests

### 12.3 Error Recovery
- [ ] **EDGE-009**: App erholt sich von Service Worker Fehlern
- [ ] **EDGE-010**: Corrupted Cache wird automatisch repariert
- [ ] **EDGE-011**: Reset-Option für komplette Cache-Löschung
- [ ] **EDGE-012**: Error Reporting funktioniert offline

---

## 📋 Test-Execution Checkliste

### Vor jeder Release:
- [ ] Alle Tests in mindestens 2 verschiedenen Browsern
- [ ] Mobile und Desktop Geräte getestet
- [ ] Offline-Szenario komplett durchgespielt
- [ ] Performance-Regression Check
- [ ] Accessibility Test mit Screen Reader

### Automatisierte Tests:
- [ ] Unit Tests für Service Worker Logic
- [ ] Integration Tests für Cache-Strategien
- [ ] E2E Tests für kritische User Journeys
- [ ] Performance Tests mit Lighthouse CI

### Manuelle Tests:
- [ ] Offline-Installation auf echtem Gerät
- [ ] Langzeit-Test über mehrere Tage
- [ ] User Feedback Session
- [ ] Cross-Device Synchronisation Test

---

## ✅ Erfolgs-Kriterien

Die Offline-Funktionalität gilt als **erfolgreich implementiert**, wenn:

1. **Mindestens 95%** aller Testfälle bestanden sind
2. **Lighthouse PWA Score** von mindestens 90/100
3. **App funktioniert vollständig offline** für mindestens 7 Tage
4. **Performance-Regression** unter 5% gegenüber Online-Version
5. **User kann die App produktiv offline nutzen** ohne Einschränkungen

---

*Letzte Aktualisierung: Juni 2025*
*Test-Coverage: 108 individuelle Testfälle*