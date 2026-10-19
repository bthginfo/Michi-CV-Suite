# Michael Meier · CV Studio

Ein persönlicher Lebenslauf-Editor mit einer dunklen Navy-Oberfläche, zehn strukturell unterschiedlichen A4-Vorlagen und direkter Bearbeitung im Dokument.

**Passwort eingeben → Michaels aktueller CV öffnet sich. Auf jedem Gerät derselbe Stand.** Texte, Bilder, Gestaltung und Abschnitte werden zentral in einer eigenen Neon-Postgres-Datenbank im kostenlosen Tarif gespeichert. Es gibt keine privaten Bearbeitungslinks oder gerätegebundenen Arbeitsplätze.

## Funktionen

- **Zehn unterschiedliche Dokumentwelten:** Orbit (runde SaaS-Boards), Grid (quadratische Dashboard-Matrix), Folio (Magazin), Vector (kantige Zeitleiste), Signal (Poster), Haven (weiche organische Flächen), Copper (durchgehend dunkles Espressopapier), Noir (horizontales Ledger), Lumen (asymmetrisches Portfolio) und Summit (architektonische Teilung). Akzentfarbe, Leseschrift, Dichte und Fotoform bleiben anpassbar. Die Galerie zeigt eine charakteristische Miniatur pro Vorlage. Im vollständigen CV-Canvas lassen sich alle Seiten durch Scrollen ansehen.
- Inhaltsabhängige A4-Seitenumbrüche messen echte Karten, Tabellenzellen, Zeilen und asymmetrische Gruppen. Abschnitte lassen sich automatisch, im Hauptbereich oder im Zusatzbereich platzieren; der Zusatzbereich ist je nach Vorlage eine Spalte, ein Panel oder ein Inhaltsband. Qualifikationsseiten haben eine eigene Komposition. Der Ausgangs-CV umfasst zwei Seiten pro Vorlage; längere eigene Inhalte können weitere Seiten erzeugen.
- Direktes Bearbeiten und Leeren von Texten, Kontaktdaten und Bildern; Abschnitte und Einträge ergänzen, verschieben, ausblenden oder löschen.
- **Icons direkt im Canvas ändern:** Im Modus „Bearbeiten“ ein Kontakt-, Link- oder Abschnittssymbol anklicken, den kategorisierten Lucide-Katalog durchsuchen und ein Symbol auswählen. „Kein Symbol“ entfernt es. Eine Hilfe im Bearbeitungsmodus und der Inhaltsbereich ermöglichen das Wiedereinsetzen. Diese Entscheidungen werden gespeichert und gelten auch für Leselinks und PDFs.
- **CV vervollständigen:** geführter Inhaltsassistent für Stärken, Projekte und Erfolge, Sprachen, Interessen, Ehrenamt, Zertifikate und Referenzen. Kurze Fragen, Beispiele, Vorschau und bewusste Übernahme; leere Bereiche werden weggelassen. Bereits vorhandene Angaben werden übernommen statt dupliziert.
- Michaels Angaben aus den bereitgestellten CV-Abbildungen sind als editierbare Ausgangsbasis enthalten. Das Kurzprofil fasst die vorhandenen Tätigkeiten zusammen. Zusätzliche Stärken, Leistungen oder Qualifikationen werden nicht erfunden.
- Ein-Klick-Foto-Upload mit Optimierung für JPG, PNG und WebP. Ohne Foto zeigen die Vorlagen Michaels echte Initialen mit einer klaren Upload-Hilfe im Editor. Es wird kein künstliches Porträt erfunden.
- Sofortige lokale Entwurfssicherung plus automatische Speicherung in Postgres nach einer kurzen Bearbeitungspause. Gleichzeitige Änderungen werden gegen unbeabsichtigtes Überschreiben geschützt. Bei erneutem Öffnen und beim Zurückkehren auf ein inaktives Fenster wird ein neuerer zentraler Stand geladen, solange keine eigenen Änderungen offen sind.
- Passwortschutz mit signierten HttpOnly-/SameSite-Cookies für sieben Tage. Das Passwort und die Datenbankzugänge bleiben auf dem Server.
- Öffentliche, unveränderliche Leselinks mit klickbaren E-Mail-, Telefon-, Karten- und Weblinks und direkter Kontaktaufnahme. Nur diese öffentlichen Links werden geteilt.
- PDF-Download aus denselben gerenderten A4-Seiten mit eingebetteten Schriften, auswählbarem Text und klickbaren Links.
- Rückgängig/Wiederholen, JSON-Backup und Wiederherstellung, mobile Vergrößerung und eine überspringbare, erneut startbare Tour beim ersten Login pro Gerät.

## Speicherung

Die dedizierte Datenbank `michi-cv-db` befindet sich in Frankfurt und wurde im **Neon-Free-Tarif** über das verbundene Vercel-Konto eingerichtet. Es wurde kein kostenpflichtiger Datenbanktarif aktiviert. Vercel-Hosting und PDF-Funktionen nutzen den bestehenden Pro-Tarif.

