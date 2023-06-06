# VermarkungsGIS

Verwaltungstool (WebGIS) für die Vermarkung der Grenzzeichen in der amtlichen Vermessung, eingeschlossen zurückgestellte Vermarkungen und Projektmutationen. Entwickelt innerhalb der Bachelorthesis (12/2023) mit dem Titel "Weniger Staub, mehr Daten - neue Prozesse in der amtlichen Vermessung" am [Institut Geomatik](https://www.fhnw.ch/de/die-fhnw/hochschulen/architektur-bau-geomatik/institute/institut-geomatik) der Hochschule für Architektur, Bau und Geomatik.

Stand: 04.06.2023

## Aufbau

Das WebGIS teilt sich in verschieden Modi, welche ihrerseits über zugeschnittene Darstellungen und Funktionen verfügen. Folgende sechs Modi wurden realisiert:
*   [Übersicht](#übersicht) &rarr; allgemeiner Überblick
*   [Erfassung](#erfassung) &rarr; Auftragserfassung (Büro)
*   [Vermarkung](#vermarkung) &rarr; definitive Kennzeichnung der Grenzzeichen im Feld 
*   [Erledigt](#erledigt) &rarr; Auftragskontrolle (Büro)
*   [VZ / PM](#vz--pm) &rarr; Verwaltung von zurückgestellten Vermarkungen und Projektmutationen
*   [Archiv](#archiv) &rarr; abgeschlossene Aufträge

Hintergrundauswahl, Parzellensuche, Legende (jeweils angepasst), Massstabsbalken, Quellenangabe und Hilfestellung sind in allen Modi verfügbar. Die weiteren Funktionen der Modi werden in den folgenden Abschnitten erläutert.

<p align="center">
  <img src="screenshot_Start_edit.png" alt="Funktionen WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 1: Allgemeinde Steuerelemente des WebGIS</em>
</p>

>>#### Legende Abbildung:
>>1. Moduswahl (angepasst an Modus)
>>2. Legende (angepasst an Modus)
>>3. Massstabsbalken
>>4. Quellenangabe Hintergrund
>>5. Hintergrundauswahlt (angepasst an Zoomstufe)
>>6. Hilfestellung
>>7. Parzellensuche
>>8. Zoom

## Modi

### Übersicht
Dieser Modus dient der Übersicht über die Aufträge, dabei können die Aufträge nach ihrem Status ein- und ausgeblendet werden. Zusätzlich steht eine Auftragssuche zur Verfügung. Beim Klick auf den ***Suchen***-Button werden alle Aufträge gesucht, welche mit der eingegebenen Zeichenfolge beginnen. Die gefundenen Aufträge werden anschliessend nach der Auftragsnummer aufsteigen aufgelistet, über das ***Lupen***-Symbol kann auf den entsprechenden Auftrag gezommt werden.

<p align="center">
  <img src="screenshot_Uebersicht_edit.png" alt="Modus Übersicht WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 2: Funktionen des WebGIS im Modus Übersicht</em>
</p>

>>#### Legende Abbildung:
>>1. Layer ein- und ausblenden
>>2. Zoom auf Auftrag
>>3. Auftragssuche

Beim Anklicken eines Objektes öffnet sich eine Popup, welches alle Informationen über das Objekt anzeigt. Mit einem Klick auf das ***Zahnrad***-Symbol können die Werte verändert werden. Ein Speichern der Änderungen über den ***Speichern***-Button ist zwingend notwendig, ansonsten gehen die Änderungen verloren.

<p align="center">
  <img src="screenshot_Uebersicht_edit2.png" alt="Modus Übersicht WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 3: Funktionen (Auftrags-) Popup im Modus Übersicht</em>
</p>

>>#### Legende Abbildung:
>>1. Objektinformationen bearbeiten
>>2. Popup schliessen 

### Erfassung
Innerhalb von diesem Modus können Aufträge und die dazugehörigen Punkte erfasst werden. Zusätzlich werden alle Aufträge mit dem Status *erfasst* dem Erfassungsdatum nach absteigend aufgelistet. Die Auflistung kann mit entsprechender Eingabe gefiltert werden. Punkte können nur innerhalb von bestehenden Auftragsflächen erfasst werden.

<p align="center">
  <img src="screenshot_Start_edit.png" alt="Funktionen WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 4: Allgemeinde Steuerelemente des WebGIS</em>
</p>

>>#### Legende Abbildung:
>>1. Auftrag erfassen
>>2. Vermarkungspunkt erfassen
>>3. Aufträge filtern

Beim Erfassen der Geometrien kann sowohl auf Grenzpunkten, wie auch auf Fixpunkten gefangen werden. Nach der Erstellung des Objekts öffnet sich automatisch ein Popup, in welchem alle nötigen Attributwerte vergeben werden können. Dabei wird die Gemeinde automatisch mit einem Abgleich mit den Gemeindegrenzen ermittelt, eine Anpassung ist möglich. Durch denn Klick auf den ***Speichern***-Button wir eine WFS-Transaktion ausgelöst und das Objekt in der Datenbank gespeichert.

Während dem Erfassen eines Objekts besteht über die Funktionsbutton zur Erstellung die Möglichkeit die Erfassung abzubrechen. Auch durch wechseln des Modus kann die Erfassung abgebrochen werden.

:warning: BILD

>>#### Legende Abbildung:
>>1. Erfasstes Objekt speichern
>>2. Popup schliessen (Abbruch der Erfassung - Objekt wird nicht gespeichert)

Nach der Erfassung des Auftrags und der dazugehörigen Punkte (und entsprechenden Vorarbeiten im Feld) kann der Auftrag zur Vermarkung freigegeben werden. Dazu kann der Auftrag angeklickt werden und im sich öffnenden Popup mit dem ***Freigeben***-Button (erscheint erst, wenn Auftrag in Datenbank gespeichert) freigegeben werden. 

Sobald ein Objekt (Auftrag oder Punkt) in der Datenbank gespeichert ist, besteht zudem die Möglichkeit seine Geometrie zu bearbeiten. Die Bearbeitung kann mit dem ***Stift***-Symbol im Popup geöffnet werden. Es können jeweils nur die Elemente des entsprechenden Auftrags bearbeitet werden. Nach der Bearbeitung müssen zwingend alle Vermarkungspunkte innerhalb der Auftragsfläche liegen.

:warning: BILD

>>#### Legende Abbildung:
>>1. Auftrag für Steinsatz freigeben
>>2. Geometrie bearbeiten
>>3. Objektinformationen bearbeiten

Die leicht veränderte Oberfläche während der Geometriebearbeitung bietet eine minimale Anleitung, sowie einen Button zum Speichern der getätigten Änderungen. Die Stützpunkte (oder Punkte) können mit gedrücktgehaltener Maustaste (links) verschoben werden, die ***Umschalt***-Taste ermöglicht mit gleichzeitigem Linksklick das Löschen von Stützpunkten. Auch bei der Modifizierung von Geometrien kann auf den Grenzpunkten und Fixpunkten gefangen werden.

:warning: BILD

>>#### Legende Abbildung:
>>1. Geometriebearbeitung beenden (automatische Speicherung)
>>2. Kurzanleitung

### Vermarkung
Dieser Modus dient dem Feldpersonal. Wie bereits im vorangegangenen Modus werden alle relevanten Aufträge (Status = *bereit für Vermarkung*) aufgelistet. Die Auflistung ist nach der Fälligkeit sortiert. Nebst dem Zoom auf den Auftrag beinhaltet ein Auftrag neu auch die Möglichkeit, ihn in die Materialberechnung einzubeziehen oder seinen Standort auf Google Maps zu öffnen. Die Materialberechnung dient dem Beladen des Feldfahrzeuges und berücksichtigt alle aktivierten Aufträge (unter Berücksichtigung der bereits gesetzten Zeichen). Ist die Vermarkung eines Punktes erstellt kann das definitive Vermarkungszeichen gesetzt werden, zusätzlich lässt sich eine Kontrolle erfassen. Erst wenn alle Punkte vermarkt sind, kann auch der Auftrag mit dem ***Vermarkung abschliessen***-Button abgeschlossen werden.  

:warning: BILD

>>#### Legende Abbildung:
>>1. Objektinformationen bearbeiten
>>2. Vermarkung abschliessen
>>3. Kontrollmass erfassen
>>4. Auftrag zur Materialberechnung hinzufügen / Entfernen
>>5. Standort in Google Maps öffnen
>>6. Zoom auf Auftrag
>>7. Materialberechnung ausführen

:warning: BILD

Kontollmasse können über den Funktionsbutton ***Kontrollmass erfassen*** direkt digital erstellt werden. Dabei gilt zu beachten, dass das Kontrollmass zwingend auf einem Vermarkungspunkt starten muss. Nach dem Absetzen der beiden Punke öffnet sich ein Popup. Die Soll-Distanz berechnet sich direkt aus den Koordinaten, sollte aber aufgrund der eingeschränkten Fangmöglichkeiten noch überprüft werden. 

:warning: BILD

>>#### Legende Abbildung:
>>1. Erfasstes Kontrollmass speichern

### Erledigt

:warning: TEXT

### VZ / PM

:warning: TEXT

### Archiv

:warning: TEXT
