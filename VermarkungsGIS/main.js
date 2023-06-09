/* Dieses File dient als Hauptfile. Innerhalb werden alle Funktionalitaeten miteinander 
   kombiniert. Neben der Kartendarstellung umfasst diese File aich das Senden von WFS-Transaktionen
   und die Steuerung der verschiedenen Funktionen zur Objektmanipulation. Einschliesslich der 
   Darstellung von Objektinformationen in Popups. */

// -------------------------------------------------------------------------------------------------

// Import
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Control, ScaleLine, defaults as defaultControls} from 'ol/control.js';
import {Projection} from 'ol/proj';
import Overlay from 'ol/Overlay.js';
import WFS from 'ol/format/WFS.js'
import GML from 'ol/format/GML.js'
import {Draw, Modify, Snap} from 'ol/interaction.js'
import {Feature} from 'ol';
import {shiftKeyOnly, singleClick} from 'ol/events/condition.js';
import {getCenter} from 'ol/extent.js';
import extData from './external_services.js'
import popupContent from './popup_content.js'
import communityData from './community_values.js'
import legendContent from './legend_content.js';
import colorData from './color_values.js';
import variableData from './variable_values.js'
import intData from './internal_services.js'

// allgemeine Funktionen
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Gemeindeauswahl bei Parzellensuche gemaess Gemeindelist (community_values.js) erstellen
// -------------------------------------------------------------------------------------------------
document.getElementById('parzSearchGmd').innerHTML =  communityData.parzSearchGmd_inline()

// bei Eingabefeldern nur Ganzzahlen als Input zulassen (Input mit Klasse: 'skip-char')
// -------------------------------------------------------------------------------------------------
/* Quelle: bitbug. (24.08.2022). How to Make an Input Only Accept Integers. medium.
   Url: https://javascript.plainenglish.io/how-to-make-an-input-only-accept-integers-9cc54f6217ad
   [Abgerufen: 08.05.2023] */
   function checkInputInteger() {
    document.querySelectorAll('.skip-char').forEach(function (input) {
      input.addEventListener('keydown', event => {
        const codes = [
          190, // .
          110, // . (numpad)
          189, // -
          109, // - (numpad)
          49,  // +
          107, // + (numpad)
          69,  // e (scientific notaion, 1e2 === 100)
          17,  // control
        ];
      if (codes.includes(event.keyCode)) {
        event.preventDefault();
        return false;
      }
      return true;
      });
    });
  };
  checkInputInteger();

// Validierung und Bearbeitung von Daten
// -------------------------------------------------------------------------------------------------
// Umformen des Datums aus dem WFS-Dienst in die deutsche Schreibweise
function unformDateToDE (date) {
  if (date != undefined) {
    return date.split("-")[2] + '.' + date.split("-")[1] + '.' + date.split("-")[0];
  }
  else {
    return '';
  };
};

// Funktion zum Warten bis eine gewisse Bedingung erfuellt ist (z.B. Datenquelle laden)
// -------------------------------------------------------------------------------------------------
/* Quelle: Kamil. Kielczewski. & tdxius. (07.12.2022). 
   How to wait until a predicate condition becomes true in JavaScript?. stack overflow.
   URL: https://stackoverflow.com/questions/22125865/how-to-wait-until-a-predicate-condition-becomes-true-in-javascript
   [Abgerufen: 01.04.2023] */
const waitUntil = (condition, checkInterval=100) => {
  return new Promise(resolve => {
      let interval = setInterval(() => {
          if (!condition()) return;
          clearInterval(interval);
          resolve();
      }, checkInterval)
  })
};

// Fehlermeldung
// -------------------------------------------------------------------------------------------------
// Darstellen von fehlerhaften Eintraegen 
async function cellFlasher(popupObjID, endcolor, hoverAttrList){
  var errorCell = document.getElementById(popupObjID);
  // Ausschalten des Hover-Effekts (ohne ueberdeckt der Hover-Effekt das Blinken)
  if (hoverAttrList.length == 2) {
    document.getElementById(hoverAttrList[0]).classList.remove(hoverAttrList[1])
  };
  for (let j = 0; j < 6; j++) {
    errorCell.style.backgroundColor='red';
    await new Promise(r => setTimeout(r, 80));
    errorCell.style.backgroundColor='white';
    await new Promise(r => setTimeout(r, 80));
  };
  errorCell.style.backgroundColor=endcolor;
  // Einschalten des Hover-Effekts
    if (hoverAttrList.length == 2) {
      document.getElementById(hoverAttrList[0]).classList.add(hoverAttrList[1])
    };
};





// Parzellensuche
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
document.getElementById('parzSearchButton').addEventListener('click', function(){
  // Kontrolle der Eingabe
  if (document.getElementById('parzSearchNum').value != '') {
    // Deaktivierung des Suchen Buttons waehrend der Abfrage
    document.getElementById('parzSearchButton').disabled = true;
    document.getElementById('parzSearchButton').classList.remove('parzSearchButtonHov')
    // Abfrage geodienste.ch nach Parzelle (Filter -> NBIdent + Parzellennummer)
    var vect_source_TempZoomLayer = 'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:RESF&SRSNAME=EPSG:2056&FILTER=' +
    '<Filter>' + 
      '<AND>' + 
        '<PropertyIsEqualTo>' + 
          '<PropertyName>NBIdent</PropertyName>' + 
          '<Literal>' + document.getElementById('parzSearchGmd').value +'</Literal>' + 
        '</PropertyIsEqualTo>' + 
        '<PropertyIsEqualTo>' + 
          '<PropertyName>Nummer</PropertyName>' + 
          '<Literal>' + document.getElementById('parzSearchNum').value +'</Literal>' + 
      '</PropertyIsEqualTo>' + 
      '</AND>' +
    '</Filter>' +
    '&OUTPUTFORMAT=geojson'
    // Abwarten der Antwort und anschliessende Abfrage der Bounding-Box
    /* Quelle: Hien. Nguyen. (04.05.2019). Get json data from url and put it into variable by JavaScript.
       stack overflow. URL: https://stackoverflow.com/questions/55979836/get-json-data-from-url-and-put-it-into-variable-by-javascript
       [Abgerufen: 14.04.2023] */
    async function getParzGeom(){
      let obj = await(await fetch(vect_source_TempZoomLayer)).json();
      if (obj['features'].length > 0) {
        let geo = obj['features'][0]['geometry']['coordinates'][0];
        let coord_x = [];
        let coord_y = [];
        for (let i = 0; i < geo.length; i++) {
          coord_x.push(geo[i][0]);
          coord_y.push(geo[i][1]);
        };
        // Bestimmung der Eckpunkte (Bounding-Box)
        /* Quelle: mdn. (o. D.). Math.max(). mdn.
           URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
           [Abgerufen: 14.04.2023] */
        let max_coord_x = coord_x.reduce((a, b) => Math.max(a, b), -Infinity);
        let min_coord_x = coord_x.reduce((a, b) => Math.min(a, b), Infinity);
        let max_coord_y = coord_y.reduce((a, b) => Math.max(a, b), -Infinity);
        let min_coord_y = coord_y.reduce((a, b) => Math.min(a, b), Infinity);
        map.getView().fit([min_coord_x, min_coord_y, max_coord_x, max_coord_y], map.getSize());
        // Aktivieren des Suchen Buttons
        document.getElementById("parzSearchButton").disabled = false;
        document.getElementById('parzSearchButton').classList.add('parzSearchButtonHov')
      }
      // Keine Uebereinstimmung -> Fehlermeldung
      else {
        cellFlasher('parzSearchNum', 'white', []);
        // Aktivieren des Suchen Buttons
        document.getElementById("parzSearchButton").disabled = false;
        document.getElementById('parzSearchButton').classList.add('parzSearchButtonHov')
      };
    };
    // Funktion aufrufen
    getParzGeom();
  }
  // keine Eingabe -> Fehlermeldung
  else {
    cellFlasher('parzSearchNum', 'white', []);
  };
});





// Auftragsliste (inkl. Auftragssuche / -filterung, Materialreport und Auftraege loeschen)
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// aktualisieren der Auftragsliste bei Layerveraenderungen 
// -------------------------------------------------------------------------------------------------

// Auftraege (abwarten von Veraenderungen)
// ------------------------------------------------------------
intData.vect_Jobs.getSource().on('change', function(evt) {
  var jobsource = evt.target;
  // Quelle muss geladen & mehr Objekte als 0 & keine laufende WFS Transaktion
  if (jobsource.getState() == 'ready' 
      && jobsource.getFeatures().length > 0 
      && variableData.runningWFSTransaction == false) {
    // Nur abfuellen wenn aktuell keine Geometrie bearbeitet wird
    if (variableData.state_modifyJobPolygon == false 
        && variableData.state_modifyPntPoint == false 
        && variableData.sel_mode != '00_overview') {
      fillJobList(jobsource, variableData.sel_mode);       // Abfuellen der Auftragsliste
    };
  };
});

// Punkte (abwarten von Veraenderungen)
// ------------------------------------------------------------
intData.vect_Points.getSource().on('change', function(evt) {
  var jobsource = intData.vect_Jobs.getSource()
  // Quelle muss geladen & mehr Objekte als 0 & keine laufende WFS Transaktion
  if (jobsource.getState() == 'ready' 
      && jobsource.getFeatures().length > 0 
      && variableData.runningWFSTransaction == false) {
    // Nur abfuellen wenn aktuell keine Geometrie bearbeitet wird
    if (variableData.state_modifyJobPolygon== false 
        && variableData.state_modifyPntPoint == false 
        && variableData.sel_mode != '00_overview') {
      fillJobList(jobsource, variableData.sel_mode);       // Abfuellen der Auftragsliste
    };
  };
});

// Elemente Auftragsliste
// -------------------------------------------------------------------------------------------------

// Ermmitteln der Anzahl Punkte innerhalb Auftrag pro Punktstatus
// ------------------------------------------------------------
function identifyPointsState(valueList){
// Anzahl erstellte Punkte
var numPointsCre = 0;
// Anzahl vermarkte Punkte
var numPointsMrk = 0;
// Anzahl kontrollierte Punkte
var numPointsChk = 0;
valueList.forEach(function(point){
    if (point.get('pkt_vermarkung') == null){
        numPointsCre += 1;
    }                                                      
    else if (point.get('pkt_vermarkung') != null && point.get('pkt_kontrolle') == 'ausstehend'){
        numPointsMrk += 1;
    }
    else if (point.get('pkt_vermarkung') != null && point.get('pkt_kontrolle') != 'ausstehend'){
        numPointsChk += 1;
    };
});
return  '<td class="col_left">Punkte</td>' +
        '<td class="col_right">' + 
          '<a style="color:black;"><b>' + valueList.length + '</b> (</a>' + 
          '<a style="color:' + colorData.clr_p_cre_line + ';">' + numPointsCre + '</a>' +
          '<a style="color:black;"> / </a>' +  
          '<a style="color:' + colorData.clr_p_mk_line + ';">' + numPointsMrk + '</a>' + 
          '<a style="color:black;"> / </a>' + 
          '<a style="color:' + colorData.clr_p_ck_line + ';">' + numPointsChk + '</a>' + 
          '<a style="color:black;">)</a>' + 
        '</td>';
};

// Erstellen (Abfuellen) von den Objekten pro Modus
// ------------------------------------------------------------
// Modus -> Erfassung
function box_job_ov (attributeListJob){
  var mainContent = '';
  // Sortieren der Liste nach der Auftragsnummer
  /* Quelle: Det. & PSR. (07.10.2022). How to sort 2 dimensional array by column value?.
  stack overflow. URL: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
  [Abgerufen: 07.04.2023] */
  attributeListJob.sort((a, b) => a[12] - b [12]);
  attributeListJob.forEach(function (attributeList) {
    // Ermitteln des Auftragtyps fuer Vergabe ID des <div> Tags 
    if (attributeList[2] == 'erfasst' && attributeList[1] == 'Vermarkung zurückgestellt') {
      var div_id = 'container_cre_vz';
    }
    else if (attributeList[2] == 'erfasst' && attributeList[1] == 'Abschluss Projektmutation') {
      var div_id = 'container_cre_pm';
    }
    else if (attributeList[2] == 'erfasst') {
      var div_id = 'container_cre';
    }
    else if (attributeList[2] == 'bereit zur Vermarkung') {
      var div_id = 'container_mrk';
    }
    else if (attributeList[2] == 'Vermarkung erstellt') {
      var div_id = 'container_dne';
    }
    else if (attributeList[2] == 'archiviert') {
      var div_id = 'container_arc';
    };
    // Inhalt eines Objekts
    mainContent +=  '<div class="singlejob-container" id="' + div_id+'">' +
                      '<table>' +
                        '<tr>' +
                          '<th class="col_left">Auftrag</th>' +
                          '<th class="col_right">' + attributeList[0] + '</th>' +
                        '</tr>' +
                        '<tr>' +
                          '<td class="col_left">Gemeinde</td>' +
                          '<td class="col_right">' + attributeList[10] + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<td class="col_left">Art</td>' +
                          '<td class="col_right">' + attributeList[1] + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<td class="col_left">Erfassung</td>' + 
                          '<td class="col_right">' + unformDateToDE(attributeList[3]) + '</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<td class="col_left">Status</td>' +
                          '<td class="col_right">' + attributeList[2] + '</td>' +
                        '</tr>' +
                      '</table>' +
                      '<div class="singlejob_button_div">' +
                        '<button class="singlejob_button" value="' + attributeList[8] + '">' +
                          '<img class="singlejob_icon" src="./img/magnifying-glass-solid.svg" alt="zoom"></img>' +
                        '</button>' +
                      '</div>' +
                    '</div>';
  });
  return mainContent;
};

// Modus -> Erfassung
function box_job_cre (attributeListJob){
var mainContent = '';
attributeListJob.forEach(function (attributeList) {
  // Ermitteln des Auftragtyps fuer Vergabe ID des <div> Tags 
  // -> Einfaerbung ("Auftrag erfasst" oder "Auftrag erfasst (VZ / PM)")
  if (attributeList[1] == 'Vermarkung zurückgestellt') {
    var div_id = 'container_cre_vz';
  }
  else if (attributeList[1] == 'Abschluss Projektmutation') {
    var div_id = 'container_cre_pm';
  }
  else {
    var div_id = 'container_cre';
  };
  // Inhalt eines Objekts
  mainContent +=  '<div class="singlejob-container" id="' + div_id+'">' +
                    '<table>' +
                      '<tr>' +
                        '<th class="col_left">Auftrag</th>' +
                        '<th class="col_right">' + attributeList[0] + '</th>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Gemeinde</td>' +
                        '<td class="col_right">' + attributeList[10] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Art</td>' +
                        '<td class="col_right">' + attributeList[1] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Erfassung</td>' + 
                        '<td class="col_right">' + unformDateToDE(attributeList[3]) + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Fälligkeit</td>' +
                        '<td class="col_right">' + unformDateToDE(attributeList[5]) + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Punkte</td>' +
                        '<td class="col_right">' + attributeList[9].length + '</td>' +
                      '</tr>' +
                    '</table>' +
                    '<div class="singlejob_button_div">' +
                      '<button class="singlejob_button" value="' + attributeList[8] + '">' +
                        '<img class="singlejob_icon" src="./img/magnifying-glass-solid.svg" alt="zoom"></img>' +
                      '</button>' +
                    '</div>' +
                  '</div>';
  });
  return mainContent;
};

// Modus -> Vermarkung
function box_job_mrk (attributeListJob){
var mainContent = '';
attributeListJob.forEach(function (attributeList) {
  var deadLineHTML = ''
  // wenn keine Faelligkeit vergeben auf "unbekannt" setzten
  // -> ersetzen des Wertes 999999 bei Auftraegen ohne Faelligkeit
  if (attributeList[6] == 999999) {
    deadLineHTML =  '<b style="color:' + txt_col + '">' + 
                      'unbekannt' + 
                    '</b> (' + unformDateToDE(attributeList[5]) + ')';
  }
  // wenn Faelligkeit vergeben
  else {
    // ermitteln der Anzahl Tage bis Faelligkeit -> Einfaerbung
    if (attributeList[6] < 0) {         // kleiner 0 = rot
      var txt_col = 'red';
    }
    else if (attributeList[6] <= 5) {   // kleiner gleich 5 = orange
      var txt_col = 'orange';
    }
    else {                              // groesser 5 = gruen
      var txt_col = 'green';
    };
    deadLineHTML =  '<b style="color:' + txt_col + '">' + 
                      attributeList[6] + ' Tage' + 
                    '</b> (' + unformDateToDE(attributeList[5]) + ')';
  };
  // Inhalt eines Objekts
  mainContent +=  '<div class="singlejob-container" id="container_mrk">' +
                    '<table>' +
                      '<tr>' +
                        '<th class="col_left">Auftrag</th>' +
                        '<th class="col_right">' + attributeList[0] + '</th>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Gemeinde</td>' +
                        '<td class="col_right">' + attributeList[10] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Art</td>' +
                        '<td class="col_right">' + attributeList[1] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Fälligkeit</td>' +
                        '<td class="col_right">' +
                          deadLineHTML +
                        '</td>' +
                      '</tr>' +
                      '<tr>' +
                        identifyPointsState(attributeList[9]) +
                      '</tr>' +
                    '</table>' +
                    '<div class="singlejob_button_div">' +
                      '<button class="singlejob_checkbox" value="' + attributeList[11] + '">' + 
                        '<img class="singlejob_icon" src="./img/square-regular.svg" alt="uncheck"></img>' +
                      '</button>' +
                      '<button class="singlejob_button" value="' + attributeList[8] + '">' +
                        '<img class="singlejob_icon" src="./img/magnifying-glass-solid.svg" alt="zoom"></img>' +
                      '</button>' +
                      '<button class="singlejob_maps" value="' + attributeList[8] + '">' + 
                        '<img class="singlejob_icon" src="./img/location-dot-solid.svg" alt="map"></img>' +
                      '</button>' +
                    '</div>' +
                  '</div>';
  });
  return mainContent;
};

// Modus -> Erledigt
function box_job_dne (attributeListJob){
var mainContent = '';
attributeListJob.forEach(function (attributeList) {
  // Inhalt eines Objekts
  mainContent +=  '<div class="singlejob-container" id="container_dne">' +
                    '<table>' +
                      '<tr>' +
                        '<th class="col_left">Auftrag</th>' +
                        '<th class="col_right">' + attributeList[0] + '</th>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Gemeinde</td>' +
                        '<td class="col_right">' + attributeList[10] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Art</td>' +
                        '<td class="col_right">' + attributeList[1] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Erledigt</td>' +
                        '<td class="col_right">' + unformDateToDE(attributeList[5]) + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        identifyPointsState(attributeList[9]) +
                      '</tr>' +
                    '</table>' +
                    '<div class="singlejob_button_div">' +
                      '<button class="singlejob_button" value="' + attributeList[8] + '">' +
                        '<img class="singlejob_icon" src="./img/magnifying-glass-solid.svg" alt="zoom"></img>' +
                      '</button>' +
                    '</div>' +
                  '</div>';
  });
  return mainContent;
};

// Modus -> Vermarkung zurückgestellt / Abschluss Projektmutation
function box_job_cre_vzpm (attributeListJob){
var mainContent = '';
attributeListJob.forEach(function (attributeList) {
  // Ermitteln des Auftragtyps fuer Vergabe ID des <div> Tags 
  // -> Einfaerbung ("Auftrag erfasst" oder "Auftrag erfasst (VZ / PM)")
  if (attributeList[1] == 'Vermarkung zurückgestellt') {
    var div_id = 'container_cre_vz';
  }
  else if (attributeList[1] == 'Abschluss Projektmutation') {
    var div_id = 'container_cre_pm';
  }
  // Ermitteln der Anzahl Tage seit Erfassung -> Einfaerbung
  if (attributeList[4] > 365) {         // mehr als 1 Jahr = rot
    var txt_col = 'red';
  }
  else if (attributeList[4] > 183) {    // mehr als 6 Monate = orange
    var txt_col = 'orange';
  }
  else {                                // weniger gleich 6 Monate = gruen
    var txt_col = 'green';
  };
  // Inhalt eines Objekts
  mainContent +=  '<div class="singlejob-container" id="' + div_id + '">' +
                    '<table>' +
                      '<tr>' +
                        '<th class="col_left">Auftrag</th>' +
                        '<th class="col_right">' + attributeList[0] + '</th>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Gemeinde</td>' +
                        '<td class="col_right">' + attributeList[10] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Art</td>' +
                        '<td class="col_right">' + attributeList[1] + '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Rückstellung</td>' +
                        '<td class="col_right">' + 
                          '<b style="color:' + txt_col + '">'
                            + attributeList[4] + ' Tage' + 
                          '</b> (' + unformDateToDE(attributeList[3]) + ')' + 
                        '</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td class="col_left">Punkte</td>' +
                        '<td class="col_right">' + attributeList[9].length + '</td>' +
                      '</tr>' +
                    '</table>' +
                    '<div class="singlejob_button_div">' +
                      '<button class="singlejob_button" value="' + attributeList[8] + '">' +
                        '<img class="singlejob_icon" src="./img/magnifying-glass-solid.svg" alt="zoom"></img>' +
                      '</button>' +
                    '</div>' +
                  '</div>';
  });
  return mainContent;
};

