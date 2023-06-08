# VermarkungsGIS

Innerhalb der Bachelorthesis (12/2023) mit dem Titel "Weniger Staub, mehr Daten - neue Prozesse in der amtlichen Vermessung" an der [Hochschule Architektur, Bau und Geomatik der FHNW](https://www.fhnw.ch/de/die-fhnw/hochschulen/architektur-bau-geomatik) wurde ein WebGIS zur Verwaltung der Vermarkung der Grenzzeichen der amtlichen Vermessung geschaffen. Zugeschnitten auf die [RSW AG](https://www.rswag.ch/) (Projektpartner) kann der bis anhing analoge Prozess nun vollständig digital abgewickelt werden. Nebst der definitiven Erstellung der Grenzzeichen können sowohl zurückgestellte Vermarkungen wie auch Projektmutationen verwaltet werden. Eine analoge Aufbewahrung der Akten wird somit überflüssig.  

<p align="center">
  <img src="/docs/screenshot_Start.PNG" alt="Startansicht WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 1: Ansicht beim Aufstarten des WebGIS</em>
</p>

## Aufbau 

Als Grundlage dient eine PostgreSQL-Datenbank mit der räumlichen Erweiterung PostGIS. Diese wird mit dem GeoServer publiziert und anschliessend in einem WebGIS visualisiert. 

<p align="center">
  <img src="/docs/screenshot_Start.PNG" alt="Startansicht WebGIS" style="height: auto; width:70%;"/>
  <br>
  <em>Abb. 2: Organisation der Vermarkungsverwaltung.</em>
</p>
