# Sicherheitsrichtlinie / Security Policy

Vielen Dank für deine Bemühungen, OEA sicher zu machen. Verantwortliches Melden von Sicherheitslücken ist ein wichtiger Beitrag zur Open-Source-Gemeinschaft.

## Unterstützte Versionen

| Version | Unterstützt | Hinweise |
|---|---|---|
| 0.x | ✓ | Aktive Entwicklung, vor v1.0-Release |
| < 0.x | ✗ | Pre-Alpha, nicht für Produktion gedacht |

Sobald v1.0 veröffentlicht ist, werden in der Regel die letzte Major-Version und die aktuelle unterstützt.

## Melden von Sicherheitslücken

**Bitte melde Sicherheitslücken NICHT öffentlich** (nicht als GitHub/Gitea-Issue, nicht in Diskussionen, nicht in Pull Requests).

### Sicherer Meldeweg

Verwende einen der folgenden Wege:

1. **E-Mail** (bevorzugt): `security@oea.org` (TBD – muss vor Go-Live eingerichtet werden)
2. **PGP-verschlüsselt**: PGP-Key wird bei Go-Live veröffentlicht
3. **Private Security Advisory** in GitHub/Gitea (falls aktiviert)

### Was deine Meldung enthalten sollte

Damit wir schnell reagieren können:

- **Beschreibung der Lücke**: Was ist das Problem?
- **Reproduktion**: Schritt-für-Schritt-Anleitung
- **Auswirkung**: Welche Daten oder Funktionen sind betroffen?
- **Schweregrad-Einschätzung**: critical / high / medium / low (deine Einschätzung)
- **Betroffene Version(en)**: Commit-Hash oder Release-Tag
- **Umgebung**: OS, Konfiguration, Deployment-Variante
- **Vorschlag zur Behebung** (optional): Falls du eine Idee hast

### Was bei deiner Meldung passiert

| Zeitrahmen | Aktion |
|---|---|
| Innerhalb 48 Stunden | Eingangsbestätigung an dich |
| Innerhalb 5 Werktagen | Erste technische Einschätzung |
| Innerhalb 30 Tagen | Behebungs-Plan und voraussichtlicher Veröffentlichungs-Zeitraum |
| Vor öffentlicher Veröffentlichung | Abstimmung mit dir zu Disclosure-Timing |

Wir verfolgen das Modell **Coordinated Disclosure**: Sicherheitslücken werden erst nach Behebung öffentlich gemacht, in Abstimmung mit dem Melder.

## Sicherheits-Garantien (Stand und Roadmap)

OEA wird mit Sicherheit als Design-Constraint entwickelt:

- **Property-Level-Autorisierung** als Pflicht-Feature
- **Audit-Trail** append-only, separat gespeichert
- **Verschlüsselung at-rest und in-transit** als Standard
- **OIDC/LDAP** für AuthN, niemals nur lokale Accounts
- **Strukturierte Logs** ohne PII-Leaks
- **Sichere Defaults**: TLS an, AuthN required, Audit-Log aktiv

Details siehe [`concept/70-platform/21-api-architektur.md`](concept/70-platform/21-api-architektur.md) §21.8 und [`concept/60-integrations/20-grc-dsgvo-isms-integration.md`](concept/60-integrations/20-grc-dsgvo-isms-integration.md).

## Bekannte Sicherheitsaspekte (Pre-Production)

OEA ist vor v1.0 noch nicht produktiv einsetzbar. Folgende Aspekte sind bewusst noch in Arbeit:

- TBD: SBOM-Generierung (Software Bill of Materials)
- TBD: Signierte Container-Images (Cosign)
- TBD: Reproduzierbare Builds
- TBD: Vollständiger Penetration-Test vor v1.0

Wenn du OEA in Produktion einsetzen willst, prüfe den aktuellen Stand und kontaktiere uns für eine Bewertung deiner Use Cases.

## Anerkennung

Personen, die Sicherheitslücken verantwortlich melden, werden auf Wunsch im Release-Changelog genannt. Wir bieten kein Bug-Bounty-Programm, schätzen aber jeden Beitrag zur Sicherheit von OEA.

## Häufige Fragen

**Warum nicht GPG-verschlüsselt verpflichtend?**
Wir möchten Meldungen niedrig-schwellig ermöglichen. PGP ist verfügbar, aber nicht Pflicht.

**Was, wenn die Lücke akut ausgenutzt wird?**
Wenn du Anzeichen aktiver Ausnutzung siehst, schreibe das in den Betreff: "AKUT: ..." – wir reagieren schneller.

**Was, wenn ich die Lücke im Tool eines Drittanbieters entdecke?**
OEA nutzt verschiedene Dependencies. Wenn die Lücke in einem fremden Tool ist, melde sie dem entsprechenden Maintainer und informiere uns parallel, damit wir bei Bedarf Patches einarbeiten können.

**Wer sieht meine Meldung?**
Initial nur die Security-Verantwortlichen (siehe [MAINTAINERS.md](MAINTAINERS.md)). Bei komplexen Lücken können weitere Maintainer hinzugezogen werden, immer unter Vertraulichkeits-Vereinbarung.

## Vielen Dank

Sicherheits-Meldungen sind eine wertvolle Form der Mitwirkung. Wir schätzen jeden Beitrag.
