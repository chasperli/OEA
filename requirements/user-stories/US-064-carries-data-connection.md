# US-064: carries-data Connection — DataFlow mit DataObject verknüpfen

**ID**: US-064
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Data Architekt möchte ich eine `carries-data`-Verbindung zwischen einem Datenfluss und einem Datenobjekt anlegen – damit der Datenfluss explizit als Transporteur dieses Datenobjekts gilt und die Lineage traversierbar wird.

## Bezug

**Use Case**: [UC-08](../use-cases/UC-08-data-lineage-modellieren.md)
**Persona**: Lukas – Senior Data Architekt (SH-02)
**Requirements**: [REQ-061](../req/REQ-061-n-connection-carries-data.md)

## Akzeptanzkriterien

**AC1** (carries-data anlegen):
- Gegeben: DataFlow id=5 (`data-flow`, `allowsConnectionAsSource=true`); DataObject id=42
- Wenn: Lukas legt carries-data an (sourceEntityId=5, targetEntityId=42)
- Dann: carries-data erhält eigene Integer-ID (z.B. 103); sourceEntityId=5 und targetEntityId=42 korrekt gesetzt

**AC2** (Ablehnung: source ohne allowsConnectionAsSource):
- Gegeben: ApplicationComponent id=1 (`allowsConnectionAsSource=false`)
- Wenn: Lukas versucht carries-data mit sourceEntityId=1 anzulegen
- Dann: HTTP 422; Fehlermeldung: „application-component erlaubt keine Connection-Quelle"

**AC3** (Ablehnung: target ist Connection):
- Wenn: Lukas versucht carries-data mit targetEntityId=5 (DataFlow, isConnection=true)
- Dann: HTTP 422

**AC4** (Tiefenbegrenzung v1.0):
- Gegeben: carries-data id=103 (`allowsConnectionAsSource=false`)
- Wenn: Lukas versucht weitere Connection mit sourceEntityId=103
- Dann: HTTP 422 „n-Connection-Tiefe überschritten"

**AC5** (source/target unveränderlich):
- Gegeben: carries-data id=103 mit sourceEntityId=5
- Wenn: Lukas versucht sourceEntityId auf 6 zu ändern
- Dann: HTTP 422; sourceEntityId bleibt 5

## Technische Hinweise

- `POST /api/v1/entities` mit entityTypeId=`carries-data`, sourceEntityId, targetEntityId
- Validierung `allowsConnectionAsSource` serverseitig gegen MetamodelConfiguration

## Definition of Done

- [ ] AC1–AC5 erfüllt
- [ ] Tests: Anlegen, source-Ablehnung, target-Ablehnung, Tiefe, Unveränderlichkeit
- [ ] Code-Review
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
