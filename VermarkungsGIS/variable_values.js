/* Dieses File dient speichert alle Variablen und deren Zustanende. Dadurch wird der Zugriff 
   durch verschiedene Files auf die Variablen sichergestellt. */

// -------------------------------------------------------------------------------------------------

// Variablendefinition
// -------------------------------------------------------------------------------------------------

// Kartenansicht
// ------------------------------------------------------------
// ausgewaehlter Modus
var sel_mode = '00_overview';
// ausgewaehlte Hintergrundkarte Detailansicht
var sel_background_detail = 'but_01_background_av_color';
// ausgewaehlte Hintergrundkarte Uebersichtsansicht
var sel_background_overview = 'but_01_background_ov_color';
// aktuelle Zoomstufe
var current_zoom = 18;

// WFS Transaktionen
// ------------------------------------------------------------
// Status laufende WFS-Transaktion
var runningWFSTransaction = false;

// Auftraege
// ------------------------------------------------------------
// Status Auftragerfassung
var state_drawJobPolygon = false;
// Status Auftragsmodifizierung (Geometrie)
var state_modifyJobPolygon = false;
// Definition Funktionsnamen Auftragsbearbeitung (ermoeglicht spaeteres Hinzufuegen und Enfernen)
let drawJob, snapJob, modifyJob;

// Punkte
// ------------------------------------------------------------
// Status Punkterfassung
var state_drawPntPoint = false;
// Status Punktmodifizierung (Geometrie)
var state_modifyPntPoint = false;
// Definition Funktionsnamen Punktbearbeitung (ermoeglicht spaeteres Hinzufuegen und Enfernen)
let drawPnt, snapPnt, modifyPnt;

// Kontrollmasse
// ------------------------------------------------------------
// Status Kontrollmasserfassung
var state_drawChkLine = false;
// Definition Funktionsnamen Kontrollmassbearb. (ermoeglicht spaeteres Hinzufuegen und Enfernen)
let drawChk, snapChk
// Zwischenspeicherung Startpunkt des Kontrollmass
var chkLineStartPointID = null;

// Bearbeitung Allgemein
// ------------------------------------------------------------
// zu modifizierendes Objekt (Geometrie)
var featureToModify = undefined;
// Definition der Snapfunktionen (ermoeglicht spaeteres Hinzufuegen und Entfernen)
let snapGP, snapHGP, snapFP

// Auftragsliste
// ------------------------------------------------------------
// Liste mit Auftraegen
var reportList = [];
// Auftragsfilter
let jobFilter = ''

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  // Kartenansicht
  sel_mode,
  sel_background_detail,
  sel_background_overview,
  current_zoom,
  // WFS Transaktionen
  runningWFSTransaction,
  // Auftraege
  state_drawJobPolygon,
  state_modifyJobPolygon,
  drawJob, snapJob, modifyJob,
  // Punkte
  state_drawPntPoint,
  state_modifyPntPoint,
  drawPnt, snapPnt, modifyPnt,
  // Kontrollmasse
  state_drawChkLine,
  drawChk, snapChk,
  chkLineStartPointID,
  // Bearbeitung Allgemein
  featureToModify,
  snapGP, snapHGP, snapFP,
  // Auftragsliste
  jobFilter,
  reportList,
};
// -------------------------------------------------------------------------------------------------