`cv_documents` enthält Michaels zentralen CV inklusive Bildern als validiertes JSONB-Dokument. `cv_shares` enthält feste öffentliche Momentaufnahmen. ETags werden bei Änderungen atomar geprüft; ein älterer Gerätestand überschreibt keinen neueren. In Produktion ist der Dokument-Identifier fest `michael`. Eine Gerätekennung ist nicht erforderlich.

Der Browser bewahrt zusätzlich einen lokalen Entwurf auf, falls die Verbindung ausfällt. Die Datenbank ist die gemeinsame Quelle. Bereits auf dem Gerät vorhandene Entwürfe der ersten App-Version werden einmalig automatisch übernommen, solange der neue zentrale CV noch unverändert ist. Bereits bearbeitete zentrale Daten werden dabei niemals ersetzt.

Neue CV-Daten, Bilder und Leselinks werden in Postgres gespeichert. Der zuvor verbundene private Blob-Store bleibt ausschließlich für die Kompatibilität mit bereits erzeugten alten Leselinks verfügbar. Fotos werden im Browser auf maximal 960 Pixel Kantenlänge optimiert. Unterstützte Originaldateien: JPG/PNG/WebP bis 15 MB; gesamter CV maximal 2,5 MB. SVG und externe Bild-URLs sind beim Import ausgeschlossen.

## Lokale Entwicklung

Voraussetzung: Node.js 24.

```sh
npm ci
```

Die serverseitigen Werte aus `.env.example` in einer ignorierten `.env.local` setzen. `DATABASE_URL` ist die gepoolte Neon-Verbindung, `DATABASE_URL_UNPOOLED` die direkte Verbindung für Migrationen. Die Werte stehen im geschützten Quickstart der Datenbank. Für lokale Tests einen eigenen `CV_DOCUMENT_ID` mit Präfix `qa-` verwenden; diesen Wert **nicht** in Produktion setzen. `SESSION_SECRET` ist ein zufälliges serverseitiges Signiergeheimnis. Niemals echte Zugänge einchecken oder mit `VITE_` präfixieren.

```sh
node --env-file=.env.local --import tsx scripts/migrate-db.ts
npm run dev -- --port 5174
```

Die Migration erstellt die Tabellen additiv und verändert keine bestehenden CV-Daten. Der lokale Vite-Server bedient auch die API-Routen. Für lokale PDF-Tests Google Chrome installieren oder `CHROME_EXECUTABLE_PATH` setzen. In Produktion wird das paketierte Serverless-Chromium verwendet.

## Prüfen und veröffentlichen

```sh
npm test
npm run build
node --env-file=.env.local --import tsx scripts/smoke-api.ts
```

Die Unit-Tests prüfen Dokumentvalidierung, Abwärtskompatibilität, Icon- und Spalteneinstellungen, den Erhalt angepasster Module, sichere Imports, Weblinks und signierte Sitzungen. Der API-Test prüft gegen die echte Datenbank zwei unabhängige Anmeldungen, gemeinsamen Stand, Bilder, Schreibkonflikte, sichere Altentwurfsübernahme und unveränderliche Leselinks. Schreibtests sind auf einen lokalen Server mit `qa-`-Dokument-Identifier beschränkt; danach wird der Ausgangsstand wiederhergestellt. Mit `TEST_ORIGIN=https://michi-cv-suite.vercel.app` prüft er die Produktion lesend und verändert Michaels CV nicht.

Vercel ist mit diesem Repository verbunden und veröffentlicht `main` automatisch. `vercel.json` konfiguriert Build, Sicherheitsheader, API-Funktionen und das Chromium-Paket. Öffentliche Leselinks sind auf der Produktionsdomain erreichbar; Vercel-Vorschauen können separat geschützt bleiben.

## Struktur

React, TypeScript und Vite; lokal gehostete Schriften und Lucide-Symbole. `src/model.ts` definiert das Dokumentformat, `src/seed.ts` Michaels Ausgangsdaten. `src/CVCanvas.tsx` rendert Editor, Leseansicht und Export; `src/layout.ts` definiert die kompatiblen Vorlagen-IDs, sichtbaren Namen und inhaltsabhängige Seiteneinteilung. `src/templates/` enthält die zehn Gestaltungen. [DESIGN.md](DESIGN.md) und `.impeccable/design.json` dokumentieren die umgesetzten visuellen Regeln und Tokens. `src/ContentAssistant.tsx` und `src/contentModules.ts` führen durch optionale Inhalte. `src/useWorkspace.ts` verwaltet Datenbank-Abgleich, lokalen Entwurf und Verlauf. `server/database.ts` enthält parametrisierte SQL-Abfragen, `server/schema.ts` die Migrationen. Die API-Routen stellen Anmeldung, CV-Daten, Leselinks und PDF-Erzeugung bereit.

Der PDF-Renderer führt kein übermitteltes JavaScript aus und blockiert Netzwerk- und Dateizugriffe. Alle benötigten Schriften und Bilder sind im Druckdokument eingebettet.
