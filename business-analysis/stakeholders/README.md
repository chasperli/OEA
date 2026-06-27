# Stakeholder

Sieben Persona-Profile als primäre Anwender und Sponsoren von OEA. Jedes Profil folgt einem einheitlichen Schema.

## Übersicht

| ID | Name | Rolle | Organisation | Tool-Hintergrund |
|---|---|---|---|---|
| [SH-01](SH-01-franz-junior-domain-architekt.md) | Franz | Junior Domain Architekt | Konzern | Greenfield |
| [SH-02](SH-02-lukas-senior-data-architekt.md) | Lukas | Senior Data Architekt | Mittelstand | Avolution |
| [SH-03](SH-03-kurt-lead-enterprise-architekt.md) | Kurt | Lead Enterprise Architekt | KMU | Wiki |
| [SH-04](SH-04-michael-solution-architekt.md) | Michael | Solution Architekt | Mittelstand | Sparx |
| [SH-05](SH-05-cio-konzern.md) | CIO | CIO | Konzern | Multi-Tool (Ardoq, Avolution, LeanIX, Sparx) |
| [SH-06](SH-06-max-operator-kmu.md) | Max | Operator | reguliertes KMU | hybride Infra, gemischter Stack |
| [SH-07](SH-07-sabine-business-engineer.md) | Sabine | Senior Business Engineer | Globalkonzern | strukturierte Business-Modellierung |
| [SH-08](SH-08-anna-business-analyst.md) | Anna | Business Analyst / Prozessverantwortliche | Mittelstand | – |
| [SH-09](SH-09-rigobert-produkt-owner.md) | Rigobert | Produkt Owner / Repository-Inhaber | – | OEA (eigene Instanz) |

## Eigenschaften der Auswahl

Die sieben Personas decken drei orthogonale Spektren ab:

**Größenklassen**: KMU (Kurt, Max), Mittelstand (Lukas, Michael), Konzern (Franz, CIO, Sabine).

**Erfahrungsstufen**: Junior (Franz), Professional (Max), Senior (Lukas, Sabine), Lead (Kurt), Solution (Michael), C-Level (CIO).

**Tool-Hintergründe**: Greenfield, Wiki-basiert, Avolution, Sparx, Multi-Tool-Konzern, Business-Object-orientiert, Operations-fokussiert.

## Wiederkehrende Muster

Beim Schreiben sind drei Muster aufgefallen:

**Erstens, Migration ist der einzige Multi-Persona-blockierende Concern**: Lukas (Avolution), Michael (Sparx) und CIO (Multi-Tool) haben Migration als `blocking` markiert. Das macht **Migration-Tauglichkeit zum impliziten Walking-Skeleton-Kriterium**.

**Zweitens, Max hat die meisten `blocking`-Concerns** (acht): das ist nicht Schreibfehler, sondern Realität regulierter KMUs. Operationale Grundvoraussetzungen sind in solchen Umgebungen tatsächlich Mindestanforderungen, nicht Wünsche.

**Drittens, der CIO ist die einzige Sponsor-Persona**: alle anderen sind direkte Nutzer. Diese Asymmetrie spiegelt die echte Welt – Tool-Entscheidungen werden von Sponsoren getroffen, aber von Nutzern getragen.

## Vorgehen

Bei neuem Stakeholder: `/new-stakeholder` Slash-Command nutzen, basierend auf `../../templates/stakeholder.template.md`.

Bei Persona-Anpassung: Versionierung im Frontmatter, Änderung in Concerns oder Pain Points dokumentieren.