// sammeln und berechnen der fuer die Auflistung noetigen Werte pro Auftrag
// -------------------------------------------------------------------------------------------------
function collectJobVaues(feature) {
// aktuelles Datum
var dateNow = new Date();
// Auftragnummer 
var db_auftr_num = feature.get('auftr_nummer');
// Auftragstyp
var db_auftr_typ = feature.get('auftr_typ');
// Auftragsstatus
var db_auftr_sts = feature.get('auftr_status');
// Erfassungsdatum
var db_auftr_cre = feature.get('auftr_erfassung');
// Tage seit Erfassungsdatum
if (db_auftr_cre != null) {
  var dateCre = new Date(db_auftr_cre);
  // Berechnung der Zeitdifferenz in Millisekunden und Umrechnung in Tage
  var calc_cre_now = Math.round((dateNow-dateCre) / 1000 / 60 / 60 / 24);
}
else {
  var calc_cre_now = null;
};
// Faelligkeit 
var db_auftr_dli = feature.get('auftr_faelligkeit');
// Tage bis zur Faelligkeit
// Wenn Faelligkeit gesetzt ist, berechnug der Anzahl Tage bis Deasline
if (db_auftr_dli != null) {  
  var dateDli = new Date(db_auftr_dli);
  // Berechnung der Zeitdifferenz in Millisekunden und Umrechnung in Tage
  var calc_dli_now = Math.round((dateDli-dateNow) / 1000 / 60 / 60 / 24);
}
// Wenn keine Faelligkeit gesetzt, vergabe Wert 999999 
// -> dadurch werden Werte beim Sortieren ans Ende gestellt
else {
  var calc_dli_now = 999999;
};
// Abschlussdatum 
var db_auftr_end = feature.get('auftr_abschluss');
// Umrandung
var db_auftr_ext = feature.getGeometry().getExtent();
// Anzahl Punkte innerhalb der Auftragsflaeche
var db_pkt_features = [];
var db_auftr_id = feature.get('auftr_pk_id');
var db_pkt_inExtent = intData.vect_Points.getSource().getFeaturesInExtent(db_auftr_ext);
db_pkt_inExtent.forEach(
  function(pnt_feature) {
    if (pnt_feature.get('pkt_fk_auftr') == db_auftr_id) {
      db_pkt_features.push(pnt_feature);
    };
  },
);
var calc_job_pnt = db_pkt_features;
// Gemeinde
var db_auftr_com = feature.get('auftr_gemeinde');
// Auftragsnummer ohne Buchstaben (Sortierung nach Auftragsnummer)
var calc_auftr_num = db_auftr_num.replace(/[^\d.-]/g, '')
// Rueckgabe der Werte
return [db_auftr_num,     // Auftragsnummer
        db_auftr_typ,     // Auftragstyp
        db_auftr_sts,     // Auftragsstatus
        db_auftr_cre,     // Erfassungsdatum 
        calc_cre_now,     // Tage seit der Erfassung
        db_auftr_dli,     // Faelligkeit
        calc_dli_now,     // Tage bis zur Faelligkeit
        db_auftr_end,     // Abschlussdatum
        db_auftr_ext,     // Umrandung
        calc_job_pnt,     // Punkte in Auftrag
        db_auftr_com,     // Gemeinde
        db_auftr_id,      // Auftrags-ID
        calc_auftr_num    // Auftragsnummer ohne Buchstaben
        ];
};

// Auftragsliste erstellen (Auftraege einfuegen)
// -------------------------------------------------------------------------------------------------
// Inhalt der Auftragsliste
const jobListcontent = document.getElementById('job_list-content');

// moegliche Modi und deren Status als Dictionary 
const modeDict = {'01_capture'    : 'erfasst',
                  '02_marking'    : 'bereit zur Vermarkung',
                  '03_done'       : 'Vermarkung erstellt',
                  '04_markingwait': 'VZ / PM'};

// Auftraege in Jobliste einfuegen
function fillJobList(source, modeID) {
  var attributeListJob = []
  var featureList = source.getFeatures()
  // Ermitteln der Features fuer gewaehlten Modus
  featureList.forEach(function (feature) {
    // Pruefen ob Auftragnummer mit dem eingegebenen Filterwert startet
    if (feature.get('auftr_nummer').toString().startsWith(variableData.jobFilter)) {
      // Filtern nach Auftraegen mit entschprechender Status-Zugehoerigkeit (ausser bim Modus VZ/PM)
      if (feature.get('auftr_status') == modeDict[modeID] 
          && modeID != '04_markingwait') {
        attributeListJob.push(collectJobVaues(feature))
      }
      // Bei VZ / PM (entsprechender Status und Typ)
      else if (modeID == '04_markingwait' 
              && feature.get('auftr_status') == 'erfasst' 
              && (
                feature.get('auftr_typ') == 'Vermarkung zurückgestellt' 
                || feature.get('auftr_typ') == 'Abschluss Projektmutation'
              )) {
        // Vermarkung zurueckgestellt -> nur wenn Checkbox aktiviert
        if (feature.get('auftr_typ') == 'Vermarkung zurückgestellt' 
            && document.querySelector('#ckbox_04_VZ').checked) {
          attributeListJob.push(collectJobVaues(feature));
        }
        // Projektmutation -> nur wenn Checkbox aktiviert
        else if (feature.get('auftr_typ') == 'Abschluss Projektmutation' 
                && document.querySelector('#ckbox_04_PM').checked) {
          attributeListJob.push(collectJobVaues(feature));
        };
      };
    };
  });
  if (attributeListJob.length > 0){
    // Sortieren und darstellen fuer den Modus "Erfassung"
    if (modeID == '01_capture') {
      // Sortieren der Liste nach den Tagen seit Erfassung
      /* Quelle: Det. & PSR. (07.10.2022). How to sort 2 dimensional array by column value?.
        stack overflow. URL: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
        [Abgerufen: 07.04.2023] */
      attributeListJob.sort((a, b) => a[4] - b[4]);
      jobListcontent.innerHTML = box_job_cre(attributeListJob);
    }
    // Sortieren und darstellen fuer den Modus "Vermarkung"
    else if (modeID == '02_marking') {
      // Sortieren der Liste nach den Tagen bis zur Faelligkeit
      /* Quelle: Det. & PSR. (07.10.2022). How to sort 2 dimensional array by column value?.
        stack overflow. URL: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
        [Abgerufen: 07.04.2023] */
      attributeListJob.sort((a, b) => a[6] - b [6]);
      jobListcontent.innerHTML = box_job_mrk(attributeListJob);
    }
    // Sortieren und darstellen fuer den Modus "Erledigt"
    else if (modeID == '03_done') {
      // Sortieren der Liste nach der Auftragsnummer
      /* Quelle: Det. & PSR. (07.10.2022). How to sort 2 dimensional array by column value?.
        stack overflow. URL: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
        [Abgerufen: 07.04.2023] */
      attributeListJob.sort((a, b) => a[12] - b [12]);
      jobListcontent.innerHTML = box_job_dne(attributeListJob);
    }
    // Sortieren und darstellen fuer den Modus "Vermarkung zurueckgestellt"
    else if (modeID == '04_markingwait') {
      // Sortieren der Liste nach den Tagen seit Erfassung
      /* Quelle: Det. & PSR. (07.10.2022). How to sort 2 dimensional array by column value?.
        stack overflow. URL: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
        [Abgerufen: 07.04.2023] */
      attributeListJob.sort((a, b) => a[4] - b [4]);
      // Umkehren der Liste (aeltestes Objekt an erster Stelle)
      attributeListJob.reverse()
      jobListcontent.innerHTML = box_job_cre_vzpm(attributeListJob);
    };
  }
  // wenn keine entsprechende Selektion => leere Auftragsliste
  else {
    jobListcontent.innerHTML = '';
  };
  // Beim "Klick" auf einen Zoom-Button -> Uebermittlung Umrandung (Button-Value)
  /* Quelle: Tan. Tguyen. (15.04.2023). Get value of the clicked button. stack overflow.
    URL: https://stackoverflow.com/questions/32842967/get-value-of-the-clicked-button
    [Abgerufen: 07.04.2023] */
  document.querySelectorAll('.singlejob_button').forEach(button => {
    button.addEventListener('click', () => {
        const fired_button = button.value;
        // Umwandeln von einem String in ein Array
        /* Quelle: Raghav. Chaubey. (10.07.2013). Convert string with commas to array. stack overflow.
          URL: https://stackoverflow.com/questions/13272406/convert-string-with-commas-to-array
          [Abgerufen: 07.04.2023] */
        var fired_button_list = JSON.parse("[" + fired_button + "]"); 
        map.getView().fit(fired_button_list, map.getSize());
    });
  });
  // beim "Klick" auf ein Kontrollkaestchen
  // -> hinzufuegen / entfernen des Auftrages zur Materialberechnung
  document.querySelectorAll('.singlejob_checkbox').forEach(button => {
    button.addEventListener('click', () => {
      // wenn Checkbox aktiviert 
      // -> entfernen des Auftrages aus der Liste mit den gewaehlten Auftraegen
      if (variableData.reportList.includes(button.value)) {
        variableData.reportList = variableData.reportList.filter(function (jobid) {
        return jobid != button.value;
        });
        button.innerHTML = '<img class="singlejob_icon" src="./img/square-regular.svg" alt="uncheck"></img>';
      }
      // wenn Checkbox deaktiviert
      // -> hinzufuegen des Auftrages zu der Liste mit den gewaehlten Auftraegen
      else {
        variableData.reportList.push(button.value);
        button.innerHTML = '<img class="singlejob_icon_green" src="./img/square-check-regular_g.svg" alt="check"></img>';
      };
    });
  });
  // beim "Klick" auf den Standort-Button
  // -> Google Maps oeffnen fuer Routenplanung
  document.querySelectorAll('.singlejob_maps').forEach(button => {
    button.addEventListener('click', () => {
      const fired_button = button.value;
      var jobCenterLV95 = getCenter(fired_button.split(',').map(Number));
      var jobCenterWGS84 = LV95ToWGS84(jobCenterLV95);
      window.open('https://www.google.com.sa/maps/search/' + jobCenterWGS84[1] + ',' + jobCenterWGS84[0]);
    });
  });
};

// Umrechnen der LV95-Koordinaten zu WGS84 -> fuer Uebergabe an Google Maps
/* Quelle: idris-maps. (2000). swiss-projection. npm.
 URL: https://www.npmjs.com/package/swiss-projection?activeTab=code
 [Abgerufen: 06.07.2023] */
/* Quelle: swisstopo. (12.2016). Approximate formulas for the transformation 
 between Swiss projection coordinates and WGS84
 URL: https://www.swisstopo.admin.ch/content/swisstopo-internet/en/topics/survey/reference-systems/switzerland/_jcr_content/contentPar/tabs/items/dokumente_publikatio/tabPar/downloadlist/downloadItems/516_1459343097192.download/ch1903wgs84_e.pdf
 [Abgerufen: 06.07.2023] */
function LV95ToWGS84 ([e_coord, n_coord]) {
// Die Projektionskoordinaten E (easting) und N (northing) in LV95 in das 
// zivile System (Bern = 0 / 0) umrechnen und in der Einheit [1000 km] ausdrücken
var getY2FromE = (e_coord - 2600000) / 1000000;
var getX2FromN = (n_coord - 1200000) / 1000000;
// Berechnung von Laengengrad λ und Breitengrad φ in der Einheit [10000"]
var getLambda = function (y2, x2) {
  return 2.6779094
      + 4.728982 * y2
      + 0.791484 * y2 * x2
      + 0.1306 * y2 * Math.pow(x2, 2)
      - 0.0436 * Math.pow(y2, 3);
};
var getPhi = function (y2, x2) {
    return 16.9023892
        + 3.238272 * x2
        - 0.270978 * Math.pow(y2, 2)
        - 0.002528 * Math.pow(x2, 2)
        - 0.0447 * Math.pow(y2, 2) * x2
        - 0.0140 * Math.pow(x2, 3);
};
// Längen- und Breitengrad in die Einheit [°] umrechnen
var toDegrees = function (n) { return n * 100 / 36; };
var round = function (n) { return Math.round(n * 1000000) / 1000000; };
return [
  round(toDegrees(getLambda(getY2FromE, getX2FromN))),
  round(toDegrees(getPhi(getY2FromE, getX2FromN))),
];
};

// Funktionen mit einem Klick aufrufen (Auftragssuche / Materialreport / Auftraege loeschen)
// -------------------------------------------------------------------------------------------------
document.addEventListener('click', function(event) {
// Auftragssuche
  if (event.target.id === 'butsearchJobNum') {
    // Gesuchte Auftragsnummer
    var jobNum = document.getElementById('searchJobNum').value;
        // Wenn keine Auftragsnummer eingegeben -> Eingabefeld aufleuchten
    if (jobNum == '') {
      cellFlasher('searchJobNum', 'white', []);
    }
    // Wenn eine Auftragsnummer vergeben ist -> Suchen der passenden Auftraege
    else {
      var totJobExtent = []; // Extent aller passenden Auftraege
      var featureJobList = intData.vect_Jobs.getSource().getFeatures();
      var attributeListJob = []; // Liste zur Sammlung aller gedundenen Auftraege
      // Kontrolle jedes Auftrages auf passende Auftragsnummer
      for (let i = 0; i < featureJobList.length; i++) {
        var possibleSearchResult = false;
        // bei Suche in Modus Uebersicht
        if (variableData.sel_mode == '00_overview') {
          // pruefen ob Nummer mit Vorgabe beginnt
          if (featureJobList[i].get('auftr_nummer').toString().startsWith(jobNum)) {
            // Nur wenn 'erfasste Auftraege (VZ)' aktiviert
            if (featureJobList[i].get('auftr_status') == 'erfasst' 
                && featureJobList[i].get('auftr_typ') == 'Vermarkung zurückgestellt' 
                && document.querySelector('#ckbox_01_crevz').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            } 
            // Nur wenn 'erfasste Auftraege (PM)' aktiviert
            else if (featureJobList[i].get('auftr_status') == 'erfasst' 
                     && featureJobList[i].get('auftr_typ') == 'Abschluss Projektmutation' 
                     && document.querySelector('#ckbox_01_crepm').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            } 
            // Nur wenn 'erfasste Auftraege' aktiviert
            else if (featureJobList[i].get('auftr_status') == 'erfasst'
                     && featureJobList[i].get('auftr_typ') != 'Abschluss Projektmutation' 
                     && featureJobList[i].get('auftr_typ') != 'Vermarkung zurückgestellt' 
                     && document.querySelector('#ckbox_01_cre').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            } 
            // Nur wenn 'bereit zur Vermarkung' aktiviert
            else if (featureJobList[i].get('auftr_status') == 'bereit zur Vermarkung' 
                     && document.querySelector('#ckbox_01_rdy').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            } 
            // Nur wenn 'Vermarkung erstellt' aktiviert
            else if (featureJobList[i].get('auftr_status') == 'Vermarkung erstellt'  
                     && document.querySelector('#ckbox_01_mk').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            }
            // Nur wenn 'Auftrag archiviert' aktiviert
            else if (featureJobList[i].get('auftr_status') == 'archiviert'  
                     && document.querySelector('#ckbox_01_arc').checked) {
              attributeListJob.push(collectJobVaues(featureJobList[i]));
            };
          };
        };
        // bei Suche in Modus Archiv - nur Suche nach archivierten Auftraegen
        if (variableData.sel_mode == '05_archive' 
            && featureJobList[i].get('auftr_status') == 'archiviert' 
            && featureJobList[i].get('auftr_nummer') == jobNum) {
          possibleSearchResult = true;
        };
        //else if (variableData.sel_mode != '05_archive' && featureJobList[i].get('auftr_nummer') == jobNum) {
        //  possibleSearchResult = true;
        //};
        if (possibleSearchResult) {
          var jobExtent = featureJobList[i].getGeometry().getExtent();
          // Erster passender Auftrag wird zum Extent aller passenden Auftraege
          if (totJobExtent.length == 0) {
            totJobExtent = jobExtent;
          }
          // Wenn mehrere Auftraege die gleiche Nummer haben -> Zoom auf gemeinsamen Extent
          else {
            // Vergleichen der E-Werte (Auftrags-Extent und Extent aller passenden Auftraege)
            // Uebernahme des kleineren Wertes
            if (jobExtent[0] < totJobExtent[0]) {
              totJobExtent[0] = jobExtent[0];
            };
            // Vergleichen der N-Werte (Auftrags-Extent und Extent aller passenden Auftraege)
            // Uebernahme des kleineren Wertes
            if (jobExtent[1] < totJobExtent[1]) {
              totJobExtent[1] = jobExtent[1]
            };
            // Vergleichen der E-Werte (Auftrags-Extent und Extent aller passenden Auftraege)
            // Uebernahme des groesseren Wertes
            if (jobExtent[2] > totJobExtent[2]) {
              totJobExtent[2] = jobExtent[2]
            };
            // Vergleichen der N-Werte (Auftrags-Extent und Extent aller passenden Auftraege)
            // Uebernahme des groesseren Wertes
            if (jobExtent[3] > totJobExtent[3]) {
              totJobExtent[3] = jobExtent[3]
            };
          };
        };
      };
      // nur im Uebersichtsmodus
      if (variableData.sel_mode == '00_overview') {
        // Wenn Auftraege gefunden wurden
        if (attributeListJob.length > 0) {
          jobListcontent.innerHTML = box_job_ov(attributeListJob);
          // Beim "Klick" auf einen Zoom-Button -> Uebermittlung Umrandung (Button-Value)
          /* Quelle: Tan. Tguyen. (15.04.2023). Get value of the clicked button. stack overflow.
          URL: https://stackoverflow.com/questions/32842967/get-value-of-the-clicked-button
          [Abgerufen: 07.04.2023] */
          document.querySelectorAll('.singlejob_button').forEach(button => {
            button.addEventListener('click', () => {
              const fired_button = button.value;
              // Umwandeln von einem String in ein Array
              /* Quelle: Raghav. Chaubey. (10.07.2013). Convert string with commas to array. stack overflow.
              URL: https://stackoverflow.com/questions/13272406/convert-string-with-commas-to-array
              [Abgerufen: 07.04.2023] */
              var fired_button_list = JSON.parse("[" + fired_button + "]"); 
              map.getView().fit(fired_button_list, map.getSize());
            });
          });
        }
        else {
          jobListcontent.innerHTML = '';
          cellFlasher('searchJobNum', 'white', []);
        };
      };
      // nur im Archivmodus 
      if (variableData.sel_mode == '05_archive') {
        // Wenn ein oder mehrere Auftraege mit der Nummer bestehen -> Zoom auf den Extent
        if (totJobExtent.length == 4) {
          map.getView().fit(totJobExtent, map.getSize()); 
        }
        // Wenn kein Auftrag gefunden werden kann 
        else {
          jobListcontent.innerHTML = '';
          cellFlasher('searchJobNum', 'white', []);
        };
      };
    };
  }
  // Materialreport
  else if (event.target.id === 'butcreateJobRpt') {
    if (variableData.reportList.length > 0) {
      // Anzahl pro Vermarkungsart in Variable speichern
      var num_stein = 0;
      var num_kunststoffzeichen = 0;
      var num_bolzen = 0;
      var num_rohr = 0;
      var num_pfahl = 0;
      var num_kreuz = 0;
      var num_unversichert = 0;
      var pointList = intData.vect_Points.getSource().getFeatures() 
      // fuer jeden Punkt pruefen ob innerhalb der gewaehlten Auftraege
      for (let i = 0; i < pointList.length; i++) {
        if (variableData.reportList.includes(pointList[i].get('pkt_fk_auftr').toString())) {
          var pointTyp = pointList[i].get('pkt_typ');
          var pointMark = pointList[i].get('pkt_versicherung');
          var pointCreate = pointList[i].get('pkt_vermarkung');
          // Punkt nur beruecksichtigen, wenn noch nicht vermarkt und nicht Entfernung
          if (pointCreate == null && pointTyp != 'Entfernung') {
            if (pointMark == 'Stein') {
              num_stein += 1;
            }
            else if (pointMark == 'Kunststoffzeichen') {
              num_kunststoffzeichen += 1;
            }
            else if (pointMark == 'Bolzen') {
              num_bolzen += 1;
            }
            else if (pointMark == 'Rohr') {
              num_rohr += 1;
            }
            else if (pointMark == 'Pfahl') {
              num_pfahl += 1;
            }
            else if (pointMark == 'Kreuz') {
              num_kreuz += 1;
            }
            else if (pointMark == 'unversichert') {
              num_unversichert += 1;
            };
          };
        };
      };
      // Inhalt der Ueberlagerung mit der Materialzusammenstellung
      var overlayHTML = '<p>Für die gewählten Aufträge sind die folgenden Grenzzeichen vorgesehen:</p>' +
                        '<table>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_stein + ' x </th>' +
                            '<th class="overlay_table_rrow">Stein</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_kunststoffzeichen + ' x </th>' +
                            '<th class="overlay_table_rrow">Kunststoffzeichen</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_bolzen + ' x </th>' +
                            '<th class="overlay_table_rrow">Bolzen</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_rohr + ' x </th>' +
                            '<th class="overlay_table_rrow">Rohr</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_pfahl + ' x </th>' +
                            '<th class="overlay_table_rrow">Pfahl</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_kreuz + ' x </th>' +
                            '<th class="overlay_table_rrow">Kreuz</th>' +
                          '</tr>' +
                          '<tr>' +
                            '<th class="overlay_table_lrow">' + num_unversichert + ' x </th>' +
                            '<th class="overlay_table_rrow">unversichert</th>' +
                          '</tr>' +
                        '</table>'
      document.getElementById('overlay').style.display ='block';
      document.getElementById('overlay_text').innerHTML = overlayHTML
    };
  }
  // Auftraege und Punkte, Kontrollmasse aelter als ein Jahr loeschen
  else if (event.target.id === 'butdeleteJobs') {
    // aktuelles Datum
    var currentDate = new Date();
    intData.vect_Jobs.getSource().getFeatures().forEach(function (job) {
      // Abschlussdatum des Auftrages
      var recordingDate = new Date(job.get('auftr_abschluss'));
      var daysSinceRecording = Math.round((currentDate - recordingDate) / 1000 / 60 / 60 /24)
      // loeschen wenn Status = archiviert und Abschlussdatum vor min. einem Jahr
      if (job.get('auftr_status') == 'archiviert' && daysSinceRecording > 365) {
        intData.vect_Points.getSource().getFeatures().forEach(function (point) {
          if (point.get('pkt_fk_auftr') == job.get('auftr_pk_id')) {
            intData.vect_Checks.getSource().getFeatures().forEach(function (check) {
              if (check.get('ktr_fk_pkt') == point.get('pkt_pk_id')) {
                updateChkDB('delete', 'butdeleteJobs', [], check, intData.vect_Checks);
              };
            });
            updatePntDB('delete', 'butdeleteJobs', [], point, intData.vect_Points);
          };
        });
        updateJobDB('delete', 'butdeleteJobs', [], job, intData.vect_Jobs);
      };
    });
  };
}); 

