# Vision

## Vision in einem Satz

> Enterprise Architecture als versionierte, modulare und werkzeugoffene Open-Source-Disziplin – konzeptionell so rigoros wie nötig, pragmatisch so niederschwellig wie möglich.

## Mit Erklärung

OEA macht die Architektur einer Organisation zur gemeinsamen, versionierten Wahrheit – für Architekten als Pflegewerkzeug, für Fachbereiche als Inventar, für Compliance als Asset-Quelle, für automatisierte Pipelines als prüfbares Artefakt.

Drei bewusste Designprinzipien prägen OEA:

- **Offene, textbasierte Repräsentation statt proprietärer Formate**, weil Architektur-Wissen den Hersteller überleben muss.
- **Progressive Disclosure statt erzwungener Modellierungs-Tiefe**, weil unterschiedliche Rollen unterschiedliche Sichten brauchen.
- **Modulare, schnittstellen-orientierte Architektur statt Monolith**, weil das Tool nicht alles selbst können muss, sondern in eine bestehende Tool-Landschaft passen soll.

## Zielgruppe (primär)

Sieben Persona-Profile beschreiben die primären Adressaten:
- Junior bis Lead Architekten in KMU, Mittelstand und Konzern (SH-01, SH-03, SH-04)
- Spezialisierte Architekten für Data und Business (SH-02, SH-07)
- Operations-Verantwortliche in regulierten Umgebungen (SH-06)
- Strategische Sponsoren auf C-Level (SH-05)

Siehe [stakeholders/](stakeholders/) für detaillierte Profile.

## Erfolgskriterien

OEA ist erfolgreich, wenn:
- Stakeholder unterschiedlicher Erfahrungsstufen produktiv damit arbeiten können
- Migrationen aus bestehenden EA-Tools (Sparx, Avolution, LeanIX, Wiki) realistisch durchführbar sind
- Compliance-Anforderungen regulierter Branchen ohne nachträgliches Tooling erfüllt werden
- Es als ernsthafte OSS-Alternative im EA-Bereich wahrgenommen wird

## Nicht-Ziele

- Kein Ersatz für klassische Requirements-Tools (Doors, Jama)
- Kein Code-Generator
- Kein Multi-Tenant-SaaS-Angebot in der ersten Version
- Keine Visualisierungs-Plattform für nicht-architektonische Daten
- Keine vollständige BPM-Suite (BPMN-Modellierung als optionales Adapter-Modul)

## Designprinzipien (Vertiefung)

### Offene, textbasierte Repräsentation
Architektur-Inhalte liegen als versionierte Text-Artefakte vor: Markdown, YAML, JSON Schema. Versionskontrolle ist nativ, Diff-Tauglichkeit selbstverständlich, kein proprietäres Binärformat blockiert Migration.

### Progressive Disclosure
Die Logical-Schicht ist optional, nicht obligatorisch. Inventar-Sicht ist der niederschwellige Einstieg, Schichten-Sicht und Bebauungsplan sind nur dort sichtbar, wo sie gebraucht werden. Komplexität auf Knopfdruck zugänglich, nicht aufgezwungen.

### Modulare, schnittstellen-orientierte Architektur
API-first (OpenAPI 3.1 für REST, AsyncAPI für Events). Module sind austauschbar: BPMN-Integration, GRC-Adapter, ITSM-Brücke. Das Tool ist nicht allumfassend, sondern integrationsfähig.
