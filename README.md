# 📈 Trend-Radar

Ein statisches Web-Dashboard, das globale und Schweizer Trends sammelt und
auf **schnell, günstig und ohne grossen Aufwand umsetzbare Geschäftsideen**
herunterbricht. Kein Server, keine Anmeldung — einmal per Link öffnen (auch
auf dem Handy) und filtern/sortieren.

## Für wen ist das

Für jeden, der alle zwei Wochen einen kurzen, kuratierten Überblick über
neue Trends und daraus ableitbare Nebenverdienst-/Business-Ideen will —
bewusst gefiltert auf Ideen mit **niedrigem bis mittlerem Aufwand, geringen
Kosten und kurzer Umsetzungszeit**. Aufwendige oder teure Ideen werden
nicht aufgenommen.

## Spalten pro Trend

| Feld (JSON-Key) | Bedeutung |
|---|---|
| `trend` | Name des übergeordneten Trends/der Nische (kurz) |
| `luecke` | **Das konkret fehlende Produkt/Angebot** — ein Satz, keine Kategorie wie "Accessoires" |
| `warum` | Ein Satz: warum ist die Lücke gerade jetzt real (mit Beleg) |
| `kunde` | Wer genau kauft das |
| `plan` | Array von 3–5 konkreten Schritten: **wo/wie man Kund:innen tatsächlich findet**, nicht nur "anbieten" |
| `vorlagen` | Array von `{titel, text}` — **fertige, copy-paste-bereite Texte** (DM, Anrufskript, Post-Hook, Flyer-Text) für die Schritte in `plan`, die Kommunikation brauchen |
| `aufwand` | niedrig / mittel (nie hoch) |
| `zeitDauerRessourcen` | Was es zum Start braucht, inkl. realistischer Preis-/Kostenangaben wo möglich |
| `rating` | 1–5 Sterne: Verhältnis Aufwand ↔ Geldverdienst-Potenzial |
| `quelle` | Link zum Beleg |

### Qualitätsregeln (aus Nutzer-Feedback, nicht verhandelbar)

- **Kein generisches Geschäftsmodell als "Trend"**: "Print-on-Demand", "digitale Vorlagen verkaufen", "Micro-Side-Hustles" sind KEINE gültigen Einträge — das sind Business-Modelle, keine erkannten Bedürfnisse. Gesucht ist immer: welches *konkrete* Produkt/welche *konkrete* Dienstleistung fehlt für eine *konkrete* Zielgruppe.
- **`luecke` muss spezifisch sein**: nicht "Accessoires fehlen", sondern z. B. "Grip-Socks mit Studio-Logo, aber Hersteller X verlangt Mindestbestellung ab 200 Stück". Wenn die Recherche keine derart spezifische, belegte Lücke findet, den Kandidaten verwerfen statt vage zu bleiben.
- **`plan` muss sagen, WO man Kund:innen konkret findet**, nicht nur "anbieten" oder "bewerben". Gute Beispiele: eine durchsuchbare Plattform + Suchbegriff nennen (z. B. "Google Maps 'Reformer Pilates' + Stadtname"), ein konkretes Signal für Bedarf nennen (z. B. Google-Bewertungen nach bestimmten Beschwerde-Stichworten durchsuchen), einen Kanal + Ansprache-Satz nennen.
- **Jeder Kommunikations-Schritt braucht eine `vorlagen`-Eintrag**: Sobald `plan` "anschreiben", "anrufen", "posten" oder "vorstellen" enthält, MUSS der tatsächliche Text mitgeliefert werden (DM-Text, Anrufskript, Post-Hook, Flyer-Text) — nicht nur die Anweisung, einen Text zu schreiben. Ton: natürlich, wie eine echte Person schreiben würde, nicht corporate/steif, keine Floskeln, keine Emoji-Inflation.
- **Reale Nutzer-Erfahrung schlägt Markt-Statistik**: Wenn aus dem Chat/Feedback bekannt ist, dass eine bestimmte Idee für die Nutzerin persönlich nicht funktioniert hat (z. B. Secondhand-Reselling auf Ricardo — aus <10 von 100 Artikeln in 2 Jahren verkauft), diese Idee **nicht wieder aufnehmen**, auch wenn Marktdaten einen "Boom" zeigen. Aggregierte Statistiken schlagen keine dokumentierte persönliche Erfahrung.
- Lieber 3–4 wirklich konkrete, belegte Einträge pro Runde als 8 vage.