// Schliessen des Overlays mit der Materialzusammenstellung
document.getElementById('overlay_close').onclick = function() {
document.getElementById('overlay').style.display ='none';
};

// Wenn der Auftragsnummer-Filter veraendert wird:
document.addEventListener('input', function(event) {
if (event.target.id === 'filterJobNum') {
  variableData.jobFilter = event.target.value;
  fillJobList(intData.vect_Jobs.getSource(), variableData.sel_mode);
};
});

// Buttons Auftragssuche / -filterung, Materialreport und Auftraege loeschen
// -------------------------------------------------------------------------------------------------
const jobFilterHTML = '<p style="margin-top: 0; margin-bottom: 1%">' + 
                        'Filtern nach <b>Auftragsnummer</b>:' +
                      '</p>' +
                      '<input type="text" id="filterJobNum"></input>'

// HTML-Elemente fuer die Auftragssuche (Auftragsnummer)
const jobSearchHTML = '<p style="margin-top: 0; margin-bottom: 1%">' + 
                        '<b>Auftragssuche</b> (Nummer):' +
                      '</p>' +
                      '<input type="text" id="searchJobNum"></input>' + 
                      '<button id=butsearchJobNum>Suchen</button>'

// HTML-Elemente fuer die Berechnung des Materials
const jobReportHTML = '<p style="margin-top: 0; margin-bottom: 1%"><b>Materialberechnung</b></p>' +
                      '<p style="margin-top: 0; margin-bottom: 1%">' +
                        'Damit der Auftrag bei der Materialberechnung berücksichtigt wird,' +
                        'muss das Kontrollkästchen gesetzt werden.' + 
                      '</p>' + 
                      '<button id="butcreateJobRpt">Materialberechnung starten</button>'

// HTML-Elemente fuer das Loeschen der Auftraege mit Abschlussdatum ubere ein Jahr
const jobsDeleteHTML =  '<p style="margin-top: 0; margin-bottom: 1%"><b>Aufträge löschen</b></p>' +
                        '<p style="margin-top: 0; margin-bottom: 1%">' + 
                          'Löscht alle Aufträge mit dem Status "archiviert", ' + 
                          'bei welchen die Vermarkung seit über einem Jahr abgeschlossen ist.' + 
                        '</p>' + 
                        '<button id="butdeleteJobs">Aufträge löschen</button>'





// Modus wechseln
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
function switchToMode(select_id, mode_name, subMode = false) {
  // kein Ausfuehren bei "Klick" auf aktuellen Modus
  var old_mode_name = variableData.sel_mode;
  if (variableData.sel_mode != mode_name || subMode == true) {
    variableData.sel_mode = mode_name;
    const modebuttonIDs = [ 'but_00_overview', 
                            'but_01_capture', 
                            'but_02_marking', 
                            'but_03_done', 
                            'but_04_markingwait', 
                            'but_05_archive'
                          ];
    // einfaerben der Buttons als ungewaehlt -> Schriftart / Hintergrundfarbe
    modebuttonIDs.forEach(function(id) {
      document.getElementById(id).style.backgroundColor = colorData.clr_background_2;
      document.getElementById(id).style.fontWeight = 500;
    });
    // gewaelter Modus als solchen erkennbar machen -> Schriftart / Hintergrundfarbe
    document.getElementById(select_id).style.backgroundColor = colorData.clr_background_1;
    document.getElementById(select_id).style.fontWeight = 650;
    // Popup von Anzeige entfernen
    popup.setPosition(undefined);
    // laufende Geometriebearbeitungen abschliessen (ungespeichet)
    endModifyJobPolygon()
    endModifyPntPoint()
    // aktualisieren der Datenquellen -> Symbolisierung / Filterung
    intData.vect_Jobs.getSource().refresh()
    intData.vect_Points.getSource().refresh()
    intData.vect_Checks.getSource().refresh()
    // Auftragsnummerfilter zuruecksetzen
    variableData.jobFilter = '';

    // Modus == Uebersicht
    if (select_id == 'but_00_overview'){
      // Uebersicht-Legende hinzufuegen
      map.addControl(legendContent.legendOverview);
      // entfernen der scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'scroll';
      // leeren der Auftragsliste
      document.getElementById('job_list-content').innerHTML = ''
      // hinzufuegen der Jobsuche
      document.getElementById('job_num_search').innerHTML = jobSearchHTML
      // Umplatzierung der Modusbutton
      document.getElementById('captureElement').style.top = "30.3%";
      document.getElementById('markingElement').style.top = "35.5%";
      document.getElementById('doneElement').style.top = "40.7%";
      document.getElementById('markingwaitElement').style.top = "45.9%";
      document.getElementById('archiveElement').style.top = "51.1%";
      // Checkboxen fuer Layerauswahl hinzufuegen
      map.addControl(checkboxOverviewCRE);
      map.addControl(checkboxOverviewCREVZ);
      map.addControl(checkboxOverviewCREPM);
      map.addControl(checkboxOverviewRDY);
      map.addControl(checkboxOverviewMK);
      map.addControl(checkboxOverviewARC);
      // Legende auf die eingeschaltenen Layer anpassen
      var legendTable = [];
      if (document.querySelector('#ckbox_01_cre').checked) {
        legendTable.push(legendContent.row_job_cre);
      };
      if (document.querySelector('#ckbox_01_crevz').checked) {
        legendTable.push(legendContent.row_job_cre_VZ);
      };
      if (document.querySelector('#ckbox_01_crepm').checked) {
        legendTable.push(legendContent.row_job_cre_PM);
      };
      if (document.querySelector('#ckbox_01_rdy').checked) {
        legendTable.push(legendContent.row_job_rdy);
      };
      if (document.querySelector('#ckbox_01_mk').checked) {
        legendTable.push(legendContent.row_job_fin);
      };
      if (document.querySelector('#ckbox_01_arc').checked) {
        legendTable.push(legendContent.row_job_arc);
      };
      legendTable.push(legendContent.row_pnt_cre);
      legendTable.push(legendContent.row_pnt_dne);
      legendTable.push(legendContent.row_pnt_che);
      document.getElementById('legend_overview').innerHTML = legendContent.createLegendHTML(legendTable)
    }
    // Modus != Uebersicht
    else {
      // Modustitel auf Standard
      document.getElementById('but_00_overview').innerHTML = 'Übersicht';
      // Uebersicht-Legende entfernen
      map.removeControl(legendContent.legendOverview);
      // Umplatzierung der Modusbutton
      document.getElementById('captureElement').style.top = "6.2%";
      document.getElementById('markingElement').style.top = "11.4%";
      document.getElementById('doneElement').style.top = "16.6%";
      document.getElementById('markingwaitElement').style.top = "21.8%";
      document.getElementById('archiveElement').style.top = "27%";
      // Checkboxen fuer Layerauswahl hinzufuegen
      map.removeControl(checkboxOverviewCRE);
      map.removeControl(checkboxOverviewCREVZ);
      map.removeControl(checkboxOverviewCREPM);
      map.removeControl(checkboxOverviewRDY);
      map.removeControl(checkboxOverviewMK);
      map.removeControl(checkboxOverviewARC);
    };

    // Modus == Erfassung
    if (select_id == 'but_01_capture'){
      // Erfassung-Legende hinzufuegen
      map.addControl(legendContent.legendCapture)
      // Auftrag- / Punkterstellung hinzufuegen
      map.addControl(createJob);
      map.addControl(createPnt);
      document.getElementById("but_create_job").innerHTML = "Auftrag erfassen"
      document.getElementById("but_create_pnt").innerHTML = "Punkt erfassen"
      // hinzufuegen scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'scroll';
      // hinzufuegen der Jobfiltertung
      document.getElementById('job_num_search').innerHTML = jobFilterHTML
    } 
    // Modus != Erfassung
    else {
      // Auftrags- / Punkterstellung entfernen
      map.removeControl(createJob);
      map.removeControl(createPnt);
      map.removeInteraction(variableData.drawJob);
      map.removeInteraction(variableData.drawPnt);
      map.removeInteraction(variableData.snapGP);
      map.removeInteraction(variableData.snapHGP);
      map.removeInteraction(variableData.snapFP);
      variableData.state_drawJobPolygon = false;
      variableData.state_drawPntPoint = false;
      // Erfassung-Legende entfernen
      map.removeControl(legendContent.legendCapture);
    };

    // Modus == Vermarkung
    if (select_id == 'but_02_marking'){
      // Vermarkung-Legende hinzufuegen
      map.addControl(legendContent.legendMarking);
      // Kontrollmasserstellung hinzufuegen
      map.addControl(createChk)
      document.getElementById("but_create_chk").innerHTML = "Kontrollmass erfassen";
      // hinzufuegen scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'scroll';
      // hinzufuegen der Jobfiltertung
      document.getElementById('job_num_search').innerHTML = jobFilterHTML;
      // hinzufuegen Materialreport
      document.getElementById('job_rpt_create').classList.add('job_rpt_create');
      document.getElementById('job_rpt_create').innerHTML = jobReportHTML;
      document.getElementById('job_list').style.height = 'calc(83vh - ' + 
        document.getElementById("job_rpt_create").clientHeight + 'px)';
      // Liste fuer Materialreport leeren
      variableData.reportList = []
    }
    // Modus != Vermarkung
    else {
      // Materialreport entfernen
      document.getElementById('job_rpt_create').classList.remove('job_rpt_create')
      document.getElementById('job_rpt_create').innerHTML = ''
      document.getElementById('job_list').style.height = '83vh'
      // Kontrollmasserstellung entfernen
      endDrawChkLine();
      map.removeControl(createChk);
      variableData.state_drawChkLine = false;
      // Vermarkung-Legende entfernen
      map.removeControl(legendContent.legendMarking);
    };

    // Modus == Erledigt
    if (select_id == 'but_03_done'){
      // Erledigt-Legende hinzufuegen
      map.addControl(legendContent.legendDone);
      // hinzufuegen scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'scroll';
      // hinzufuegen der Jobfiltertung
      document.getElementById('job_num_search').innerHTML = jobFilterHTML;
    }
    // Modus != Erledigt
    else {
      // Erledigt-Legende entfernen
      map.removeControl(legendContent.legendDone);
    };
    // Modus == VZ / PM
    if (select_id == 'but_04_markingwait'){
      // VZ / PM - Legende hinzufuegen
      map.addControl(legendContent.legendMarkingWait);
      // hinzufuegen scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'scroll';
      // hinzufuegen der Jobfiltertung
      document.getElementById('job_num_search').innerHTML = jobFilterHTML;
      // umplatzierung des Modusbuttons "05 Archiv"
      document.getElementById('archiveElement').style.top = "35.1%";
      // Checkboxen fuer VZ und PM hinzufuegen
      map.addControl(checkboxMarkingWaitVZ);
      map.addControl(checkboxMarkingWaitPM);
    }
    // Modus != VZ / PM
    else {
      // Checkboxen fuer VZ und PM entfernen
      map.removeControl(checkboxMarkingWaitVZ);
      map.removeControl(checkboxMarkingWaitPM);
      // umplatzierung des Modusbuttons "05 Archiv" (Ursprungsposition)
      if (select_id != 'but_00_overview') {
        document.getElementById('archiveElement').style.top = "27%";
      };
      // VZ / PM - Legende entfernen
      map.removeControl(legendContent.legendMarkingWait);
    };
    // Modus == Archiv
    if (select_id == 'but_05_archive') {
      // Archiv-Legende hinzufuegen
      map.addControl(legendContent.legendArchive);
      // entfernen der scroll-Funktion
      document.getElementById('job_list').style.overflowY = 'hidden';
      // hinzufuegen Auftraege loeschen
      document.getElementById('job_rpt_create').classList.add('job_rpt_create');
      document.getElementById('job_rpt_create').innerHTML = jobsDeleteHTML;
      document.getElementById('job_list').style.height = 'calc(83vh - ' + 
        document.getElementById("job_rpt_create").clientHeight + 'px)';
      // leeren der Auftragsliste
      document.getElementById('job_list-content').innerHTML = ''
      // hinzufuegen der Jobsuche
      document.getElementById('job_num_search').innerHTML = jobSearchHTML;
    }
    // Modus != Archiv
    else {
      // Archiv-Legende entfernen
      map.removeControl(legendContent.legendArchive);
      // Modus != Vermarkung (ansonsten wird Materialreport entfernt)
      if (select_id != 'but_02_marking') {
        // Materialreport / Auftraege loeschen entfernen
        document.getElementById('job_rpt_create').classList.remove('job_rpt_create');
        document.getElementById('job_rpt_create').innerHTML = '';
        document.getElementById('job_list').style.height = '83vh';
      };
    };
    // bei Eingabefeldern (Klasse: skip-char) nur Ganzzahlen
    checkInputInteger();
  };
  // oeffnen und schliessen des Ein- und Ausschalten der Layer im Modus Uebersicht
  if (variableData.sel_mode == '00_overview' && subMode == false) {
    if (variableData.sel_mode != old_mode_name
        || document.getElementsByClassName('overviewCRE')[0].style.top == '-20%') {
      // Modustitel mit geoeffnetem Symbol
      document.getElementById('but_00_overview').innerHTML = '' + 
        '<img class="modus_icon" src="./img/folder-open-solid.svg" alt="open">' +
        '</img>' +
        ' Übersicht';
      // Checkboxen fuer Layerauswahl aus Ansicht schieben
      document.getElementsByClassName('overviewCRE')[0].style.top = '6.4%';
      document.getElementsByClassName('overviewCREVZ')[0].style.top = '10.4%';
      document.getElementsByClassName('overviewCREPM')[0].style.top = '14.4%';
      document.getElementsByClassName('overviewRDY')[0].style.top = '18.4%';
      document.getElementsByClassName('overviewMK')[0].style.top = '22.4%';
      document.getElementsByClassName('overviewARC')[0].style.top = '26.4%';
      // Modusauswahl platzieren (wenn ausgeklappt)
      document.getElementById('captureElement').style.top = "30.3%";
      document.getElementById('markingElement').style.top = "35.5%";
      document.getElementById('doneElement').style.top = "40.7%";
      document.getElementById('markingwaitElement').style.top = "45.9%";
      document.getElementById('archiveElement').style.top = "51.1%";
    }
    else {
      // Modustitel mit geschlossenem Symbol
      document.getElementById('but_00_overview').innerHTML = '' + 
        '<img class="modus_icon" src="./img/folder-closed-solid.svg" alt="closed">' +
        '</img>' +
        ' Übersicht';
      // Checkboxen fuer Layerauswahl positionieren
      document.getElementsByClassName('overviewCRE')[0].style.top = '-20%';
      document.getElementsByClassName('overviewCREVZ')[0].style.top = '-20%';
      document.getElementsByClassName('overviewCREPM')[0].style.top = '-20%';
      document.getElementsByClassName('overviewRDY')[0].style.top = '-20%';
      document.getElementsByClassName('overviewMK')[0].style.top = '-20%';
      document.getElementsByClassName('overviewARC')[0].style.top = '-20%';
      // Modusauswahl platzieren (wenn eingeklappt)
      document.getElementById('captureElement').style.top = "6.2%";
      document.getElementById('markingElement').style.top = "11.4%";
      document.getElementById('doneElement').style.top = "16.6%";
      document.getElementById('markingwaitElement').style.top = "21.8%";
      document.getElementById('archiveElement').style.top = "27%";
    };
  };
};
  




// Hintergrundkarte
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Detail-Hintergrundkarte wechseln
// ------------------------------------------------------------
function switchBackgroundDetail(select_id) {
  const backgroundbuttonIDs = [
    'but_01_background_av_color', 
    'but_02_background_av_gray', 
    'but_03_background_ortho'
  ];
  backgroundbuttonIDs.forEach(
    function(id) {
      // einfaerben der Buttons als ungewaehlt -> Schriftart / Hintergrundfarbe
      document.getElementById(id).style.backgroundColor = colorData.clr_background_2;
      document.getElementById(id).style.fontWeight = 500;
    },
  );
  // gewaelter Modus als solchen erkennbar machen -> Schriftart / Hintergrundfarbe
  document.getElementById(select_id).style.backgroundColor = colorData.clr_background_1;
  document.getElementById(select_id).style.fontWeight = 650;
  // Hintergrundkarten entfernen
  map.removeLayer(extData.grid_AV_color);
  map.removeLayer(extData.grid_AV_gray);
  map.removeLayer(extData.grid_Orthophoto);
  // wenn gewaehlt, Amtliche Vermessung farbig hinzufuegen
  if (select_id == backgroundbuttonIDs[0]){
    map.addLayer(extData.grid_AV_color);
    extData.grid_AV_color.setZIndex(-1);
  };
  // wenn gewaehlt, Amtliche Vermessung grau hinzufuegen
  if (select_id == backgroundbuttonIDs[1]){
    map.addLayer(extData.grid_AV_gray);
    extData.grid_AV_gray.setZIndex(-1);
  };
  // wenn gewaehlt, Orthophoto hinzufuegen
  if (select_id == backgroundbuttonIDs[2]){
    map.addLayer(extData.grid_Orthophoto);
    extData.grid_Orthophoto.setZIndex(-1);
  };
  // gewaehlte Detail-Hintergrundkarte ID in Variable speichern
  variableData.sel_background_detail = select_id;
};

// Uebersicht-Hintergrundkarte wechseln
// ------------------------------------------------------------
function switchBackgroundOverview(select_id) {
  const backgroundbuttonIDs = [
    'but_01_background_ov_color',
    'but_02_background_ov_gray'
  ];
  backgroundbuttonIDs.forEach(
    function(id) {
      // einfaerben der Buttons als ungewaehlt -> Schriftart / Hintergrundfarbe
      document.getElementById(id).style.backgroundColor = colorData.clr_background_2;
      document.getElementById(id).style.fontWeight = 500;
    },
  );
  // gewaelter Modus als solchen erkennbar machen -> Schriftart / Hintergrundfarbe
  document.getElementById(select_id).style.backgroundColor = colorData.clr_background_1;
  document.getElementById(select_id).style.fontWeight = 650;
  // wenn gewaehlt, Pixelkarte farbig hinzufuegen
  if (select_id == backgroundbuttonIDs[0]){
    map.removeLayer(extData.grid_Overview_gray);
    map.addLayer(extData.grid_Overview_color);
    extData.grid_Overview_color.setZIndex(-1);
  };
  // wenn gewaehlt, Pixelkarte grau hinzufuegen
  if (select_id == backgroundbuttonIDs[1]){
    map.removeLayer(extData.grid_Overview_color);
    map.addLayer(extData.grid_Overview_gray);
    extData.grid_Overview_gray.setZIndex(-1);
  };
  // gewaehlte Uebersicht-Hintergrundkarte ID in Variable speichern
  variableData.sel_background_overview = select_id;
};





