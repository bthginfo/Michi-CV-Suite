# Michael Meier · CV Studio

Ein persönlicher Lebenslauf-Editor mit einer dunklen Navy-Oberfläche, fünf eigenständigen A4-Vorlagen und direkter Bearbeitung auf dem Dokument. Michaels Angaben aus dem bereitgestellten CV sind als editierbare Ausgangsbasis übernommen. Das Kurzprofil fasst die vorhandenen Tätigkeiten zusammen; zusätzliche Qualifikationen wurden nicht ergänzt.

## Funktionen

- Nordic, Editorial, Studio, Executive und Mono: unterschiedliche Layouts mit frei wählbarer Akzentfarbe, Schrift, Dichte und Fotoform.
- Live-Vorschau mit automatischen Seitenumbrüchen. Texte, Kontaktdaten, Abschnittssymbole, Einträge und Bilder lassen sich bearbeiten; Abschnitte und Einträge hinzufügen, ausblenden, verschieben und löschen.
- Foto-Upload mit lokaler Größenoptimierung; Bilder bleiben Teil des gespeicherten CV.
- Passwortgeschützter Editor. Das Passwort steht ausschließlich in einer serverseitigen Vercel-Umgebungsvariable. Sitzungen sind signierte HttpOnly-Cookies mit einer Laufzeit von sieben Tagen.
- Sofortige lokale Sicherung plus automatische Cloud-Speicherung nach einer kurzen Bearbeitungspause. Gleichzeitige Änderungen auf mehreren Geräten werden über ETags gegen unbeabsichtigtes Überschreiben geschützt.
- Privater Bearbeitungslink, um denselben Arbeitsplatz auf einem anderen Gerät wieder zu öffnen.
- Öffentliche, unveränderliche Leseansichten mit klickbaren E-Mail-, Telefon-, Karten- und Weblinks und direkter Kontaktaufnahme.
- PDF-Download aus denselben gerenderten Seiten einschließlich eingebetteter Schriften, auswählbarem Text und klickbaren Links.
- JSON-Backup und Wiederherstellung; Rückgängig/Wiederholen; mobile Oberfläche; überspringbare Tour beim ersten Login auf einem Gerät.

## Speicherung und Zugriff

Die Anwendung verwendet einen **privaten Vercel-Blob-Store in Frankfurt**. Eine zusätzliche Datenbank und ein separates Datenbank-Abo sind nicht erforderlich. Vercel Blob wird auf dem Pro-Tarif nach Nutzung abgerechnet. Automatische Speicherung, Freigaben und PDF-Erstellung nutzen die Infrastruktur des verbundenen Vercel-Kontos.

Ein neuer Browser startet mit Michaels Ausgangs-CV und einem eigenen, zufällig erzeugten Arbeitsplatzschlüssel. **Den privaten Bearbeitungslink sichern**, um nach einem Gerätewechsel oder nach dem Löschen von Browserdaten wieder denselben Cloud-Stand zu öffnen. Das Editor-Passwort allein wählt keinen bestehenden Arbeitsplatz aus. Wer sowohl Passwort als auch privaten Link besitzt, kann diesen Arbeitsplatz bearbeiten.

Öffentliche Leselinks enthalten einen zufälligen Freigabe-Identifier und benötigen kein Passwort. Sie zeigen einen festen Stand, der sich durch spätere Bearbeitungen nicht verändert. Ein Bearbeitungslink enthält seinen geheimen Schlüssel ausschließlich im URL-Fragment; nach dem Öffnen übernimmt der Browser ihn und entfernt ihn aus der Adresszeile. Bearbeitungsschlüssel werden getrennt von öffentlichen Freigaben behandelt.

Fotos werden im Browser als WebP auf maximal 960 Pixel Kantenlänge optimiert und gemeinsam mit dem CV gespeichert. Unterstützt werden JPG, PNG und WebP bis 15 MB vor Optimierung. Ein gesamter gespeicherter CV darf höchstens 2,5 MB groß sein. SVG und externe Bild-URLs werden beim Import abgewiesen. Backups enthalten auch die Bilder und sollten privat aufbewahrt werden.

## Lokal starten

Voraussetzung: Node.js 24. Die Abhängigkeiten sind im Lockfile fixiert.

```sh
npm ci
vercel link
vercel env pull .env.local
npm run dev
```

Den richtigen Vercel-Workspace und das Projekt `michi-cv-suite` auswählen. Die Datei `.env.local` wird nicht eingecheckt. Sie benötigt die serverseitigen Werte `BLOB_READ_WRITE_TOKEN` und `EDITOR_PASSWORD`. Niemals mit `VITE_` präfixieren oder in den Browser-Build übernehmen. Der lokale Vite-Server bedient auch die API-Routen; für PDF-Tests muss lokal Google Chrome installiert sein. Alternativ lässt sich dessen Pfad über `CHROME_EXECUTABLE_PATH` angeben. In Produktion wird das paketierte Serverless-Chromium verwendet.

## Prüfen und veröffentlichen

```sh
npm test
npm run build
```

`tests/` prüft Datenvalidierung, gefährliche Importwerte, Bearbeitungsschlüssel und signierte Sitzungen. `scripts/smoke-api.ts` prüft gegen den realen privaten Store Anmeldung, Daten und Bilder, falsche Schlüssel, Schreibkonflikte und unveränderliche öffentliche Freigaben. Der Test erstellt ausschließlich zufällige eigene Testobjekte und entfernt diese danach.

```sh
node --env-file=.env.local --import tsx scripts/smoke-api.ts
```

Für einen anderen Testserver `TEST_ORIGIN` setzen. Standard ist `http://127.0.0.1:5174`.

Das Vercel-Projekt ist mit diesem Repository verbunden. Die produktive Veröffentlichung erfolgt aus `main`. `vercel.json` konfiguriert Build, API-Funktionen, Sicherheitsheader und das Chromium-Binärpaket für die PDF-Funktion. Öffentliche Leseansichten sind auf der produktiven Domain erreichbar; Vercel-Vorschauen können separat durch Vercel geschützt bleiben.

## Technische Struktur

React, TypeScript und Vite; selbst gehostete Schriftdateien; Lucide-Symbole. `src/model.ts` definiert das validierte Dokumentformat, `src/seed.ts` die CV-Ausgangsdaten. `src/CVCanvas.tsx` ist die gemeinsame Darstellung für Editor, Leseansicht und Export. `src/useWorkspace.ts` verwaltet lokale Sicherung, Cloud-Abgleich, Rückgängig und Freigaben. `api/auth.ts`, `api/workspace.ts` und `api/pdf.ts` stellen Anmeldung, privaten Speicher und PDF-Erzeugung bereit.

Die PDF-Funktion führt kein übermitteltes JavaScript aus und blockiert Netzwerk- und Dateizugriffe beim Rendern. Der normale PDF-Download behält Texte und Links bei; die Bibliothek enthält zusätzlich einen optionalen Raster-Export für eine mögliche spätere Offline-Funktion.
