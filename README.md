# VermarkungsGIS

Innerhalb der Bachelorthesis (12/2023) mit dem Titel "Weniger Staub, mehr Daten - neue Prozesse in der amtlichen Vermessung" an der [Hochschule Architektur, Bau und Geomatik der FHNW](https://www.fhnw.ch/de/die-fhnw/hochschulen/architektur-bau-geomatik) wurde ein WebGIS zur Verwaltung der Vermarkung der Grenzzeichen der amtlichen Vermessung geschaffen. Zugeschnitten auf die [RSW AG](https://www.rswag.ch/) (Projektpartner) kann der bis anhing analoge Prozess nun vollständig digital abgewickelt werden. Nebst der definitiven Erstellung der Grenzzeichen können sowohl zurückgestellte Vermarkungen wie auch Projektmutationen verwaltet werden. Eine analoge Aufbewahrung der Akten wird somit überflüssig.  

<p align="center">
  <img src="/docs/animationWebGIS.gif" alt="WebGIS" style="height: auto; width:100%;"/>
  <br>
  <em>Abb. 1: Animation WebGIS</em>
</p>

## Aufbau 

Als Grundlage dient eine PostgreSQL-Datenbank mit der räumlichen Erweiterung PostGIS. Diese wird mit dem GeoServer publiziert und anschliessend in einem WebGIS visualisiert. 

<p align="center">
  <img src="/docs/Aufbau_Vermarkungstool.png" alt="Mindmap Aufbau Vermarkungstool" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 2: Organisation der Vermarkungsverwaltung in Form eines Mindmap.</em>
</p>

## Installation
Für die Installation werden die folgenden Elemente vorausgesetzt:
* [PostgreSQL](https://www.postgresql.org/docs/current/tutorial-install.html) mit der Erweiterung [PostGIS](https://postgis.net/)
* [PgAdmin 4](https://www.pgadmin.org/download/)
* [GeoServer](https://geoserver.org/download/)
* IDE (Integrierte Entwicklungsumgebung) wie beispielsweise [Visual Studio Code](https://code.visualstudio.com/) 
* Node.js und npm [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### 1. Speicherung
Mit der Datei ***create_database.sql*** lässt sich in PgAdmin 4 einfach eine Datenbank mit den nötigen Tabellen und Beziehungen erstellen.

### 2. Veröffentlichung
Die Erstellte Datenbank kann anschliessend mit GeoServer veröffentlicht werden. Dazu kann die [Anleitung](https://docs.geoserver.org/latest/en/user/gettingstarted/postgis-quickstart/index.html) in der GeoServer-Dokumentation verwendet werden. Die Elemente könnten dabei die folgenden Benennungen tragen:

* **Arbeitsbereich:** vermarkung
* **Datenspeicher** (Datenbank)**:** vermarkung
* **Layer** (Aufträge)**:** vermarkung_auftraege
* **Layer** (Grenzpunkte)**:** vermarkung_grenzpunkte
* **Layer** (Kontrollmasse)**:** vermarkung_kontrollmasse

Die verwendeten Namen und die so entstandenen Verbindungen müssen anschliessend in der JavaScript-Datei ***internal_services.js*** angepasst werden (z.B. mit der installierten IDE).

```js
// Serververbindung
// ------------------------------------------------------------
// URL des Servers
var server_url = 'http://localhost:8080/geoserver/wfs';
// Name des Arbeitsbereich
var server_workspace = 'vermarkung';
// Namensraum Arbeitsbereich URI
var server_workspace_URI = 'http://geoserver.org/vermarkung';
// Layername Auftraege
var server_job_layer = 'vermarkung_auftraege';
// Layername Punkte
var server_pnt_layer = 'vermarkung_grenzpunkte';
// Layername Kontrollmasse
var server_chk_layer = 'vermarkung_kontrollmasse';
```
Anschliessend kann der GeoServer über die bei der Installation mitgelieferte Datei ***startup.bat*** gestartet werden. Da die Zeitzoneninformationen nicht von Interesse sind muss der Abschnitt *:run* in der Datei angepasst werden: 

```bat
:run
  cd "%GEOSERVER_HOME%"
  echo Please wait while loading GeoServer...
  echo.
  "%RUN_JAVA%" %JAVA_OPTS% -DGEOSERVER_DATA_DIR="%GEOSERVER_DATA_DIR%" -Djava.awt.headless=true -DSTOP.PORT=8079  -Dorg.geotools.localDateTimeHandling=true -DSTOP.KEY=geoserver -jar start.jar
  cd bin
goto end
```

### 3. Visualisierung
Ist der GeoServer eingerichtet und aufgestartet, kann mit der Eingabeaufforderung in den Ordner ***VermarkungsGIS*** navigiert werden. Nach der Installation der nötigen Module, kann die Applikation gestartet werden und über den angezeigten Link geöffnet werden.

```shell
# Navigation in Ordner
cd VermarkungsGIS

# Installieren der Module (Ausfuehrung nur einmalig noetig)
npm install

# Projekt starten
npm start
```

---
Stand: 09.06.2023