// Steuerungselemente Kartenansicht
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Moduswahl
// -------------------------------------------------------------------------------------------------

// Uebersicht
// ------------------------------------------------------------
class buttonOverview extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_00_overview';
    button.innerHTML =  '<img class="modus_icon" src="./img/folder-open-solid.svg" alt="open">' +
                        '</img>' +
                        ' Übersicht';
    const element = document.createElement('div');
    element.className = 'overview modebutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToOverview.bind(this), false);
  };
  switchToOverview() {
    switchToMode('but_00_overview', '00_overview');
  };
};

// CheckBox - erfasste Auftraege
class ckboxOV_cre extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_cre';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'erfasste Aufträge';
    const element = document.createElement('div');
    element.className = 'overviewCRE modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVcre.bind(this), false);
  };
  switchVisibilityOVcre() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewCRE = new ckboxOV_cre;

// CheckBox - erfasste Auftraege (Vermarkung zurueckgestellt)
class ckboxOV_crevz extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_crevz';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'erfasste Aufträge (VZ)';
    const element = document.createElement('div');
    element.className = 'overviewCREVZ modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVcreVZ.bind(this), false);
  };
  switchVisibilityOVcreVZ() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewCREVZ = new ckboxOV_crevz;

// CheckBox - erfasste Auftraege (Abschluss Projektmutation)
class ckboxOV_crepm extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_crepm';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'erfasste Aufträge (PM)';
    const element = document.createElement('div');
    element.className = 'overviewCREPM modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVcrePM.bind(this), false);
  };
  switchVisibilityOVcrePM() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewCREPM = new ckboxOV_crepm;

// CheckBox - Auftraege bereit zur Vermarkung
class ckboxOV_rdy extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_rdy';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'bereit zur Vermarkung';
    const element = document.createElement('div');
    element.className = 'overviewRDY modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVrdy.bind(this), false);
  };
  switchVisibilityOVrdy() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewRDY = new ckboxOV_rdy;

// CheckBox - Auftraege Vermarkung erstellt
class ckboxOV_mk extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_mk';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'Vermarkung erstellt';
    const element = document.createElement('div');
    element.className = 'overviewMK modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVmk.bind(this), false);
  };
  switchVisibilityOVmk() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewMK = new ckboxOV_mk;

// CheckBox - Auftraege archiviert
class ckboxOV_arc extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_01_arc';
    checkbox.checked = false;
    const label = document.createElement('label');
    label.innerHTML = 'archivierte Aufträge';
    const element = document.createElement('div');
    element.className = 'overviewARC modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityOVarc.bind(this), false);
  };
  switchVisibilityOVarc() {
    switchToMode('but_00_overview', '00_overview', true);
  };
};
var checkboxOverviewARC = new ckboxOV_arc;

// Erfassung
// ------------------------------------------------------------
class buttonCapture extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_01_capture';
    button.innerHTML = 'Erfassung';
    const element = document.createElement('div');
    element.className = 'capture modebutton ol-unselectable ol-control';
    element.id = 'captureElement';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToCapture.bind(this), false);
  };
  switchToCapture() {
    switchToMode('but_01_capture', '01_capture');
  };
};

// Vermarkung
// ------------------------------------------------------------
class buttonMarking extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_02_marking';
    button.innerHTML = 'Vermarkung';
    const element = document.createElement('div');
    element.className = 'marking modebutton ol-unselectable ol-control';
    element.id = 'markingElement';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToMarking.bind(this), false);
  };
  switchToMarking() {
    switchToMode('but_02_marking', '02_marking');
  };
};

// Erledigt
// ------------------------------------------------------------
class buttonDone extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_03_done';
    button.innerHTML = 'Erledigt';
    const element = document.createElement('div');
    element.className = 'done modebutton ol-unselectable ol-control';
    element.id = 'doneElement';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToDone.bind(this), false);
  };
  switchToDone() {
    switchToMode('but_03_done', '03_done');
  };
};

// Vermarkung zurueckgestellt / Abschluss Projektmutation
// ------------------------------------------------------------
class buttonMarkingWait extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_04_markingwait';
    button.innerHTML = 'VZ / PM';
    const element = document.createElement('div');
    element.className = 'markingwait modebutton ol-unselectable ol-control';
    element.id = 'markingwaitElement';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToMarkingWait.bind(this), false);
  };
  switchToMarkingWait() {
    switchToMode('but_04_markingwait', '04_markingwait');
  };
};

// CheckBox - Vermarkung zurueckgestellt
class ckboxVZ extends Control {
  constructor() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_04_VZ';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'Vermarkung zurückgestellt';
    const element = document.createElement('div');
    element.className = 'markingwaitVZ modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityVZ.bind(this), false);
  };
  switchVisibilityVZ() {
    switchToMode('but_04_markingwait', '04_markingwait', true);
  };
};
var checkboxMarkingWaitVZ = new ckboxVZ;

// Checkbox - Abschluss Projektmutation
class ckboxPM extends Control{
  constructor(){
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.id = 'ckbox_04_PM';
    checkbox.checked = true;
    const label = document.createElement('label');
    label.innerHTML = 'Projektmutation';
    const element = document.createElement('div');
    element.className = 'markingwaitPM modeckbox ol-unselectable ol-control';
    element.appendChild(checkbox);
    element.appendChild(label);
    super({
      element: element,
    });
    checkbox.addEventListener('click', this.switchVisibilityPM.bind(this), false);
  };
  switchVisibilityPM() {
    switchToMode('but_04_markingwait', '04_markingwait', true);
  };
};
var checkboxMarkingWaitPM = new ckboxPM;

// Archiv
// ------------------------------------------------------------
class buttonArchive extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_05_archive';
    button.innerHTML = 'Archiv';
    const element = document.createElement('div');
    element.className = 'archive modebutton ol-unselectable ol-control';
    element.id = 'archiveElement';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToArchive.bind(this), false);
  };
  switchToArchive() {
    switchToMode('but_05_archive', '05_archive');
  };
};

// Objekte erstellen
// -------------------------------------------------------------------------------------------------

// Auftrag erstellen
// ------------------------------------------------------------
class buttonCreateJob extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_create_job';
    button.innerHTML = 'Auftrag erfassen';
    const element = document.createElement('div');
    element.className = 'job_but createbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToCreateJob.bind(this), false);
  };
  switchToCreateJob() {
    intData.vect_Points.getSource().refresh();
    popup.setPosition(undefined);
    // aktivieren der Zeichnungsfunktion wenn Status auf false
    if (variableData.state_drawJobPolygon == false) {
      variableData.state_drawJobPolygon = true;
      document.getElementById("but_create_job").innerHTML = "Auftragerfassung beenden";
      // Punkterfassung beenden
      endDrawPntPoint();
      variableData.state_drawPntPoint = false;
      // Funktionen zum zeichnen und fangen hinzufuegen
      map.addInteraction(variableData.drawJob);
      map.addInteraction(variableData.snapGP);
      map.addInteraction(variableData.snapHGP);
      map.addInteraction(variableData.snapFP);
    }
    // aktivieren der Zeichnungsfunktion wenn Status auf true, 
    // -> aber Anzeigetext Button = "Auftrag erfassen"
    else if (variableData.state_drawJobPolygon == true 
             && document.getElementById("but_create_job").innerText == 'Auftrag erfassen') {
      intData.vect_Jobs.getSource().refresh();
      popup.setPosition(undefined);
      document.getElementById("but_create_job").innerHTML = "Auftragerfassung beenden";
      // Punkterfassung beenden
      endDrawPntPoint();
      variableData.state_drawPntPoint = false;
      // Funktionen zum zeichnen und fangen hinzufuegen
      map.addInteraction(variableData.drawJob);
      map.addInteraction(variableData.snapGP);
      map.addInteraction(variableData.snapHGP);
      map.addInteraction(variableData.snapFP);
    }
    // deaktivieren der Zeichnungsfunktion
    else{
      endDrawJobPolygon();
      variableData.state_drawJobPolygon = false;
    };
  };
};
var createJob = new buttonCreateJob();

// Punkt erstellen
// ------------------------------------------------------------
class buttonCreatePoint extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_create_pnt';
    button.innerHTML = 'Punkt erfassen';
    const element = document.createElement('div');
    element.className = 'pnt_but createbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToCreatePnt.bind(this), false);
  };
  switchToCreatePnt() {
    intData.vect_Jobs.getSource().refresh();
    popup.setPosition(undefined);
    // aktivieren der Zeichnungsfunktion wenn Status auf false
    if (variableData.state_drawPntPoint == false) {
      variableData.state_drawPntPoint = true;
      document.getElementById("but_create_pnt").innerHTML = "Punkterfassung beenden";
      // Auftragserfassung beenden
      endDrawJobPolygon();
      // Funktionen zum zeichnen und fangen hinzufuegen
      variableData.state_drawJobPolygon = false;
      map.addInteraction(variableData.drawPnt);
      map.addInteraction(variableData.snapGP);
      map.addInteraction(variableData.snapHGP);
      map.addInteraction(variableData.snapFP);
    }
    // aktivieren der Zeichnungsfunktion wenn Status auf true, 
    // -> aber Anzeigetext Button = "Punkt erfassen"
    else if (variableData.state_drawPntPoint == true
             && document.getElementById("but_create_pnt").innerText == 'Punkt erfassen') {
      intData.vect_Points.getSource().refresh();
      popup.setPosition(undefined);
      document.getElementById("but_create_pnt").innerHTML = "Punkterfassung beenden"
      // Auftragserfassung beenden
      endDrawJobPolygon();
      variableData.state_drawJobPolygon = false;
      // Funktionen zum zeichnen und fangen hinzufuegen
      map.addInteraction(variableData.drawPnt);
      map.addInteraction(variableData.snapGP);
      map.addInteraction(variableData.snapHGP);
      map.addInteraction(variableData.snapFP);
    }
    // deaktivieren der Zeichnungsfunktion
    else{
      endDrawPntPoint();
      variableData.state_drawPntPoint = false;
    };
  };
};
var createPnt = new buttonCreatePoint;

// Kontrollmass erstellen
// ------------------------------------------------------------
class buttonCreateCheck extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_create_chk';
    button.innerHTML = 'Kontrollmass erfassen';
    const element = document.createElement('div');
    element.className = 'chk_but createbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToCreateCheck.bind(this), false);
  };
  switchToCreateCheck() {
    intData.vect_Points.getSource().refresh();
    popup.setPosition(undefined);
    // aktivieren der Zeichnungsfunktion wenn Status auf false
    if (variableData.state_drawChkLine == false) {
      variableData.state_drawChkLine = true;
      document.getElementById("but_create_chk").innerHTML = "Kontrollmasserfassung beenden";
      // Funktionen zum zeichnen und fangen hinzufuegen
      map.addInteraction(variableData.drawChk);
      map.addInteraction(variableData.snapChk);
    }
    // aktivieren der Zeichnungsfunktion wenn Status auf true,
    // -> aber Anzeigetext Button = "Kontrollmass erfassen"
    else if (variableData.state_drawChkLine == true 
             && document.getElementById("but_create_chk").innerText == "Kontrollmass erfassen") {
      intData.vect_Checks.getSource().refresh();
      popup.setPosition(undefined);
      document.getElementById("but_create_chk").innerHTML = "Kontrollmasserfassung beenden";
      // Funktionen zum zeichnen und fangen hinzufuegen
      map.addInteraction(variableData.drawChk);
      map.addInteraction(variableData.snapChk);
    }
    // Kontrollmasserfassung beenden
    else {
      endDrawChkLine()
      document.getElementById("but_create_chk").innerHTML = "Kontrollmass erfassen";
      variableData.state_drawChkLine = false
    };
  };
};
var createChk = new buttonCreateCheck;

// Objekte modifizieren
// -------------------------------------------------------------------------------------------------

// Auftragsgeometrie-Modifikation abschliessen
// ------------------------------------------------------------
class buttonSaveModifyJob extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_modify_job';
    button.innerHTML = 'Geometrie speichern';
    const element = document.createElement('div');
    element.className = 'mod_but modifybutton modifybutton_hover ol-unselectable ol-control';
    element.id = 'but_modify_job_box';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToSave.bind(this), false);
  };
  switchToSave() {
    // Kontrolle, ob alle Punkte innerhalb der Auftragsgeometrie liegen
    var pointsInJob = true;
    var pointList = intData.vect_Points.getSource().getFeatures()
    // Iteration durch Punktlayer
    // -> geometrische Pruefung (Koordinatenverschitt Vermarkungspunkt mit Auftragsflaeche)
    for (let i = 0; i < pointList.length; i++) {
      if (pointList[i].get('pkt_fk_auftr') == variableData.featureToModify.get('auftr_pk_id')) {
        var pointCoordinates = pointList[i].getGeometry().getCoordinates();
        var jobPolygon = variableData.featureToModify.getGeometry();
        if (jobPolygon.intersectsCoordinate(pointCoordinates) == false) {
          pointsInJob = false;
        };
      };
    };
    // Geometrie nur speichern, wenn alle Punkt innerhalb Auftragsgeometrie
    if (pointsInJob == true) {
      // Geometrie updaten (WFS Transaktion)
      updateJobDB('update', 'but_modify_job', [], variableData.featureToModify, intData.vect_Jobs)
      // Bearbeitung beenden und Rueckkehr in "normalen" Modus
      endModifyJobPolygon();
      intData.vect_Jobs.getSource().refresh();
      intData.vect_Points.getSource().refresh();
    }
    // wenn Punkte ausserhalb Auftragsgeometrie liegen -> kein speichern (Fehlermeldung)
    else {
      cellFlasher(
        'but_modify_job', 
        colorData.clr_background_2, 
        ['but_modify_job_box', 'modifybutton_hover']
      );
    };
  };
};
var saveModifyJob = new buttonSaveModifyJob;

// Punktgeometrie-Modifikation abschliessen
// ------------------------------------------------------------
class buttonSaveModifyPnt extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_modify_pnt';
    button.innerHTML = 'Punkt speichern';
    const element = document.createElement('div');
    element.className = 'mod_but modifybutton modifybutton_hover ol-unselectable ol-control';
    element.id = 'but_modify_pnt_box'
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToSave.bind(this), false);
  };
  switchToSave() {
    // Kontrolle, ob alle Punkte innerhalb der Auftragsgeometrie liegen
    var pointsInJob = true;
    var pointList = intData.vect_Points.getSource().getFeatures()
    // Iteration durch Punktlayer
    // -> geometrische Pruefung (Koordinatenverschitt Vermarkungspunkt mit Auftragsflaeche)
    for (let i = 0; i < pointList.length; i++) {
      if (pointList[i].get('pkt_fk_auftr') == variableData.featureToModify.get('pkt_fk_auftr')) {
        var pointCoordinates = pointList[i].getGeometry().getCoordinates();
        var jobPolygon = intData.vect_Jobs.getSource().getFeatureById('vermarkung_auftraege.' + variableData.featureToModify.get('pkt_fk_auftr')).getGeometry()
        if (jobPolygon.intersectsCoordinate(pointCoordinates) == false) {
          pointsInJob = false;
        };
      };
    };
    // Punktgeometrien nur speichern, wenn alle Punkt innerhalb Auftragsgeometrie
    if (pointsInJob == true) {
      // pro Punkt Geometrie updaten (WFS Transaktion)
      for (let i = 0; i < pointList.length; i++) {
        if (pointList[i].get('pkt_fk_auftr') == variableData.featureToModify.get('pkt_fk_auftr')) {
          updatePntDB('update', 'but_modify_pnt', [], pointList[i], intData.vect_Points);
        };
      };
      // Bearbeitung beenden und Rueckkehr in "normalen" Modus
      endModifyPntPoint();
      intData.vect_Jobs.getSource().refresh();
      intData.vect_Points.getSource().refresh();
    }
    // wenn Punkte ausserhalb Auftragsgeometrie liegen -> kein speichern (Fehlermeldung)
    else {
      cellFlasher(
        'but_modify_pnt',
        colorData.clr_background_2,
        ['but_modify_pnt_box', 'modifybutton_hover']
      );
    };
  };
};
var saveModifyPnt = new buttonSaveModifyPnt;

// Hintergrundkarte waehlen
// -------------------------------------------------------------------------------------------------

// Amtliche Vermessung farbig (Detailansicht)
// ------------------------------------------------------------
class buttonBackgroundAVColor extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_01_background_av_color';
    button.innerHTML = '<img class="background_icon" src="./img/map-solid-color.svg" alt="zoom">' +
                       '</img>';
    const element = document.createElement('div');
    element.className = 'avcolor backgroundbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToBackgroundAVColor.bind(this), false);
  };
  switchToBackgroundAVColor() {
    // Hintergrund nur wechseln, wenn nicht bereits gewaehlt
    if (variableData.sel_background_detail != 'but_01_background_av_color') {
      switchBackgroundDetail('but_01_background_av_color'); 
    };
  };
};
var backgroundAVColor = new buttonBackgroundAVColor();

// Amtliche Vermessung grau (Detailansicht)
// ------------------------------------------------------------
class buttonBackgroundAVGray extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_02_background_av_gray';
    button.innerHTML = '<img class="background_icon" src="./img/map-solid.svg" alt="zoom">' + 
                       '</img>';
    const element = document.createElement('div');
    element.className = 'avgray backgroundbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToBackgroundAVGray.bind(this), false);
  };
  switchToBackgroundAVGray() {
    // Hintergrund nur wechseln, wenn nicht bereits gewaehlt
    if (variableData.sel_background_detail != 'but_02_background_av_gray') {
      switchBackgroundDetail('but_02_background_av_gray'); 
    };
  };
};
var backgroundAVGray = new buttonBackgroundAVGray();

// Orthophoto (Detailansicht)
// ------------------------------------------------------------
class buttonBackgroundOrtho extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_03_background_ortho';
    button.innerHTML = '<img class="background_icon" src="./img/camera-solid.svg" alt="zoom">' +
                       '</img>';
    const element = document.createElement('div');
    element.className = 'ortho backgroundbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToBackgroundOrtho.bind(this), false);
  };
  switchToBackgroundOrtho() {
    // Hintergrund nur wechseln, wenn nicht bereits gewaehlt
    if (variableData.sel_background_detail != 'but_03_background_ortho') {
      switchBackgroundDetail('but_03_background_ortho');
    };
  };
};
var backgroundOrtho = new buttonBackgroundOrtho();

// Pixelkarte farbig (Uebersichtsansicht)
// ------------------------------------------------------------
class buttonBackgroundOVcolor extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_01_background_ov_color';
    button.innerHTML = '<img class="background_icon" src="./img/map-solid-color.svg" alt="zoom">' + 
                       '</img>';
    const element = document.createElement('div');
    element.className = 'ovcolor backgroundbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToBackgroundOVcolor.bind(this), false);
  };
  switchToBackgroundOVcolor() {
    // Hintergrund nur wechseln, wenn nicht bereits gewaehlt
    if (variableData.sel_background_overview != 'but_01_background_ov_color') {
      switchBackgroundOverview('but_01_background_ov_color');
    };
  };
};
var backgroundOVcolor = new buttonBackgroundOVcolor();

// Pixelkarte grau (Uebersichtsansicht)
// ------------------------------------------------------------
class buttonBackgroundOVgray extends Control {
  constructor() {
    const button = document.createElement('button');
    button.id = 'but_02_background_ov_gray';
    button.innerHTML = '<img class="background_icon" src="./img/map-solid.svg" alt="zoom">' +
                       '</img>';
    const element = document.createElement('div');
    element.className = 'ovgray backgroundbutton ol-unselectable ol-control';
    element.appendChild(button);
    super({
      element: element,
    });
    button.addEventListener('click', this.switchToBackgroundOVgray.bind(this), false);
  };
  switchToBackgroundOVgray() {
    // Hintergrund nur wechseln, wenn nicht bereits gewaehlt
    if (variableData.sel_background_overview != 'but_02_background_ov_gray') {
      switchBackgroundOverview('but_02_background_ov_gray');
    };
  };
};
var backgroundOVgray = new buttonBackgroundOVgray();





// Popup (Objektinformationen)
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Popup Elemente
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

// Popup Ueberlagerung (Openlayers)
const popup = new Overlay({
  element: container,
  positioning: 'bottom-center',
  stopEvent: true,
  autoPan: {animation: {duration: 250,},},
});