## Daten & Update-Zyklus

Alle Einträge liegen in [`data.json`](./data.json) unter `entries[]`, plus
ein `meta`-Block mit letztem/nächstem Recherche-Datum und Runden-Zähler.
Alle 2 Wochen kommt automatisiert eine neue Recherche-Runde hinzu (siehe
unten) — bestehende Einträge werden **nicht** gelöscht, das Dashboard
wächst als Archiv. Die Reihenfolge in der Datei ist egal, da das UI
standardmässig nach `dateAdded` sortiert (**neueste Trends immer oben**).

### Wie eine automatisierte Update-Runde ablaufen soll

Eine **wiederkehrende** Claude-Routine feuert jede Woche (fester Cron-Termin,
nachts) — Cron kann kein "alle 14 Tage" ausdrücken, deshalb prüft jeder Lauf
selbst, ob seit der letzten echten Runde genug Zeit vergangen ist:

1. `data.json` (im Repo-Root) lesen — sowohl `meta` als auch die
   **vollständige Liste bestehender `entries`** (insbesondere `trend` und
   `luecke`), und diese README komplett (v. a. "Qualitätsregeln" oben).
2. **Freshness-Check**: Sind seit `meta.lastRun` weniger als 13 Tage
   vergangen? Dann sofort stoppen — nichts committen, keine Benachrichtigung.
   Das ist kein Zensur-Kriterium, sondern nur ein Sicherheitsnetz: Der
   Wochen-Cron-Termin selbst ist die verlässliche, dauerhafte Terminierung;
   dieser Check verhindert bloss, dass zwischen zwei Wochen-Feuerungen eine
   zusätzliche, zu frühe Runde entsteht. Fällt ein Lauf mal aus, holt der
   nächste wöchentliche Termin es automatisch nach — die Kette kann nicht
   abreissen, weil nichts sich selbst neu terminieren muss.
3. Sind ≥13 Tage vergangen: konkrete Lücken recherchieren (Websuche, gezielt
   nach Beschwerden/Rezensionen/Foren-Posts suchen à la "kann X nirgends
   finden", "Y fehlt in der Schweiz"), keine allgemeinen Markttrend-Berichte
   abschreiben. Mischung aus global und lokal (CH) beibehalten. Die Situation
   kann sich seit der letzten Runde verändert haben, es wird also frisch
   recherchiert, nicht aus dem Gedächtnis wiederholt.
4. **Keine Wiederholungen**: Vor dem Hinzufügen jeden neuen Kandidaten gegen
   alle vorhandenen `entries` abgleichen (Thema/Kernidee, nicht nur exakter
   Titel-Wortlaut). Ist ein Trend im Kern schon vorhanden:
   - Wenn es nur ein spürbares Update ist (neue Zahl, neuer Beleg), das
     bestehende Feld `luecke`/`plan`/`rating` in-place aktualisieren statt
     einen neuen Eintrag anzulegen.
   - Sonst überspringen und eine wirklich neue Lücke suchen.
5. 3–6 wirklich neue, konkrete Einträge nach dem Schema ergänzen (siehe
   Qualitätsregeln oben — Qualität vor Quantität), mit fortlaufender
   `cycle`-Nummer, eindeutiger `id` (z. B. `c<cycle>-<lfd. Nr.>`) und
   realer Quelle je Eintrag. Nur `aufwand: "niedrig"` oder `"mittel"`
   aufnehmen (nie "hoch" — grössere Vorhaben wie eine eigene App gehören
   nicht in diesen automatisierten Zyklus, dafür braucht es ein eigenes,
   manuell geführtes Gespräch).
6. `meta.lastRun`, `meta.nextRunApprox` und `meta.cycle` aktualisieren.
7. Änderungen direkt auf `main` committen und pushen (keine PR nötig für
   Routine-Updates).
8. Kurze Push-Benachrichtigung an die Nutzerin senden (Link zur Seite).

## Hosting (GitHub Pages)

Eigenständiges Repo, Dateien liegen direkt im Root (`index.html`, `app.js`,
`style.css`, `data.json`). Live unter:

```
https://chistyakovaanastasia-afk.github.io/trend-radar/
```

## Lokal testen

```bash
python3 -m http.server 8080
# dann im Browser: http://localhost:8080/
```