// Popup schliessen ("Klick" auf Schliesssymbol)
closer.onclick = function() {
  popup.setPosition(undefined);
  closer.blur();
  // beim schliessen eines Popups einer Geometrieerfassung, automtaischer Abschluss
  // Erfassung -> auch bei keiner WFS Transaktion
  if (variableData.state_drawJobPolygon == true 
      || variableData.state_drawPntPoint == true 
      || variableData.state_drawChkLine == true) {
    // Datenquellen neu laden
    intData.vect_Jobs.getSource().refresh();
    intData.vect_Points.getSource().refresh();
    intData.vect_Checks.getSource().refresh();
    // Status zuruecksetzen
    variableData.state_drawJobPolygon = false;
    variableData.state_drawPntPoint = false;
    variableData.state_drawChkLine = false;
  } 
  else {
    // Datenquellen neu laden
    intData.vect_Jobs.getSource().refresh();
    intData.vect_Points.getSource().refresh();
    intData.vect_Checks.getSource().refresh();
  };
  return false;
};





// Kartenansicht
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Initialisierung Kartenansicht
// -------------------------------------------------------------------------------------------------
const map = new Map({
  // Steuerungselemente mit individuellen Elementen ergaenzen
  controls: defaultControls({
    attributionOptions: ({
      collapsible: false
    }),
  }).extend([
    new ScaleLine(), 
    new buttonOverview(), 
    checkboxOverviewCRE,
    checkboxOverviewCREVZ,
    checkboxOverviewCREPM,
    checkboxOverviewRDY,
    checkboxOverviewMK,
    checkboxOverviewARC,
    new buttonCapture(), 
    new buttonMarking(), 
    new buttonDone(), 
    new buttonMarkingWait(), 
    new buttonArchive(),
    backgroundAVColor,
    backgroundAVGray,
    backgroundOrtho,
    legendContent.legendOverview
  ]),
  target: 'map',
  // zu Beginn geladene Layer
  layers: [
    // externe Daten
    extData.grid_AV_color, 
    extData.vect_ProjLiegenschaften, 
    extData.vect_SDR, 
    extData.vect_Liegenschaften, 
    extData.vect_Grenzpunkte, 
    extData.vect_Hoheitsgrenzpunkte, 
    extData.vect_Fixpunkte, 
    extData.vect_Gemeinden,
    // interne Daten 
    intData.vect_Jobs, 
    intData.vect_Points, 
    intData.vect_Checks
  ],
  // Popup als Ueberlagerung
  overlays: [popup],
  view: new View({
    // Projektionssystem
    projection: new Projection({
      code: 'EPSG:2056',
      units: 'm'
    }),
    // Zentrumskoordinaten (RSW AG, Lyss)
    center: [2590435, 1214052],
    // Begrenzung Zoomstufe
    zoom: variableData.current_zoom,
    maxZoom: 21,
    minZoom: 12,
    // Begrenzung moeglicher Ansichtsbereich (Kanton Bern)
    extent: [2552000, 1127000, 2681000, 1243000],
  }),
});

// Darstellungswechsel bei Zoomstufe 18
// -------------------------------------------------------------------------------------------------
map.getView().on('change:resolution', (event) => {
  // aktueller Zoom
  var new_zoom = map.getView().getZoom();
  // Detailansicht
  // wenn Zoom groesser als 18 (nur ausfuehren wenn Zoom nicht neu grosser als 18)
  if (new_zoom >= 18 && variableData.current_zoom < 18) {
    // Steuerelemente Hintergrundauswahl Uebersicht entfernen
    map.removeControl(backgroundOVcolor);
    map.removeControl(backgroundOVgray);
    // Hintergrundkarten Uebersicht entfernen
    map.removeLayer(extData.grid_Overview_color);
    map.removeLayer(extData.grid_Overview_gray);
    // Layer Amtliche Vermessung hinzufuegen
    map.addLayer(extData.vect_ProjSDR);
    map.addLayer(extData.vect_SDR);
    map.addLayer(extData.vect_ProjLiegenschaften);
    map.addLayer(extData.vect_Liegenschaften);
    map.addLayer(extData.vect_Grenzpunkte);
    map.addLayer(extData.vect_Hoheitsgrenzpunkte);
    map.addLayer(extData.vect_Fixpunkte);
    // Steuerelemente Hintergrundauswahl Detail hinzufuegen
    map.addControl(backgroundAVColor);
    map.addControl(backgroundAVGray);
    map.addControl(backgroundOrtho);
    // gewaehlte Hintergrundkarte hinzufuegen
    switchBackgroundDetail(variableData.sel_background_detail);
    // Quellenangabe Hintergrundkarte an Steuerelementen ausrichten
    document.querySelector('.ol-attribution.ol-uncollapsible').style.right = '31.3%';
  }
  // Uebersichtsansicht
  // wenn Zoom kleiner als 18 (nur ausfuehren  wenn Zoom nicht neu kleiner als 18)
  else if (new_zoom < 18 && variableData.current_zoom >= 18){
    // Layer Amtliche Vermessung entfernen
    map.removeLayer(extData.vect_Liegenschaften);
    map.removeLayer(extData.vect_SDR);
    map.removeLayer(extData.vect_ProjSDR);
    map.removeLayer(extData.vect_ProjLiegenschaften);
    map.removeLayer(extData.vect_Grenzpunkte);
    map.removeLayer(extData.vect_Hoheitsgrenzpunkte);
    map.removeLayer(extData.vect_Fixpunkte);
    // Steuerelemente Hintergrundauswahl Detail entfernen
    map.removeControl(backgroundAVColor);
    map.removeControl(backgroundAVGray);
    map.removeControl(backgroundOrtho);
    // Hintergrundkarten Detail entfernen
    map.removeLayer(extData.grid_AV_color);
    map.removeLayer(extData.grid_AV_gray);
    map.removeLayer(extData.grid_Orthophoto);
    // Steuerelemente Hintergrundauswahl Uebersicht hinzufuegen
    map.addControl(backgroundOVcolor);
    map.addControl(backgroundOVgray);
    // gewaehlte Hintergrundkarte hinzufuegen
    switchBackgroundOverview(variableData.sel_background_overview);
    // Quellenangabe Hintergrundkarte an Steuerelementen ausrichten
    document.querySelector('.ol-attribution.ol-uncollapsible').style.right = '21.2%';
  };
  // Zoom = aktueller Zoom
  variableData.current_zoom = new_zoom;
});

// Mauszeiger veraendern beim Ueberfahren eines Auftrages, Punktes & Kontrollmass
// -------------------------------------------------------------------------------------------------
/* Quelle: Pablo. (09.12.2014). How to change the cursor on hover in openlayers 3? stack overflow.
   URL: https://stackoverflow.com/questions/26022029/how-to-change-the-cursor-on-hover-in-openlayers-3
   [Abgerufen: 13.04.2023] */
map.on("pointermove", function (evt) {
  var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    if ((layer == intData.vect_Jobs 
         || layer == intData.vect_Checks) 
         && variableData.state_modifyJobPolygon == false 
         && variableData.state_modifyPntPoint == false) {
      return true
    };
  }); 
  if (hit) {
      this.getTargetElement().style.cursor = 'pointer';
  } 
  else {
      this.getTargetElement().style.cursor = '';
  };
});





// Popup (Inhalt)
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Attribute aus WFS-Feature auslesen
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
function getJobFeatureAttribute (feature) {
  var db_auftr_id = feature.get('auftr_pk_id');
  var db_auftr_typ = feature.get('auftr_typ');
  var db_auftr_nummer = feature.get('auftr_nummer');
  var db_auftr_status = feature.get('auftr_status');
  var db_auftr_erfassung = feature.get('auftr_erfassung');
  var db_auftr_faelligkeit = feature.get('auftr_faelligkeit');
  var db_auftr_abschluss = feature.get('auftr_abschluss');
  var db_auftr_gemeinde = feature.get('auftr_gemeinde')
  var db_auftr_flaeche = feature.get('auftr_flaeche');
  var db_pkt_features = []
  try {
    var db_pkt_inExtent = intData.vect_Points.getSource().getFeaturesInExtent(feature.getGeometry().getExtent());
  } catch (error) {
    var db_pkt_inExtent = intData.vect_Points.getSource().getFeaturesInExtent(feature.get('geometry').getExtent());
  };
  db_pkt_inExtent.forEach(
    function(pnt_feature) {
      if (pnt_feature.get('pkt_fk_auftr') == db_auftr_id) {
        db_pkt_features.push(pnt_feature)
      };
    },
  );
  return [db_auftr_id,              // ID-Auftrag (Primaerschluessel)
          db_auftr_typ,             // Auftragart
          db_auftr_nummer,          // Auftragsnummer
          db_auftr_status,          // Bearbeitungsstand Auftrag
          db_auftr_erfassung,       // Erfassungsdatum Auftrag
          db_auftr_faelligkeit,        // Faelligkeitsdatum Auftrag
          db_auftr_abschluss,       // Abschlussdatum Auftrag
          db_auftr_gemeinde,        // Gemeinde
          db_auftr_flaeche,         // Geometrie Auftrag (Polygon) 
          db_pkt_features           // Punkte innerhalb des Auftrages
         ];
};

// Punkt
// ------------------------------------------------------------
function getPntFeatureAttribute (feature) {
  var db_pkt_id = feature.get('pkt_pk_id');
  var db_pkt_fk = feature.get('pkt_fk_auftr');
  var db_pkt_typ = feature.get('pkt_typ');
  var db_pkt_nummer = feature.get('pkt_nummer');
  var db_pkt_markierung = feature.get('pkt_markierung');
  var db_pkt_versicherung = feature.get('pkt_versicherung');
  var db_pkt_kontrolle = feature.get('pkt_kontrolle');
  var db_pkt_vermarkung = feature.get('pkt_vermarkung');
  var db_pkt_punkt = feature.get('pkt_punkt');
  return [db_pkt_id,                // ID-Punkt (Primaerschluessel)
          db_pkt_fk,                // Fremdschluessel (ID-Auftrag)
          db_pkt_typ,               // Punktart (anstehende Arbeit)
          db_pkt_nummer,            // Punktnummer
          db_pkt_markierung,        // Markierungsart
          db_pkt_versicherung,      // Versicherungsart
          db_pkt_kontrolle,         // Kontrollart
          db_pkt_vermarkung,        // Vermarkungsdatum
          db_pkt_punkt              // Geometrie Punkt (Punkt)
         ];
};

// Kontrollmass
// ------------------------------------------------------------
function getChkFeatureAttribute (feature) {
  var db_ktr_id = feature.get('ktr_pk_id');
  var db_ktr_fk = feature.get('ktr_fk_pkt');
  var db_ktr_soll = feature.get('ktr_soll');
  var db_ktr_ist = feature.get('ktr_ist');
  var db_ktr_linie = feature.get('ktr_linie');
  return [db_ktr_id,                // ID-Kontrollmasse (Primaerschluessel)
          db_ktr_fk,                // Fremdschluessel (ID-Punkt)
          db_ktr_soll,              // Sollmasse (in cm)
          db_ktr_ist,               // Istmasse (in cm)
          db_ktr_linie              // Geometrie Kontrollmasse (Linie)  
         ];
};

// Auftrag - Popup Inhalt erstellen (nach Modus)
// -------------------------------------------------------------------------------------------------

// Uebersicht
// ------------------------------------------------------------
function openPopupJobOV (clickedCoordinate, clickedJobFeature, featureAttribute) {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.text_job_num, 
                                 popupContent.text_job_com, 
                                 popupContent.text_job_typ, 
                                 popupContent.text_job_sts, 
                                 popupContent.text_job_cre, 
                                 popupContent.text_job_dli, 
                                 popupContent.text_job_end, 
                                 popupContent.text_job_pnt], 
                                featureAttribute, 
                                [popupContent.but_edit], 
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)                              
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);  
  };
};

// Erfassung
// ------------------------------------------------------------
function openPopupJobCAP (clickedCoordinate, clickedJobFeature, featureAttribute) {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.inpt_job_num, 
                                 popupContent.text_job_com, 
                                 popupContent.inpt_job_typ, 
                                 popupContent.text_job_cre, 
                                 popupContent.inpt_job_dli, 
                                 popupContent.text_job_pnt], 
                                featureAttribute, 
                                [popupContent.but_edit, 
                                 popupContent.but_modi], 
                                [popupContent.but_save, 
                                 popupContent.but_rele]);
  checkInputInteger();
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);
  };
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updateJobDB('update', 
                'popup_but_save', 
                [valuePU_job_num, valuePU_job_typ, valuePU_job_dli], 
                clickedJobFeature, 
                intData.vect_Jobs);
  };
  // Funktion bei "Klick" auf <Freigeben>
  document.getElementById('popup_but_rele').onclick = function(){
    updateJobDB('update',
                'popup_but_rele', 
                [valuePU_job_num, valuePU_job_dli], 
                clickedJobFeature, 
                intData.vect_Jobs);
    popup.setPosition(undefined);
  };   
  // Funktion bei "Klick" auf Modifizieren (Bleistift)
  document.getElementById('popup_but_modi').onclick = function(){
    // ID vom zu modifizierenden Auftrag
    var feature_id = clickedJobFeature.getId()
    // zu modifizierender Auftrag
    variableData.featureToModify = intData.vect_Jobs.getSource().getFeatureById(feature_id)
    // Datenquelle neu landen -> Zweck: Einfaerbung + exklusive Darstellung 
    intData.vect_Jobs.getSource().refresh()                        
    // Zoom auf die ausgewaehlte Geometrie
    map.getView().fit(variableData.featureToModify.getGeometry().getExtent(), map.getSize()); 
    // Status Bearbeitung Job Polygon aktivieren
    variableData.state_modifyJobPolygon = true
    // kurze Anleitung anstelle Jobliste einblenden
    var stringHTML = '<div style="padding: 4%; font-size: 80%;">' +
                       '<h4>Anpassung der Auftragsgeometrie</h4>' +
                       '<p>Stützpunkte können durch drücken der <b>UMSCHALT-Taste</b> und gleichzeitigem <b>Linksklick</b>, auf den betreffenden Stützpunkt, gelöscht werden.</p>' +
                     '</div>';
    document.getElementById('job_list-content').innerHTML = stringHTML
    // Steuerelemente zu Auftrag- / Punkterstellung entfernen
    map.removeControl(createPnt)
    map.removeControl(createJob)
    // Steuerelemente Funktionen Auftragsgeometriebearbeiten hinzufuegen
    map.addControl(saveModifyJob)
    map.addInteraction(variableData.modifyJob)
    document.getElementById('but_modify_job').disabled = false;
    // Popup schliessen    
    popup.setPosition(undefined)
  };
}; 

// Vermarkung
// ------------------------------------------------------------
function openPopupJobMRK (clickedCoordinate, clickedJobFeature, featureAttribute)  {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragsdetails',
                                              [popupContent.text_job_num, 
                                               popupContent.text_job_com, 
                                               popupContent.text_job_typ, 
                                               popupContent.text_job_dli, 
                                               popupContent.text_job_pnt2],
                                              featureAttribute,
                                              [popupContent.but_edit],
                                              [popupContent.but_emrk]);
  //Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);
  };
  // Funktion bei "Klick" auf <Vermarkung abschliessen>
  document.getElementById('popup_but_emrk').onclick = function(){
    // Pruefung ob alle Punkte vermarkt wurden
    var pointsAllMarked = true
    featureAttribute[9].forEach(function(point) {
      if (point.get('pkt_vermarkung') == null) {
        pointsAllMarked = false;
      };
    });
    // alle vermarkt -> Transaktion ausloesen 
    if (pointsAllMarked) {
      updateJobDB('update', 'popup_but_emrk', [], clickedJobFeature, intData.vect_Jobs);
      // Popup schliessen
      popup.setPosition(undefined);
    }
    // nicht alle Vermarkt -> Fehlermeldung
    else {
      cellFlasher('popup_num_pnts', 'white', []);
    };
  };
};

// Erledigt
// ------------------------------------------------------------
function openPopupJobDNE (clickedCoordinate, clickedJobFeature, featureAttribute)  {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragsdetails',
                                              [popupContent.text_job_num, 
                                               popupContent.text_job_com, 
                                               popupContent.text_job_typ, 
                                               popupContent.text_job_end, 
                                               popupContent.text_job_pnt2],
                                              featureAttribute,
                                              [popupContent.but_edit],
                                              [popupContent.but_arch]);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);
  };
  // Funktion bei "Klick" auf <Auftrag archivieren>
  document.getElementById('popup_but_arch').onclick = function(){
    // Pruefen ob alle Punkte kontrolliert (Kontrolle != "ausstehend")
    var pointsAllChecked = true
    featureAttribute[9].forEach(function(point) {
      if (point.get('pkt_kontrolle') == 'ausstehend') {
        pointsAllChecked = false;
      }
      // wenn Kontrolle = Kontrollmass auf Vollstaendigkeit pruefen (soll und ist)
      else if (point.get('pkt_kontrolle') == 'Kontrollmass') {
        intData.vect_Checks.getSource().getFeatures().forEach(function (check) {
          if (check.get('ktr_fk_pkt') == point.get('pkt_pk_id')) {
            if (check.get('ktr_soll') == null || check.get('ktr_ist') == null) {
              pointsAllChecked = false;
            };
          };
        });
      };
    });
    // Kontrolle vollstaendig -> Transaktion ausloesen
    if (pointsAllChecked) {
      updateJobDB('update', 'popup_but_arch', [], clickedJobFeature, intData.vect_Jobs);
      // Popup schliessen
      popup.setPosition(undefined);
    }
    // Kontrolle unvollstaendig -> Fehlermeldung
    else {
      cellFlasher('popup_num_pnts', 'white', []);
    };
  };
};

// Vermarkung zurueckgestellt / Abschluss Projektmutation
// ------------------------------------------------------------
function openPopupJobVZPM (clickedCoordinate, clickedJobFeature, featureAttribute) {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.inpt_job_num, 
                                 popupContent.text_job_com, 
                                 popupContent.text_job_typ, 
                                 popupContent.text_job_cre, 
                                 popupContent.inpt_job_dli, 
                                 popupContent.text_job_pnt], 
                                featureAttribute, 
                                [popupContent.but_edit], 
                                [popupContent.but_save, 
                                 popupContent.but_rele]);
  checkInputInteger();
  //Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);
  };
  //Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updateJobDB('update', 
                'popup_but_save', 
                [valuePU_job_num, valuePU_job_dli], 
                clickedJobFeature, 
                intData.vect_Jobs);
  };
  //Funktion bei "Klick" auf <Freigeben>
  document.getElementById('popup_but_rele').onclick = function(){
    updateJobDB('update', 
                'popup_but_rele', 
                [valuePU_job_num, valuePU_job_dli], 
                clickedJobFeature, 
                intData.vect_Jobs);
    popup.setPosition(undefined);
  };  
};

// Archiv
// ------------------------------------------------------------
function openPopupJobAR (clickedCoordinate, clickedJobFeature, featureAttribute) {
  popup.setPosition(clickedCoordinate);
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.text_job_num, 
                                 popupContent.text_job_com, 
                                 popupContent.text_job_typ, 
                                 popupContent.text_job_cre, 
                                 popupContent.text_job_end, 
                                 popupContent.text_job_pnt], 
                                featureAttribute, 
                                [popupContent.but_edit], 
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)                              
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupJob(clickedCoordinate, clickedJobFeature);  
  };
};

// Punkt - Popup Inhalt erstellen (nach Modus)
// -------------------------------------------------------------------------------------------------

// Uebersicht
// ------------------------------------------------------------
function openPopupPntOV (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.text_pnt_num,
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_tmrk, 
                                 popupContent.text_pnt_mrk, 
                                 popupContent.text_pnt_fnl, 
                                 popupContent.text_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_edit],
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupPnt(clickedPointFeature.getGeometry().getCoordinates(), clickedPointFeature);
  };
};

// Erfassung
// ------------------------------------------------------------
function openPopupPntCAP (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.inpt_pnt_num, 
                                 popupContent.inpt_pnt_typ, 
                                 popupContent.inpt_pnt_tmrk, 
                                 popupContent.inpt_pnt_mrk],
                                featureAttribute,
                                [popupContent.but_edit, 
                                 popupContent.but_modi],
                                [popupContent.but_save]);
  checkInputInteger();
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    try {
      var pointCoords = clickedPointFeature.getGeometry().getCoordinates();
    } catch (error) {
      var pointCoords = clickedPointFeature.get('geometry').getCoordinates();
    };
    openEditPopupPnt(pointCoords, clickedPointFeature);
  };
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updatePntDB('update', 
                'popup_but_save', 
                [valuePU_pnt_num, valuePU_pnt_typ, valuePU_pnt_tmrk, valuePU_pnt_mrk], 
                clickedPointFeature, 
                intData.vect_Points);
  };
  // Funktion bei "Klick" auf Modifizieren (Bleistift)
  document.getElementById('popup_but_modi').onclick = function(){
    // ID vom zu modifizierenden Punkt
    var feature_id = clickedPointFeature.getId()
    // zu  modifizierender Punkt
    variableData.featureToModify = intData.vect_Points.getSource().getFeatureById(feature_id)
    // Datenquelle neu landen -> Zweck: Einfaerbung + exklusive Darstellung (Auftrag)
    intData.vect_Jobs.getSource().refresh()  
    // Zoom auf die ausgewaehlte Geometrie               
    map.getView().fit(variableData.featureToModify.getGeometry().getExtent(), map.getSize());
    // Status Bearbeitung Vermarkungspunkt Punkt aktivieren 
    variableData.state_modifyPntPoint = true
    // kurze Anleitung anstelle Jobliste einblenden
    var stringHTML = '<div style="padding: 4%; font-size: 80%;">' +
                       '<h4>Anpassung der Vermarkungspunkte</h4>' +
                     '</div>';
    document.getElementById('job_list-content').innerHTML = stringHTML
    // Steuerelemente zu Auftrag- / Punkterstellung entfernen
    map.removeControl(createPnt)
    map.removeControl(createJob)
    // Steuerelemente / Funktionen Punktgeometriebearbeiten hinzufuegen
    map.addControl(saveModifyPnt)
    document.getElementById('but_modify_pnt').disabled = false;
    map.addInteraction(variableData.modifyPnt)
    map.addInteraction(variableData.snapGP)
    map.addInteraction(variableData.snapHGP)
    map.addInteraction(variableData.snapFP)
    // Popup schliessen
    popup.setPosition(undefined)
  };
};

// Vermarkung
// ------------------------------------------------------------
// Vermarkung noch nicht abgeschlossen
function openPopupPntMRK1 (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.inpt_pnt_num, 
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_tmrk, 
                                 popupContent.inpt_pnt_mrk, 
                                 popupContent.inpt_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_edit],
                                [popupContent.but_emrk]);
  checkInputInteger();
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupPnt(clickedPointFeature.getGeometry().getCoordinates(), clickedPointFeature);
  };
  // Funktion bei "Klick" auf <Vermarkung abschliessen>
  document.getElementById('popup_but_emrk').onclick = function(){
    updatePntDB('update', 
                'popup_but_emrk', 
                [valuePU_pnt_num, valuePU_pnt_mrk, valuePU_pnt_ctr],
                clickedPointFeature,
                intData.vect_Points);
    // nach Speichern neues Popup oeffnen (Vermarkung abgeschlossen)
    async function getMRK2Popup(){
      // warten bis Datenquelle vollstaendig geladen
      await waitUntil(() => intData.vect_Points.getSource().getFeatures().length > 0);
      // Abrufen der Punkt-Informationen
      clickedPointFeature = intData.vect_Points.getSource().getFeatureById(clickedPointFeature.getId());
      var pnt_attribute = getPntFeatureAttribute(clickedPointFeature);
      // Oeffnen des Popups
      if (clickedPointFeature.get('pkt_vermarkung') != undefined) {
        openPopupPntMRK2 (clickedPointFeature, pnt_attribute);
      };      
    };
    // Popup oeffnen (Vermarkungsmodus)
    getMRK2Popup();
  };
};
// Vermarkung bereits abgeschlossen
function openPopupPntMRK2 (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.text_pnt_num, 
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_tmrk, 
                                 popupContent.text_pnt_mrk, 
                                 popupContent.text_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_edit],
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupPnt(clickedPointFeature.getGeometry().getCoordinates(), clickedPointFeature);
  };
};

// Erledigt
// ------------------------------------------------------------
// keine Kontrolle definiert
function openPopupPntDNE (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.text_pnt_num, 
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_mrk, 
                                 popupContent.text_pnt_fnl, 
                                 popupContent.inpt_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_edit],
                                [popupContent.but_save]);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupPnt(clickedPointFeature.getGeometry().getCoordinates(), clickedPointFeature);
  };
  // Funktion beu "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    if (valuePU_pnt_ctr() != 'ausstehend') {
      updatePntDB('update', 'popup_but_save', [valuePU_pnt_ctr], clickedPointFeature, intData.vect_Points);
      // nach Speichern neues Popup oeffnen (Vermarkung abgeschlossen)
      // -> wenn Kontrolle != ausstehend
      async function getDNE2Popup(){
        // warten bis Datenquelle vollstaendig geladen
        await waitUntil(() => intData.vect_Points.getSource().getFeatures().length > 0);
        // Abrufen der Punkt-Informationen
        clickedPointFeature = intData.vect_Points.getSource().getFeatureById(clickedPointFeature.getId());
        var pnt_attribute = getPntFeatureAttribute(clickedPointFeature);
        // Oeffnen des Popups
        if (clickedPointFeature.get('pkt_kontrolle') != 'ausstehend') {
          openPopupPntDNE2 (clickedPointFeature, pnt_attribute);
        };        
      };
      // Popup oeffnen (Vermarkungsmodus)
      getDNE2Popup();
    }
    // Fehlermeldung wenn Kontrolle ausstehend
    else {
      cellFlasher('popup_p_val_ctr', 'white', []);
    };
  };
};
// wenn Kontrolle bereits definiert
function openPopupPntDNE2 (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.text_pnt_num, 
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_mrk, 
                                 popupContent.text_pnt_fnl, 
                                 popupContent.text_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_edit],
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupPnt(clickedPointFeature.getGeometry().getCoordinates(), clickedPointFeature);
  };
};

// Vermarkung zurueckgestellt / Abschluss Projektmutation
// ------------------------------------------------------------
function openPopupPntVZPM (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.inpt_pnt_num, 
                                 popupContent.inpt_pnt_typ, 
                                 popupContent.inpt_pnt_tmrk, 
                                 popupContent.inpt_pnt_mrk],
                                featureAttribute,
                                [popupContent.but_edit],
                                [popupContent.but_save]);
  checkInputInteger();
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    try {
      var pointCoords = clickedPointFeature.getGeometry().getCoordinates();
    } catch (error) {
      var pointCoords = clickedPointFeature.get('geometry').getCoordinates();
    }
    openEditPopupPnt(pointCoords, clickedPointFeature);
  };
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updatePntDB('update', 
                'popup_but_save', 
                [valuePU_pnt_num, valuePU_pnt_typ, valuePU_pnt_tmrk, valuePU_pnt_mrk], 
                clickedPointFeature, 
                intData.vect_Points);
  };
};

// Archiv
// ------------------------------------------------------------
function openPopupPntAR (clickedPointFeature, featureAttribute) {
  popup.setPosition(clickedPointFeature.getGeometry().getCoordinates());
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.text_pnt_num, 
                                 popupContent.text_pnt_typ, 
                                 popupContent.text_pnt_mrk, 
                                 popupContent.text_pnt_fnl, 
                                 popupContent.text_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_dele],
                                []);
  // Funktion bei "Klick" auf das Loeschen (Muelleimer)
  document.getElementById('popup_but_dele').onclick = function(){
    intData.vect_Checks.getSource().getFeatures().forEach(function (check) {
      // zugehoerige Kontrollmasse loeschen
      if (check.get('ktr_fk_pkt') == clickedPointFeature.get('pkt_pk_id')) {
        updateChkDB('delete', 'popup_but_dele', [], check, intData.vect_Checks);
      };
    });
    updatePntDB('delete', 'popup_but_dele', [], clickedPointFeature, intData.vect_Points);
  };
};

// Kontrollmass - Popup Inhalt erstellen (nach Modus)
// -------------------------------------------------------------------------------------------------

// Vermarkung
// ------------------------------------------------------------
function openPopupChkMRK (clickedCheckFeature, featureAttribute) {
  popup.setPosition(getCenter(clickedCheckFeature.getGeometry().getExtent()));
  content.innerHTML = popupContent.fillPopup('Kontrollmassdetails',
                                [popupContent.inpt_chk_shd, 
                                 popupContent.inpt_chk_is],
                                featureAttribute,
                                [popupContent.but_edit],
                                [popupContent.but_save]);
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updateChkDB('update',
                'popup_but_save', 
                [valuePU_chk_shd, valuePU_chk_is], 
                clickedCheckFeature, 
                intData.vect_Checks);
  };
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    try {
      var checkCenter = getCenter(clickedCheckFeature.getGeometry().getExtent());
    } catch (error) {
      var checkCenter = getCenter(clickedCheckFeature.get('geometry').getExtent());
    };
    openEditPopupChk(checkCenter, clickedCheckFeature);
  };
};

// Erledigt
// ------------------------------------------------------------
function openPopupChkDNE (clickedCheckFeature, featureAttribute) {
  popup.setPosition(getCenter(clickedCheckFeature.getGeometry().getExtent()));
  content.innerHTML = popupContent.fillPopup('Kontrollmassdetails',
                                [popupContent.text_chk_shd, 
                                 popupContent.text_chk_is, 
                                 popupContent.text_chk_diff],
                                featureAttribute,
                                [popupContent.but_edit],
                                []);
  // Funktion bei "Klick" auf das Bearbeitungsmenue (Zahnrad)
  document.getElementById('popup_but_edit').onclick = function(){
    openEditPopupChk(getCenter(clickedCheckFeature.getGeometry().getExtent()), clickedCheckFeature);
  };
};

// Popup's fuer uneingeschraenkte Bearbeitungsmoeglichkeiten
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
function openEditPopupJob (coordinate, feature) {
  popup.setPosition(coordinate);
  var featureAttribute = getJobFeatureAttribute(feature);
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.inpt_job_num, 
                                 popupContent.inpt_job_com,
                                 popupContent.inpt_job_typ, 
                                 popupContent.inpt_job_sts, 
                                 popupContent.inpt_job_cre, 
                                 popupContent.inpt_job_dli, 
                                 popupContent.inpt_job_end], 
                                featureAttribute, 
                                [popupContent.but_dele], 
                                [popupContent.but_save]);
  checkInputInteger();
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updateJobDB('update', 
                'popup_but_save', 
                [valuePU_job_num, 
                 valuePU_job_com, 
                 valuePU_job_typ, 
                 valuePU_job_sts, 
                 valuePU_job_cre, 
                 valuePU_job_dli, 
                 valuePU_job_end], 
                feature, 
                intData.vect_Jobs);
  };
  // Funktion bei "Klick" auf Loeschen (Muelleimer)
  document.getElementById('popup_but_dele').onclick = function(){
    var pointFeatureList = intData.vect_Points.getSource().getFeatures();
    var pointsExist = false;
    // Pruefung ob Punkte vorhanden
    for (let i = 0; i < pointFeatureList.length; i++) {
      if (pointFeatureList[i].get('pkt_fk_auftr') == feature.get('auftr_pk_id')) {
        pointsExist = true;
      };
    };
    // kein Loeschen wenn Punkte vorhanden -> Fehlermeldung
    if (pointsExist == true) {
      cellFlasher('popup_but_dele', colorData.clr_background_1, []);
    }
    // Loeschen wenn keine Punkte vorhanden
    else {
      updateJobDB('delete', 'popup_but_dele', [], feature, intData.vect_Jobs);
    };
  };
};

// Punkt
// ------------------------------------------------------------
function openEditPopupPnt (coordinate, feature) {
  popup.setPosition(coordinate);
  var featureAttribute = getPntFeatureAttribute(feature);
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.inpt_pnt_num, 
                                 popupContent.inpt_pnt_typ, 
                                 popupContent.inpt_pnt_tmrk, 
                                 popupContent.inpt_pnt_mrk, 
                                 popupContent.inpt_pnt_fnl, 
                                 popupContent.inpt_pnt_ctr],
                                featureAttribute,
                                [popupContent.but_dele],
                                [popupContent.but_save]);
  checkInputInteger();
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updatePntDB('update', 
                'popup_but_save', 
                [valuePU_pnt_num, 
                 valuePU_pnt_typ, 
                 valuePU_pnt_tmrk, 
                 valuePU_pnt_mrk, 
                 valuePU_pnt_fnl, 
                 valuePU_pnt_ctr], 
                feature, 
                intData.vect_Points);
  };
  // Funktion bei "Klick" auf Loeschen (Muelleimer)
  document.getElementById('popup_but_dele').onclick = function(){
    var checkFeatureList = intData.vect_Checks.getSource().getFeatures();
    var checksExist = false;
    // Pruefen ob Kontrollmasse vorhanden
    for (let i = 0; i < checkFeatureList.length; i++) {
      if (checkFeatureList[i].get('ktr_fk_pkt') == feature.get('pkt_pk_id')) {
        checksExist = true;
      };
    };
    // kein Loeschen wenn Kontrollmasse vorhanden -> Fehlermeldung
    if (checksExist == true) {
      cellFlasher('popup_but_dele', colorData.clr_background_1, []);
    }
    // Loeschen wenn keine Kontrollmasse vorhanden
    else {
      updatePntDB('delete', 'popup_but_dele', [], feature, intData.vect_Points);
    };
  };
};

// Kontrollmass
// ------------------------------------------------------------
function openEditPopupChk (coordinate, feature) {
  popup.setPosition(coordinate);
  var featureAttribute = getChkFeatureAttribute(feature)
  content.innerHTML = popupContent.fillPopup('Kontrollmassdetails',
                                [popupContent.inpt_chk_shd, popupContent.inpt_chk_is],
                                featureAttribute,
                                [popupContent.but_dele],
                                [popupContent.but_save]);
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    updateChkDB('update', 
                'popup_but_save', 
                [valuePU_chk_shd, 
                 valuePU_chk_is], 
                feature, 
                intData.vect_Checks);
  };
  // Funktion bei "Klick" auf Loeschen (Muelleimer)
  document.getElementById('popup_but_dele').onclick = function(){
    updateChkDB('delete', 
                'popup_but_dele', 
                [], 
                feature, 
                intData.vect_Checks);
  };
};

// Popup's beim Erstellen eine neuen Objekts
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
function openCreateJobPopup(feature){
  var featureAttribute = getJobFeatureAttribute(feature);
  var featureExtent = feature.getGeometry().getExtent();
  popup.setPosition(getCenter(featureExtent));
  content.innerHTML = popupContent.fillPopup('Auftragdetails', 
                                [popupContent.inpt_job_num, 
                                 popupContent.inpt_job_com, 
                                 popupContent.inpt_job_typ, 
                                 popupContent.text_job_cre, 
                                 popupContent.inpt_job_dli], 
                                featureAttribute, 
                                [], 
                                [popupContent.but_save]);
  checkInputInteger();
  //Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    // deaktivieren Button
    document.getElementById('popup_but_save').disabled = true;
    updateJobDB('insert', 
                'popup_but_save', 
                [valuePU_job_num, 
                 valuePU_job_com, 
                 valuePU_job_typ, 
                 valuePU_job_cre, 
                 valuePU_job_dli], 
                feature, 
                intData.vect_Jobs);
    // Status Auftrag erfassen zuruecksetzen
    variableData.state_drawJobPolygon = false;
  };
};

// Punkte
// ------------------------------------------------------------
function openCreatePntPopup(feature){
  var featureAttribute = getPntFeatureAttribute(feature);
  var center = feature.getGeometry().getCoordinates();
  popup.setPosition(center);
  content.innerHTML = popupContent.fillPopup('Punktdetails',
                                [popupContent.inpt_pnt_num, 
                                 popupContent.inpt_pnt_typ, 
                                 popupContent.inpt_pnt_tmrk, 
                                 popupContent.inpt_pnt_mrk],
                                featureAttribute,
                                [],
                                [popupContent.but_save]);
  checkInputInteger();
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    // deaktivieren Button
    document.getElementById('popup_but_save').disabled = true;
    updatePntDB('insert', 
                'popup_but_save', 
                [valuePU_pnt_num, 
                 valuePU_pnt_typ, 
                 valuePU_pnt_tmrk, 
                 valuePU_pnt_mrk], 
                feature, 
                intData.vect_Points);
    // Status Punkt erfassen zuruecksetzen
    variableData.state_drawPntPoint = false;
  };
};

// Kontrollmass
// ------------------------------------------------------------
function openCreateChkPopup(feature){
  var featureAttribute = getChkFeatureAttribute(feature);
  var featureExtent = feature.getGeometry().getExtent();
  popup.setPosition(getCenter(featureExtent));
  content.innerHTML = popupContent.fillPopup('Kontrollmassdetails',
                                [popupContent.inpt_chk_shd, 
                                 popupContent.inpt_chk_is],
                                featureAttribute,
                                [],
                                [popupContent.but_save]);
  // Funktion bei "Klick" auf <Speichern>
  document.getElementById('popup_but_save').onclick = function(){
    // deaktivieren Button
    document.getElementById('popup_but_save').disabled = true;
    updateChkDB('insert', 
                'popup_but_save', 
                [valuePU_chk_shd, 
                 valuePU_chk_is], 
                feature, 
                intData.vect_Checks);
    // Status Kontrollmass erfassen zuruecksetzen
    variableData.state_drawChkLine = false;
  };
};





// Detektion von "Klicks" auf die Auftragsgeometrien / Vermarkungspunkte / Komtrollmasse
// -> Popup's oeffnen
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
map.on('click', function (evt) {
  if (variableData.state_modifyJobPolygon == false      // kein Oeffnen wenn Modifizierung Auftrag
      && variableData.state_modifyPntPoint == false     // kein Oeffnen wenn Modifizierung Punkt
      && variableData.state_drawJobPolygon == false     // kein Oeffnen wenn Erstellung Auftrag
      && variableData.state_drawPntPoint == false       // kein Oeffnen wenn Erstellung Punkt
      && variableData.state_drawChkLine == false) {     // kein Oeffnen wenn Erstellung Kontrollmass
    // Ermittlung angeklickter Objekte
    var clickOnPoint = false;
    var clickedPointFeature = null;
    var clickOnCheck = false;
    var clickedCheckFeature = null;
    var clickOnJob = false;
    var clickedJobFeature = null;
    // Zuordnung der angeklickten Objekte
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      // Punkte
      if (layer == intData.vect_Points) {
        clickOnPoint = true;
        clickedPointFeature = feature;
      };
      // Auftraege 
      if (layer == intData.vect_Checks) {
        clickOnCheck = true;
        clickedCheckFeature = feature;
      };
      // Kontrollmasse
      if (layer == intData.vect_Jobs) {
        clickOnJob = true;
        clickedJobFeature = feature;
      };
    });
    // beim anwaehlen eines Punktes
    if (clickOnPoint == true){
      // abrufen der Attribute des gewaehlten Punkt
      var featureAttribute = getPntFeatureAttribute(clickedPointFeature);
      // aktualisieren der Datenquelle des Punktelayer nach dem Zeichnen neuer Objekte
      if (variableData.state_drawPntPoint == true) {
        intData.vect_Points.getSource().refresh();
        variableData.state_drawPntPoint = false;
      };
      // oeffnen des Popups im Modus Uebersicht
      if (variableData.sel_mode == '00_overview') {
        openPopupPntOV(clickedPointFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Erfassung
      else if (variableData.sel_mode == '01_capture') {
        openPopupPntCAP(clickedPointFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Vermarkung
      else if (variableData.sel_mode == '02_marking') {
        if (featureAttribute[7] == null) {
          // wenn Vermarkung nicht abgeschlossen
          openPopupPntMRK1(clickedPointFeature, featureAttribute);
        }
        else {
          // wenn Vermarkung abgeschlossen
          openPopupPntMRK2(clickedPointFeature, featureAttribute);
        };
      }
      // oeffnen des Popups im Modus Erledigt
      else if (variableData.sel_mode == '03_done') {
        if (featureAttribute[6] == 'ausstehend') {
          // wenn Kontrolle ausstehend
          openPopupPntDNE(clickedPointFeature, featureAttribute);
        }
        else {
          // wenn Kontrolle bereits erfasst
          openPopupPntDNE2(clickedPointFeature, featureAttribute);
        };
      }
      // oeffnen des Popups im Modus VZ / PM
      else if (variableData.sel_mode == '04_markingwait') {
        openPopupPntVZPM(clickedPointFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Archiv
      else if (variableData.sel_mode == '05_archive') {
        openPopupPntAR(clickedPointFeature, featureAttribute);
      };
    }
    // beim anwaehlen eines Kontrollmass
    else if (clickOnCheck == true) {
      // abrufen der Attribute des gewaehlten Kontrollmass
      var featureAttribute = getChkFeatureAttribute(clickedCheckFeature);
      // aktualisieren der Datenquelle des Kontrollmasslayer nach dem Zeichnen neuer Objekte
      if (variableData.state_drawChkLine == true) {
        intData.vect_Checks.getSource().refresh();
        variableData.state_drawChkLine = false;
      };
      // oeffnen des Popups im Modus Vermarkung
      if (variableData.sel_mode == '02_marking') {
        openPopupChkMRK(clickedCheckFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Erledigt
      else if (variableData.sel_mode == '03_done') {
        openPopupChkDNE(clickedCheckFeature, featureAttribute);
      };
    }
    // beim anwaehlen eines Auftrages
    else if (clickOnJob == true) {
      // abrufen der Attribute des gewaehlten Auftrag
      var featureAttribute = getJobFeatureAttribute(clickedJobFeature);
      // aktualisieren der Datenquelle des Auftragslayer nach dem Zeichnen neuer Objekte
      if (variableData.state_drawJobPolygon == true) {
        intData.vect_Jobs.getSource().refresh();
        variableData.state_drawJobPolygon = false;
      };
      // oeffnen des Popups im Modus Uebersicht 
      if (variableData.sel_mode == '00_overview') {
        openPopupJobOV(evt.coordinate, clickedJobFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Erfassung
      else if (variableData.sel_mode == '01_capture') {
        openPopupJobCAP(evt.coordinate, clickedJobFeature, featureAttribute);       
      }
      // oeffnen des Popups im Modus Vermarkung
      else if (variableData.sel_mode == '02_marking') {
        openPopupJobMRK(evt.coordinate, clickedJobFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Erledigt
      else if (variableData.sel_mode == '03_done') {
        openPopupJobDNE(evt.coordinate, clickedJobFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus VZ / PM
      else if (variableData.sel_mode == '04_markingwait') {
        openPopupJobVZPM(evt.coordinate, clickedJobFeature, featureAttribute);
      }
      // oeffnen des Popups im Modus Archiv
      else if (variableData.sel_mode == '05_archive') {
        openPopupJobAR(evt.coordinate, clickedJobFeature, featureAttribute);
      };
    }
    // bei "Klick" neben Objekte -> schliessen des geoeffneten Popups
    else {
      if (variableData.state_drawJobPolygon == false 
          && variableData.state_drawPntPoint == false
          && variableData.state_drawChkLine == false) {
        popup.setPosition(undefined);
      };
    };
  };
});





// Geometrien zeichnen / bearbeiten
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Fangen
// -------------------------------------------------------------------------------------------------

// Fangen auf Liegenschaftsgrenzpunkten
variableData.snapGP = new Snap({
  source: extData.vect_Grenzpunkte.getSource(),
});
// Fangen auf Hoheitsgrenzpunkten
variableData.snapHGP = new Snap({
  source: extData.vect_Hoheitsgrenzpunkte.getSource(),
});
// Fangen auf Fixpunkten
variableData.snapFP = new Snap({
  source: extData.vect_Fixpunkte.getSource(),
});
// Fangen auf Vermarkungspunkten (fuer Erfassung Kontrollmasse)
variableData.snapChk = new Snap({
  source: intData.vect_Points.getSource(),
});

// Geometrien zeichnen
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
// Instanziierung Auftrag zeichnen
variableData.drawJob = new Draw ({
  source: intData.vect_Jobs.getSource(),
  type: 'Polygon',
});
// beim Beenden der Erfassung
variableData.drawJob.on('drawend', function(evt){
  // Ermittlung der Gemeinde
  // -> Verschnitt Gemeindegeometrie mit Zentrum der Bounding-Box der Auftragsgeometrie
  var community = 'unbekannt';
  var feature = evt.feature;
  var featureExt = feature.getGeometry().getExtent();
  var centerE = (featureExt[0] + featureExt[2]) * 0.5;
  var centerN = (featureExt[1] + featureExt[3]) * 0.5;
  var featureCenter = [centerE, centerN];
  var featureComList = extData.vect_Gemeinden.getSource().getFeaturesInExtent(featureExt);
  for (let i = 0; i < featureComList.length; i++) {
    var comPolygon = featureComList[i].getGeometry();
    if (comPolygon.intersectsCoordinate(featureCenter)){
      community = featureComList[i].get('Name');
    };
  };
  // Standartwerte des Auftrages vergeben -> anpassbar in Popup
  feature.setProperties({
    auftr_typ: 'Liegenschaftsmutation',
    auftr_gemeinde: community,
    auftr_nummer: '00000',  
    auftr_status: 'ungespeichert',
    auftr_erfassung: new Date().toJSON().slice(0, 10),
  });
  // Zeichnen beenden
  endDrawJobPolygon();
  // Popup oeffnen
  openCreateJobPopup(feature);
});
// Zeichnen beenden
function endDrawJobPolygon() {
  // Funktionen entfernen
  map.removeInteraction(variableData.drawJob);
  map.removeInteraction(variableData.snapGP);
  map.removeInteraction(variableData.snapHGP);
  map.removeInteraction(variableData.snapFP);
  // Buttonbeschriftung zuruecksetzen
  document.getElementById("but_create_job").innerHTML = "Auftrag erfassen";
};

// Auftragsgeometrie modifizieren
variableData.modifyJob = new Modify ({
  // Datenquelle
  source: intData.vect_Jobs.getSource(),
  // zu modifizierende Geometrie
  feature: variableData.featureToModify,
  // Stuetzpunkt loeschen mit Shift + Linksklick
  deleteCondition: function(event) {
    return shiftKeyOnly(event) && singleClick(event);
  },
});
// Modifizieren beenden
function endModifyJobPolygon() {
  variableData.state_modifyJobPolygon = false;
  variableData.featureToModify = undefined;
  // Beenden-Button entfernen
  map.removeControl(saveModifyJob);
  // Funktionen entfernen
  map.removeInteraction(variableData.modifyJob);
  // hinzufuegen Steuerungselemente Punkt- / Auftragserfassung
  map.addControl(createPnt);
  map.addControl(createJob);
};

// Punkt
// ------------------------------------------------------------
// Instanziierung Punkt zeichnen
variableData.drawPnt = new Draw ({
  source: intData.vect_Points.getSource(),
  type: 'Point',
});
// beim Beenden der Erfassung
variableData.drawPnt.on('drawend', function(evt){
  var pointInJobGeom = false;
  var JobId_FK = null;
  var pointMarker = 'Stein';
  // Pruefung ob Punkt innerhalb Auftrag und auf bestehendem Grenzpunkt
  /* Quelle: Lydon. Ch. (12.04.2023). How to get Feature which is snaped by ol.interaction snap?
     stack overflow. URL: https://stackoverflow.com/questions/32194030/how-to-get-feature-which-is-snaped-by-ol-interaction-snap 
     [Abgerufen: 13.04.2023] */    
  map.forEachFeatureAtPixel(evt.target.downPx_, function(feature, layer) {
    // pruefen ob Punkt innerhalb einer Auftrags-Geometrie 
    // -> abgreifen Fremdschluessel
    if (layer == intData.vect_Jobs) {
      pointInJobGeom = true;
      JobId_FK = feature.get('auftr_pk_id');
    };
    // pruefen ob Punkt auf bestehenden Grenzpunkt / Hoheitsgrenzpunkt / Fixpunkt 
    // -> Uebernahme Versicherungsart
    if (layer == extData.vect_Grenzpunkte 
        || layer == extData.vect_Hoheitsgrenzpunkte 
        || layer == extData.vect_Fixpunkte) {
      pointMarker = feature.get('Punktzeichen');
    };
  });
  // neuer Punkt nur wenn innerhalb einer Auftrags-Geometrie
  if (pointInJobGeom == true) {
    var feature = evt.feature;
    // Standartwerte des Vermarkungspunktes vergeben -> anpassbar in Popup
    feature.setProperties({
      pkt_fk_auftr: JobId_FK,
      pkt_typ: 'Neuerstellung',
      pkt_nummer: null,
      pkt_markierung: 'Pfahl',
      pkt_versicherung: pointMarker,
      pkt_kontrolle: 'ausstehend',
    });
    // Zeichnen beenden
    endDrawPntPoint();
    // Popup oeffnen
    openCreatePntPopup(feature);
  }
  // "null"-Punkt bei Erfassung ausserhalb Auftragsgeometrie
  else {
    var feature = evt.feature;
    feature.setProperties({
      pkt_fk_auftr: null,
      pkt_typ: null,
      pkt_nummer: null,
      pkt_markierung: null,
      pkt_versicherung: null,
      pkt_kontrolle: null,
    });
  }
});
// Zeichnen beenden
function endDrawPntPoint() {
  // Funktionen entfernen
  map.removeInteraction(variableData.drawPnt);
  map.removeInteraction(variableData.snapGP);
  map.removeInteraction(variableData.snapHGP);
  map.removeInteraction(variableData.snapFP);
  // Buttonbeschriftung zuruecksetzen
  document.getElementById("but_create_pnt").innerHTML = "Punkt erfassen";
};

// Punktgeometrie modifizieren
variableData.modifyPnt = new Modify ({
  // Datenquelle
  source: intData.vect_Points.getSource(),
  // zu modifizierende Geometrie
  feature: variableData.featureToModify,
});
// Modifizieren beenden
function endModifyPntPoint() {
  variableData.state_modifyPntPoint = false;
  variableData.featureToModify = undefined;
  // Beenden-Button entfernen
  map.removeControl(saveModifyPnt);
  // Funktionen entfernen
  map.removeInteraction(variableData.snapGP)
  map.removeInteraction(variableData.snapHGP)
  map.removeInteraction(variableData.snapFP)
  map.removeInteraction(variableData.modifyPnt);
  // hinzufuegen Steuerungselemente Punkt- / Auftragserfassung
  map.addControl(createPnt);
  map.addControl(createJob);
};

// Kontrollmass
// ------------------------------------------------------------
// Instanziierung Kontrollmass zeichnen
variableData.drawChk = new Draw ({
  source: intData.vect_Checks.getSource(),
  type: 'LineString',
  // maximale Anzahl Punkte auf zwei begrenzen
  maxPoints: 2,
});
// beim Absetzen des ersten Punktes
variableData.drawChk.on('drawstart', function(evt){
  var startPointID = null;
  // Pruefung ob Anfangspunkt auf einem Vermarkungspunkt liegt
  // -> wenn nicht, Anfangspunkt entfernen  
  /* Quelle: Lydon. Ch. (12.04.2023). How to get Feature which is snaped by ol.interaction snap?
    stack overflow. URL: https://stackoverflow.com/questions/32194030/how-to-get-feature-which-is-snaped-by-ol-interaction-snap 
    [Abgerufen: 13.04.2023] */
  map.forEachFeatureAtPixel(evt.target.downPx_, function(feature, layer) {
    if (layer == intData.vect_Points) {
      startPointID = feature.get('pkt_pk_id')
    }; 
  });
  // kein Vermarkungspunkt -> Anfangspunkt entfernen
  if (startPointID == null) {
    variableData.drawChk.removeLastPoint();
  }
  // Vermarkungspunkt
  else {
    // Punkt ID zwischenspeichern -> Fremdschluessel
    variableData.chkLineStartPointID = startPointID;
    // Fangen auf Grenzpunkten usw. hinzufuegen
    map.addInteraction(variableData.snapGP);
    map.addInteraction(variableData.snapHGP);
    map.addInteraction(variableData.snapFP);
  };
});
// beim Beenden der Erfassung (zweiter Punkt)
variableData.drawChk.on('drawend', function(evt){
  var feature = evt.feature;
  // Standartwerte des Kontrollmass vergeben -> anpassbar in Popup
  feature.setProperties({
    ktr_fk_pkt: variableData.chkLineStartPointID,
    // Berechnung Soll-Distanz in mm
    ktr_soll: Math.round(feature.getGeometry().getLength() * 1000) / 1000,
    ktr_ist: null,
    });
  // Zeichnen beenden
  endDrawChkLine();
  // Buttonbeschriftung zuruecksetzen
  document.getElementById("but_create_chk").innerHTML = "Kontrollmass erfassen";
  // Popup oeffnen
  openCreateChkPopup(feature);
});
// Zeichnen beenden
function endDrawChkLine() {
  // Funktionen entfernen
  map.removeInteraction(variableData.drawChk);
  map.removeInteraction(variableData.snapChk);
  map.removeInteraction(variableData.snapGP);
  map.removeInteraction(variableData.snapHGP);
  map.removeInteraction(variableData.snapFP);
  variableData.chkLineStartPointID = null;
};





// WFS Transaktionen
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

// Popup-Eingaben abgreifen
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
// Auftragsnummer
function valuePU_job_num(){
  var val_job_num = document.getElementById('popup_j_val_num').value;
  return val_job_num;
};
// Gemeinde
function valuePU_job_com(){
  var job_com_id = document.getElementById('popup_j_val_com');
  var val_job_com = job_com_id.options[job_com_id.selectedIndex].text;
  return val_job_com;
};
// Art
function valuePU_job_typ(){
  var job_typ_id = document.getElementById('popup_j_val_typ');
  var val_job_typ = job_typ_id.options[job_typ_id.selectedIndex].text;
  return val_job_typ;
};
// Status
function valuePU_job_sts(){
  var job_sts_id = document.getElementById('popup_j_val_sts');
  var val_job_sts = job_sts_id.options[job_sts_id.selectedIndex].text;
  return val_job_sts;
};
// Erstellungsdatum
function valuePU_job_cre(){
  var val_job_cre = document.getElementById('popup_j_val_cre').value;
  return val_job_cre;
};
// Faelligkeit
function valuePU_job_dli(){
  var val_job_dli = document.getElementById('popup_j_val_dli').value;
  return val_job_dli;
};
// Abschlussdatum
function valuePU_job_end(){
  var val_job_end = document.getElementById('popup_j_val_end').value;
  return val_job_end;
};

// Punkt
// ------------------------------------------------------------
// Punktnummer
function valuePU_pnt_num(){
  var val_pnt_num = document.getElementById('popup_p_val_num').value;
  return val_pnt_num;
};
// Art
function valuePU_pnt_typ(){
  var pnt_typ_id = document.getElementById('popup_p_val_typ');
  var val_pnt_typ = pnt_typ_id.options[pnt_typ_id.selectedIndex].text;
  return val_pnt_typ;
};
// Versicherungsart
function valuePU_pnt_mrk(){
  var pnt_mrk_id = document.getElementById('popup_p_val_mrk');
  var val_pnt_mrk = pnt_mrk_id.options[pnt_mrk_id.selectedIndex].text;
  return val_pnt_mrk;
};
// Markierungsart (temporaere Versicherung bis Vermarkung)
function valuePU_pnt_tmrk(){
  var pnt_tmrk_id = document.getElementById('popup_p_val_tmrk');
  var val_pnt_tmrk = pnt_tmrk_id.options[pnt_tmrk_id.selectedIndex].text;
  return val_pnt_tmrk;
};
// Kontrolle
function valuePU_pnt_ctr(){
  var pnt_ctr_id = document.getElementById('popup_p_val_ctr');
  var val_pnt_ctr = pnt_ctr_id.options[pnt_ctr_id.selectedIndex].text;
  return val_pnt_ctr;
};
// Erstelldatum
function valuePU_pnt_fnl(){
  var val_pnt_fnl = document.getElementById('popup_p_val_fnl').value;
  return val_pnt_fnl;
};

// Kontrollmass
// ------------------------------------------------------------
// Sollmass
function valuePU_chk_shd(){
  var val_chk_shd = document.getElementById('popup_c_val_shd').value;
  return val_chk_shd;
};
// Istmass
function valuePU_chk_is(){
  var val_chk_is = document.getElementById('popup_c_val_is').value;
  return val_chk_is;
};

// Eingegebene Werte auf Vollstaendigkeit bzw. Wiederspruechlichkeit pruefen
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
function updateJobDB(typ, buttonID, changeList, changeFeature, changeLayer) {
  // Setzen der WFS Transaktion auf "true" um Laden der Datenquelle zu verhindern
  variableData.runningWFSTransaction = true;
  // Liste fuer fehlerhafte Eingabezellen
  var missingValues = [];
  // Liste fuer Weitergabe an eigentliche WFS Transaktion
  var attributeList = [];
  // abfragen und pruefen der Auftragsnummer
  // -> zwingende Eingabe (NOT NULL)
  if (changeList.includes(valuePU_job_num)) {
    var popupNumValue = valuePU_job_num();
    if (popupNumValue != '') {
      attributeList.push(['auftr_nummer', popupNumValue]);
    }
    else {
      missingValues.push('popup_j_val_num');
    };
  };
  // abfragen der Auftragsart (kein pruefen noetig - Dropdown)
  if (changeList.includes(valuePU_job_typ)) {
    var popupTypValue = valuePU_job_typ();
    attributeList.push(['auftr_typ', popupTypValue]);
  };
  // abfragen des Auftragstatus (kein pruefen noetig - Dropdown)
  if (changeList.includes(valuePU_job_sts) && buttonID == 'popup_but_save') {
    var popupStsValue = valuePU_job_sts();
    attributeList.push(['auftr_status', popupStsValue]);
  }
  // Auftragsstatus beim Erstellen eines Auftrages = 'Auftrag erfasst'
  else if (typ == 'insert') {
    attributeList.push(['auftr_status', 'erfasst']);
  }
  // Auftragsstatus beim Freigeben des Auftrages = 'bereit zur Vermarkung'
  else if (buttonID == 'popup_but_rele') {
    attributeList.push(['auftr_status', 'bereit zur Vermarkung']);
  }
  // Auftragsstatus beim Abschliessen der Vermarkung = 'Vermarkung erstellt'
  // -> zusaetzlich Vergabe Abschlussdatum
  else if (buttonID == 'popup_but_emrk') {
    attributeList.push(['auftr_status', 'Vermarkung erstellt']);
    var popupEndDate = new Date().toJSON().slice(0, 10);
    attributeList.push(['auftr_abschluss', popupEndDate])
  }
  // Auftragsstatus beim Abschliessen des Auftrages = 'archiviert'
  else if (buttonID == 'popup_but_arch') {
    attributeList.push(['auftr_status', 'archiviert'])
  };
  // abfragen und pruefen des Erfassungsdatums
  // -> zwingende Eingabe (NOT NULL)
  if (changeList.includes(valuePU_job_cre)) {
    // wenn ein neues Objekt erstellt wird -> aktuelles Datum
    if (typ == 'insert') {
      var popupCreValue = new Date().toJSON().slice(0, 10);
      attributeList.push(['auftr_erfassung', popupCreValue]);
    }
    // wenn ein bestehendes Objekt veraendert wird
    else {
      var popupCreValue = valuePU_job_cre();
      if (popupCreValue != '') {
        attributeList.push(['auftr_erfassung', popupCreValue]);
      }
      else {
        missingValues.push('popup_j_val_cre');
      };
    };
  };
  // abfragen und pruefen des Faelligkeitdatums (keine Eingabe erforderlich)
  if (changeList.includes(valuePU_job_dli)) {
    // wenn ein neues Objekt erstellt wird
    var popupCreValue = valuePU_job_dli();
    if (typ == 'insert' && popupCreValue != '') {
      attributeList.push(['auftr_faelligkeit', popupCreValue]);
    }
    else if (typ != 'insert') {
      attributeList.push(['auftr_faelligkeit', popupCreValue]);
    };
  };
  // abfragen und pruefen des Abschlussdatums
  if (changeList.includes(valuePU_job_end)) {
    var popupEndValue = valuePU_job_end();
    var popupStsValue = valuePU_job_sts();
    // Abschussdatum speichern wenn Status "Vermarkung erstellt" oder "archiviert"
    if (popupEndValue != '' && 
        (popupStsValue == 'Vermarkung erstellt' || popupStsValue == 'archiviert')){
      attributeList.push(['auftr_abschluss', popupEndValue]);
    }
    // Abschlussdatum vergeben aber nicht Status "Vermarkung erstellt" oder "archiviert"
    // -> Fehlermeldung
    else if (popupEndValue != '' 
             && popupStsValue != 'Vermarkung erstellt' 
             && popupStsValue != 'archiviert') {
      missingValues.push('popup_j_val_end');
      missingValues.push('popup_j_val_sts');
    }
    // "leeres" Abschlussdatum speichern wenn Status nicht "Vermarkung erstellt" oder "archiviert"
    else if (popupEndValue == '' && 
             (popupStsValue != 'Vermarkung erstellt' && popupStsValue != 'archiviert')) {
      attributeList.push(['auftr_abschluss', popupEndValue]);
    }
    // "leeres" Abschlussdatum aber Status "Vermarkung erstellt" oder "archiviert"
    else if (popupEndValue == '' &&
             (popupStsValue == 'Vermarkung erstellt' || popupStsValue == 'archiviert')) {
      missingValues.push('popup_j_val_end');
      missingValues.push('popup_j_val_sts');
    };
  };
  // keine Auftraege mit Status "erfasst" duerfen einen Punkt mit Kontrollmass aufweisen
  // -> nur Kontrollfunktion (Iteration durch Punkte bzw. Kontrollmasse)
  if (changeList.includes(valuePU_job_sts)) {
    var popupStsValue = valuePU_job_sts();
    if (popupStsValue == 'erfasst') {
      var jobWithCheck = false;
      var pntFK = changeFeature.get('auftr_pk_id');
      intData.vect_Points.getSource().getFeatures().forEach(function(point) {
        if (point.get('pkt_fk_auftr') == pntFK) {
          var chkFK = point.get('pkt_pk_id');
          intData.vect_Checks.getSource().getFeatures().forEach(function(check) {
            if (check.get('ktr_fk_pkt') == chkFK) {
              jobWithCheck = true;
            };
          });
        };
      });
      if (jobWithCheck) {
        missingValues.push('popup_j_val_sts');
      };
    };
  };
  // abfragen der Gemeinde (kein pruefen noetig - Drobdown)
  if (changeList.includes(valuePU_job_com)) {
    var popupTypValue = valuePU_job_com();
    attributeList.push(['auftr_gemeinde', popupTypValue]);
  };
  // Kontrolle der fehlerhaften Eingaben
  // -> wenn vorhanden => Fehlermeldung, keine Weitergabe an Transaktion
  if (missingValues.length > 0) {
    missingValues.forEach(popupObjID => cellFlasher(popupObjID, 'white', []));
    document.getElementById(buttonID).disabled = false;
  }
  // Ausfuehren der WFS-Transaktion (je nach Transaktionstyp)
  else {
    // deaktivieren Button
    document.getElementById(buttonID).disabled = true;
    // einfuegen (Erfassung)
    if (typ == 'insert') {
      // Weitergabeobjekt
      var new_feature = new Feature({
        auftr_flaeche: changeFeature.getGeometry(),
      });
      // Transaktion ausloesen
      changeWFSFeatureAuftrag(changeLayer, new_feature, 'insert', attributeList);
    }
    // bearbeiten
    else if (typ == 'update') {
      // Transaktion ausloesen
      changeWFSFeatureAuftrag(changeLayer, changeFeature, 'update', attributeList);
      // Popup schliessen
      popup.setPosition(undefined);
    }
    // loeschen
    else if (typ == 'delete') {
      // Transaktion ausloesen
      changeWFSFeatureAuftrag(changeLayer, changeFeature, 'delete', attributeList);
      // Popup schliessen
      popup.setPosition(undefined);
    };
  };
  // Setzen der WFS Transaktion auf "false" um Laden der Datenquelle zu ermoeglichen
  variableData.runningWFSTransaction = false;
};

// Punkt
// ------------------------------------------------------------
function updatePntDB(typ, buttonID, changeList, changeFeature, changeLayer) {
  // Setzen der WFS Transaktion auf "true" um Laden der Datenquelle zu verhindern
  variableData.runningWFSTransaction = true;
  // Liste fuer fehlerhafte Eingabezellen
  var missingValues = [];
  // Liste fuer Weitergabe an eigentliche WFS Transaktion
  var attributeList = [];
  // beim Erstellen eines Punktes zusaetzlich Fremdschluessel (PK Auftrag) mitgeben
  // -> zusaetzlich Vergabe Kontrolle
  if (typ == 'insert') {
    var popupFKValue = changeFeature.get('pkt_fk_auftr');
    attributeList.push(['pkt_fk_auftr', popupFKValue]);
    // Kontrolle = ausstehend
    attributeList.push(['pkt_kontrolle', 'ausstehend']);
  }
  // beim Abschliessen der Vermarkung eines Punktes -> Vermarkungsdatum = aktuelles Datum
  else if (buttonID == 'popup_but_emrk') {
    var popupEndMRKValue = new Date().toJSON().slice(0, 10);
    attributeList.push(['pkt_vermarkung', popupEndMRKValue])
  };
  // abfragen und pruefen der Punktnummer (keine Eingabe erforderlich)
  if (changeList.includes(valuePU_pnt_num)) {
    var popupNumValue = valuePU_pnt_num();
    if (popupNumValue == '') {
      popupNumValue = null;
    };
    attributeList.push(['pkt_nummer', popupNumValue]);
  };
  // abfragen der Punktart (kein pruefen noetig - Dropdown)
  if (changeList.includes(valuePU_pnt_typ)) {
    var popupTypValue = valuePU_pnt_typ();
    attributeList.push(['pkt_typ', popupTypValue]);
  };
  // abfragen der Punktmarkierung (kein pruefen noetig - Dropdown)
  if (changeList.includes(valuePU_pnt_tmrk)) {
    var popupTmrkValue = valuePU_pnt_tmrk();
    attributeList.push(['pkt_markierung', popupTmrkValue]);
  };
  // abfragen der Punktversicherung (kein pruefen noetig - Dropdown)
  if (changeList.includes(valuePU_pnt_mrk)) {
    var popupMrkValue = valuePU_pnt_mrk();
    attributeList.push(['pkt_versicherung', popupMrkValue]);
  };
  // abfragen des Vermarkungsdatums
  if (changeList.includes(valuePU_pnt_fnl)) {
    var popupFnlValue = valuePU_pnt_fnl();
    // Zulaessigkeit leerer Eingabe pruefen
    if (popupFnlValue == '') {
      var pointJobID = 'vermarkung_auftraege.' + changeFeature.get('pkt_fk_auftr')
      var pointJob = intData.vect_Jobs.getSource().getFeatureById(pointJobID);
      var pointJobState = pointJob.get('auftr_status')
      // wenn Status "Vermarkung erstellt" oder "archiviert" Datum muss zwingend vorhanden
      // -> Fehlermeldung
      if (pointJobState == 'archiviert' || pointJobState == 'Vermarkung erstellt') {
        missingValues.push('popup_p_val_fnl')
      }
      else {
        attributeList.push(['pkt_vermarkung', popupFnlValue]);
      };
    }
    else {
      attributeList.push(['pkt_vermarkung', popupFnlValue]);
    };  
  };
  // abfragen der Kontrolle
  if (changeList.includes(valuePU_pnt_ctr)) {
    var popupCtrValue = valuePU_pnt_ctr();
    // Wenn Kontrollart "Kontrollmass" ausgewaehlt, muss Kontrollmass vorhanden sein
    if (popupCtrValue == 'Kontrollmass') {
      var haveCheck = false
      var chkFK = changeFeature.get('pkt_pk_id');
      intData.vect_Checks.getSource().getFeatures().forEach(function(check) {
        if (check.get('ktr_fk_pkt') == chkFK && check.get('ktr_ist') != null) {
          haveCheck = true;
        };
      });
      // kein Kontrollmass vorhanden -> Fehlermeldung
      if (haveCheck == false) {
        missingValues.push('popup_p_val_ctr');
      };
    };
    attributeList.push(['pkt_kontrolle', popupCtrValue]);
  };
  // Kontrolle der fehlerhaften Eingaben
  // -> wenn vorhanden => Fehlermeldung, keine Weitergabe an Transaktion
  if (missingValues.length > 0) {
    missingValues.forEach(popupObjID => cellFlasher(popupObjID, 'white', []));
  }
  // Ausfuehren der WFS-Transaktion (je nach Transaktionstyp)
  else {
    // deaktivieren Button
    document.getElementById(buttonID).disabled = true;
    // einfuegen (Erfassung)
    if (typ == 'insert') {
      // Weitergabeobjekt
      var new_feature = new Feature({
        pkt_punkt: changeFeature.getGeometry(),
      });
      // Transaktion ausloesen
      changeWFSFeaturePunkt(changeLayer, new_feature, 'insert', attributeList);
    }
    // bearbeiten
    else if (typ == 'update') {
      // Transaktion ausloesen
      changeWFSFeaturePunkt(changeLayer, changeFeature, 'update', attributeList);
      // Popup schliessen
      popup.setPosition(undefined);
    }
    // loeschen
    else if (typ == 'delete') {
      // Transaktion ausloesen
      changeWFSFeaturePunkt(changeLayer, changeFeature, 'delete', attributeList);
      // Popup schliessen
      popup.setPosition(undefined);
    };
  };
  // Setzen der WFS Transaktion auf "false" um Laden der Datenquelle zu ermoeglichen
  variableData.runningWFSTransaction = false;
};

// Kontrollmass
// ------------------------------------------------------------
function updateChkDB(typ, buttonID, changeList, changeFeature, changeLayer) {
  // Setzen der WFS Transaktion auf "true" um Laden der Datenquelle zu verhindern
  variableData.runningWFSTransaction = true;
    // Liste fuer Weitergabe an eigentliche WFS Transaktion
  var attributeList = [];
  // beim Erstellen eines Kontrollmass zusaetzlich Fremdschluessel (PK Punkt) mitgeben
  var popupFKValue = changeFeature.get('ktr_fk_pkt');
  attributeList.push(['ktr_fk_pkt', popupFKValue]);
  // abfragen des Sollwertes (kein pruefen noetig)
  if (changeList.includes(valuePU_chk_shd)) {
    var popupShdValue = valuePU_chk_shd();
    if (popupShdValue == '') {
      popupShdValue = null;
    };
    attributeList.push(['ktr_soll', popupShdValue]);
  };
  // abfragen des Istwertes (kein pruefen noetig)
  if (changeList.includes(valuePU_chk_is)) {
    var popupIsValue = valuePU_chk_is();
    if (popupIsValue == '') {
      popupIsValue = null;
    };
    attributeList.push(['ktr_ist', popupIsValue]);
  };
  // Ausfuehren der WFS-Transaktion (je nach Transaktionstyp)
  // deaktivieren Button
  document.getElementById(buttonID).disabled = true;
  // einfuegen (Erfassung)
  if (typ == 'insert') {
    // Weitergabeobjekt
    var new_feature = new Feature({
      ktr_linie: changeFeature.getGeometry(),
    });
    // Transaktion ausloesen
    changeWFSFeatureKontrollmass(changeLayer, new_feature, 'insert', attributeList);
  }
  else if (typ == 'update') {
    // Transaktion ausloesen
    changeWFSFeatureKontrollmass(changeLayer, changeFeature, 'update', attributeList);
    // Popup schliessen
    popup.setPosition(undefined);
  }
  else if (typ == 'delete') {
    // Transaktion ausloesen
    changeWFSFeatureKontrollmass(changeLayer, changeFeature, 'delete', attributeList);
    // Popup schliessen
    popup.setPosition(undefined);
  };
    // Setzen der WFS Transaktion auf "false" um Laden der Datenquelle zu ermoeglichen
    variableData.runningWFSTransaction = false;

  // beim Loeschen Kontrollart Punkt aktualisieren
  // -> wenn aktuell auf Kontrollmass und kein weiteres Kontrollmass vorhanden => ausstehend
  if (typ == 'delete') {
    var checksOfPoint = []
    var chkFK = changeFeature.get('ktr_fk_pkt')
    // Iteration durch Punktelemente
    intData.vect_Checks.getSource().getFeatures().forEach(function(check) {
      if (check.get('ktr_fk_pkt') == chkFK) {
        checksOfPoint.push(check);
      };
    });
    if (checksOfPoint.length <= 1) {
      var pnt = intData.vect_Points.getSource().getFeatureById('vermarkung_grenzpunkte.' + chkFK);
      if (pnt.get('pkt_kontrolle') == 'Kontrollmass') {
        // Transaktion Punkt ausloesen
        changeWFSFeaturePunkt(intData.vect_Points, pnt, 'update', [['pkt_kontrolle', 'ausstehend']]);
      };  
    };
  };
};





// Senden von Transaktionen an den WFS-Dienst
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

/* Quelle: Bereuter. Pia. & Zanda. Adriana. & Eugster. Hannes. (2023). 6240 E03 Web GIS GeoServer.
   Uebungsanleitung. unveroeffentlicht */

// Auftrag
// ------------------------------------------------------------
function changeWFSFeatureAuftrag (vectLayer, feature, transactTyp, changeList) {
  // Aenderungen aus Popup in Objekt-Attribute uebertragen
  for (let i = 0; i < changeList.length; i++) {
    feature.set(changeList[i][0], changeList[i][1]);
  }
  // Geometrienamen setzen
  feature.setGeometryName('auftr_flaeche');
  // Verbindungseinstellungen
  var transactWFS = function (mode, f) {
    var formatWFS = new WFS();
    var formatGML = new GML({
      featureNS: intData.server_workspace_URI,
      featurePrefix: intData.server_workspace,
      featureType: intData.server_job_layer,
      //srsName: 'EPSG:2056'
    });
    var xs = new XMLSerializer();
    var node;
    switch (mode) {
      case 'insert':
        node = formatWFS.writeTransaction([f], null, null, formatGML);
        break;
      case 'update':
        node = formatWFS.writeTransaction(null, [f], null, formatGML);
        break;
      case 'delete':
        node = formatWFS.writeTransaction(null, null, [f], formatGML);
        break;
    }
    postString = xs.serializeToString(node)   
  };
  var postString = null;
  // Generierung XML mit OL
  transactWFS(transactTyp, feature)
  var url = intData.server_url; 
  var method = "POST";
  // asynchrone Abfragen erlauben, sonst werden alle Interaktion bis zur Serverantwort blockiert
  var async = true;
  var request = new XMLHttpRequest();
  request.open(method, url, async);
  request.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");
  request.send(postString);

  request.onload = function() {
    var status = request.status;
    var data = request.responseText;
    // Ausgabe der Rückgabewerte in die Konsole 
    console.log(status);
    console.log(data);
    // Datenquellen aktualisieren
    vectLayer.getSource().clear();
    vectLayer.getSource().refresh();
    intData.vect_Points.getSource().clear();
    intData.vect_Points.getSource().refresh();
    intData.vect_Checks.getSource().clear();
    intData.vect_Checks.getSource().refresh();

    // beim Erfassen eines neuen Auftrages automatisches Oeffnen des Popups im Erfassungsmodus
    if (transactTyp == 'insert') {
      // Lesen der XML-Amtwort
      /* Quelle: w3school. (o. d.). XML Parser. w3school.
         URL: https://www.w3schools.com/xml/xml_parser.asp 
         [Abgerufen: 01.05.2023] */
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml")
      // Feature ID
      const id_newFeature = xmlDoc.getElementsByTagName('wfs:Feature')[0].childNodes[0].getAttribute('fid')
      // Funktion zum Oeffnen des Popups
      async function getNewJobPopup(){
        // warten bis Datenquelle vollstaendig geladen
        await waitUntil(() => vectLayer.getSource().getFeatures().length > 0);
        // abrufen der Auftrags-Informationen
        var job_feature = vectLayer.getSource().getFeatureById(id_newFeature);
        var job_extent = job_feature.getGeometry().getExtent();
        var job_center = getCenter(job_extent)
        var job_attribute = getJobFeatureAttribute(job_feature);
        // oeffnen des Popups
        openPopupJobCAP(job_center, job_feature, job_attribute);
      };
      // Popup oeffnen (Erfassungsmodus)
      getNewJobPopup();
    };
  };
};

// Punkt
// ------------------------------------------------------------
function changeWFSFeaturePunkt (vectLayer, feature, transactTyp, changeList) {
  // Aenderungen aus Popup in Objekt-Attribute uebertragen
  for (let i = 0; i < changeList.length; i++) {
    feature.set(changeList[i][0], changeList[i][1]);
  };
  // Geometrienamen setzen
  feature.setGeometryName('pkt_punkt');
  // Verbindungseinstellungen
  var transactWFS = function (mode, f) {
    var formatWFS = new WFS();
    var formatGML = new GML({
      featureNS: intData.server_workspace_URI,
      featurePrefix: intData.server_workspace,
      featureType: intData.server_pnt_layer,
      //srsName: 'EPSG:2056'
    });
    var xs = new XMLSerializer();
    var node;
    switch (mode) {
      case 'insert':
        node = formatWFS.writeTransaction([f], null, null, formatGML);
        break;
      case 'update':
        node = formatWFS.writeTransaction(null, [f], null, formatGML);
        break;
      case 'delete':
        node = formatWFS.writeTransaction(null, null, [f], formatGML);
        break;
    }
    postString = xs.serializeToString(node)   
  };
  var postString = null;
  // Generierung XML mit OL
  transactWFS(transactTyp, feature)
  var url = intData.server_url; 
  var method = "POST";
  var async = true;
  // asynchrone Abfragen erlauben, sonst werden alle Interaktion bis zur Serverantwort blockiert
  var request = new XMLHttpRequest();
  request.open(method, url, async);
  request.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");
  request.send(postString);

  request.onload = function() {
    var status = request.status;
    var data = request.responseText;
    // Ausgabe der Rückgabewerte in die Konsole 
    console.log(status);
    console.log(data);
    // Datenquellen aktualisieren
    vectLayer.getSource().clear();
    vectLayer.getSource().refresh();
    intData.vect_Jobs.getSource().clear();
    intData.vect_Jobs.getSource().refresh();
    intData.vect_Points.getSource().clear();
    intData.vect_Points.getSource().refresh();

    // beim Erfassen eines neuen Punktes automatisches Oeffnen des Popups im Erfassungsmodus
    if (transactTyp == 'insert') {
      // Lesen der XML-Amtwort
      /* Quelle: w3school. (o. d.). XML Parser. w3school.
         URL: https://www.w3schools.com/xml/xml_parser.asp 
         [Abgerufen: 01.05.2023] */
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml")
      // Feature ID
      const id_newFeature = xmlDoc.getElementsByTagName('wfs:Feature')[0].childNodes[0].getAttribute('fid')
      // Funktion zum Oeffnen des Popups
      async function getNewPntPopup(){
        // warten bis Datenquelle vollstaendig geladen
        await waitUntil(() => vectLayer.getSource().getFeatures().length > 0);
        // abrufen der Auftrags-Informationen
        var pnt_feature = vectLayer.getSource().getFeatureById(id_newFeature);
        var pnt_attribute = getPntFeatureAttribute(pnt_feature);
        // oeffnen des Popups
        openPopupPntCAP(pnt_feature, pnt_attribute);
      };
      // Popup oeffnen (Erfassungsmodus)
      getNewPntPopup();
    };
  };
};

// Kontrollmasse
// ------------------------------------------------------------
function changeWFSFeatureKontrollmass (vectLayer, feature, transactTyp, changeList) {
  // Aenderungen aus Popup in Objekt-Attribute uebertragen
  for (let i = 0; i < changeList.length; i++) {
   feature.set(changeList[i][0], changeList[i][1]);
  };
  // Geometrienamen setzen
  feature.setGeometryName('ktr_linie');
  // Verbindungseinstellungen
  var transactWFS = function (mode, f) {
    var formatWFS = new WFS();
    var formatGML = new GML({
      featureNS: intData.server_workspace_URI,
      featurePrefix: intData.server_workspace,
      featureType: intData.server_chk_layer,
      //srsName: 'EPSG:2056'
    });
    var xs = new XMLSerializer();
    var node;
    switch (mode) {
      case 'insert':
        node = formatWFS.writeTransaction([f], null, null, formatGML);
        break;
      case 'update':
        node = formatWFS.writeTransaction(null, [f], null, formatGML);
        break;
      case 'delete':
        node = formatWFS.writeTransaction(null, null, [f], formatGML);
        break;
    }
    postString = xs.serializeToString(node)   
  };
  var postString = null;
  // Generierung XML mit OL
  transactWFS(transactTyp, feature)
  var url = intData.server_url; 
  var method = "POST";
  var async = true;
  // asynchrone Abfragen erlauben, sonst werden alle Interaktion bis zur Serverantwort blockiert
  var request = new XMLHttpRequest();
  request.open(method, url, async);
  request.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");
  request.send(postString);

  request.onload = function() {
    var status = request.status;
    var data = request.responseText;
    // Ausgabe der Rückgabewerte in die Konsole 
    console.log(status);
    console.log(data);
    // Datenquellen aktualisieren
    vectLayer.getSource().clear();
    vectLayer.getSource().refresh();
    intData.vect_Jobs.getSource().clear();
    intData.vect_Jobs.getSource().refresh();
    intData.vect_Points.getSource().clear();
    intData.vect_Points.getSource().refresh();

    // beim Erfassen eines neuen Kontrollmas automatisches Oeffnen des Popups im Vermarkungsmodus
    if (transactTyp == 'insert') {
      // Lesen der XML-Amtwort
      /* Quelle: w3school. (o. d.). XML Parser. w3school.
         URL: https://www.w3schools.com/xml/xml_parser.asp 
         [Abgerufen: 01.05.2023] */
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml")
      // Feature ID
      const id_newFeature = xmlDoc.getElementsByTagName('wfs:Feature')[0].childNodes[0].getAttribute('fid')
      // Funktion zum Oeffnen des Popups
      async function getNewChkPopup(){
        // warten bis Datenquelle vollstaendig geladen
        await waitUntil(() => vectLayer.getSource().getFeatures().length > 0);
        // abrufen der Auftrags-Informationen
          var chk_feature = vectLayer.getSource().getFeatureById(id_newFeature);
          var chk_attribute = getChkFeatureAttribute(chk_feature);
          // oeffnen des Popups
          openPopupChkMRK(chk_feature, chk_attribute);
        };
      // Popup oeffnen (Vermarkungsmodus)
      getNewChkPopup()
    };
  };
};
// -------------------------------------------------------------------------------------------------