/* Dieses File dient der Erstellung der Legenden-Inhalte. 
   Pro Modus wird jeweils eine neue, angepasste Legende generiert. */

// -------------------------------------------------------------------------------------------------

// Import
import {Control} from 'ol/control.js';
import colorData from './color_values';

// Erstellen der einzelnen Inhalte (Zeilen)
// -------------------------------------------------------------------------------------------------

// Auftrag
// ------------------------------------------------------------
// Auftrag erfasst
const row_job_cre = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="width:14px;height:14px;border:3px dashed ' + 
                          colorData.clr_j_cre_line + ';background-color:' + 
                          colorData.clr_j_cre_fill + ';"></div>' +
                      '</td>' +
                      '<td>Auftrag erfasst</td>' +
                    '</tr>';
// Auftrag erfasst (VZ - Vermarkung zurueckgestellt)
const row_job_cre_VZ =  '<tr style="height:20px">' +
                          '<td>' +
                            '<div style="width:14px;height:14px;border:3px dashed ' + 
                              colorData.clr_j_cre_vz_line + ';background-color:' + 
                              colorData.clr_j_cre_vz_fill + ';"></div>' +
                          '</td>' +
                          '<td>Auftrag erfasst (VZ)</td>' +
                        '</tr>';
// Auftrag erfasst (PM - Projektmutation)
const row_job_cre_PM =  '<tr style="height:20px">' +
                          '<td>' +
                            '<div style="width:14px;height:14px;border:3px dashed ' + 
                              colorData.clr_j_cre_pm_line + ';background-color:' + 
                              colorData.clr_j_cre_pm_fill + ';"></div>' +
                          '</td>' +
                          '<td>Auftrag erfasst (PM)</td>' +
                        '</tr>';
// bereit zur Vermarkung
const row_job_rdy = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="width:14px;height:14px;border:3px dashed ' +
                          colorData.clr_j_rdy_line + ';background-color:' + 
                          colorData.clr_j_rdy_fill + ';"></div>' +
                      '</td>' +
                      '<td>bereit zur Vermarkung</td>' +
                    '</tr>';
// Vermarkung erstellt
const row_job_fin = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="width:14px;height:14px;border:3px dashed ' + 
                          colorData.clr_j_mk_line + ';background-color:' +
                          colorData.clr_j_mk_fill + ';"></div>' +
                      '</td>' +
                      '<td>Vermarkung erstellt</td>' +
                    '</tr>';
// Auftrag archiviert
const row_job_arc = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="width:14px;height:14px;border:3px dashed ' + 
                          colorData.clr_j_arc_line + ';background-color:' + 
                          colorData.clr_j_arc_fill + ';"></div>' +
                      '</td>' +
                      '<td>Auftrag archiviert</td>' +
                    '</tr>';

// Punkte
// ------------------------------------------------------------
// Punkt erfasst
const row_pnt_cre = '<tr style="height:20px">' +
                      '<td>' + 
                        '<div style="position:relative;top:-1px;left:4px;width:7px;height:7px;border:2px solid ' +
                          colorData.clr_p_cre_line + ';border-radius: 25px;background-color:' +
                          colorData.clr_p_cre_fill + ';"></div>' +
                      '</td>' +
                      '<td>Punkt erfasst</td>' +
                    '</tr>';
// Punkt vermarkt / entfernt
const row_pnt_dne = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="position:relative;top:-1px;left:4px;width:7px;height:7px;border:2px solid ' +
                          colorData.clr_p_mk_line + ';border-radius: 25px;background-color:' + 
                          colorData.clr_p_mk_fill + ';"></div>' +
                      '</td>'+
                      '<td>Punkt vermarkt / entfernt</td>' +
                    '</tr>';
// Punkt kontrolliert
const row_pnt_che = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="position:relative;top:-1px;left:4px;width:7px;height:7px;border:2px solid ' +
                          colorData.clr_p_ck_line + ';border-radius: 25px;background-color:' + 
                          colorData.clr_p_ck_fill + ';"></div>' +
                      '</td>'+
                      '<td>Punkt kontrolliert</td>' +
                    '</tr>';

// Kontrollmasse
// ------------------------------------------------------------
// Kontrollmass vollstaendig
const row_chk_cmp = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="position:relative;width:14px;height:2px;border:none;background-color:' + 
                          colorData.clr_c_all_cmpl + ';"></div>' +
                      '</td>'+
                      '<td>Kontrollmass vollständig</td>' +
                    '</tr>';
// Kontrollmass unvollstaendig
const row_chk_inc = '<tr style="height:20px">' +
                      '<td>' +
                        '<div style="position:relative;width:14px;height:2px;border:none;background-color:' + 
                          colorData.clr_c_all_incmpl + ';"></div>' +
                      '</td>'+
                      '<td>Kontrollmass unvollständig</td>' +
                    '</tr>';


// Erstellen Legende pro Modus
// ------------------------------------------------------------------------------------------------------------------------
// Zusammenfuegen der Ausgewaehlten Elemente in eine Legende
function createLegendHTML (elementList) {
  var temp_inlineHTML = '';
  temp_inlineHTML += '<th colspan="2">Legende</th>';
  elementList.forEach(element => {
    temp_inlineHTML += element;    
  });
  return temp_inlineHTML
};

// Modus Uebersicht
class tablelegendOverview extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_overview';
    table.innerHTML = createLegendHTML([row_job_cre,
                                        row_job_cre_VZ,
                                        row_job_cre_PM,
                                        row_job_rdy,
                                        row_job_fin,
                                        row_pnt_cre,
                                        row_pnt_dne,
                                        row_pnt_che]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendOverview = new tablelegendOverview();

//  Modus 01 Erfassung
class tablelegendCapture extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_capture';
    table.innerHTML = createLegendHTML([row_job_cre,
                                        row_job_cre_VZ,
                                        row_job_cre_PM,
                                        row_pnt_cre,
                                        row_pnt_dne,
                                        row_pnt_che]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendCapture = new tablelegendCapture();

// Modus 02 Vermarkung
class tablelegendMarking extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_marking';
    table.innerHTML = createLegendHTML([row_job_rdy,
                                        row_pnt_cre,
                                        row_pnt_dne,
                                        row_pnt_che,
                                        row_chk_cmp,
                                        row_chk_inc]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendMarking = new tablelegendMarking();

// Modus 03 Erledigt
class tablelegendDone extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_done';
    table.innerHTML = createLegendHTML([row_job_fin,
                                        row_pnt_dne,
                                        row_pnt_che,
                                        row_chk_cmp,
                                        row_chk_inc]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendDone = new tablelegendDone();

// Modus 04 VZ / PM
class tablelegendMarkingWait extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_markingwait';
    table.innerHTML = createLegendHTML([row_job_cre_VZ,
                                        row_job_cre_PM,
                                        row_pnt_cre,
                                        row_pnt_dne,
                                        row_pnt_che]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendMarkingWait = new tablelegendMarkingWait();

// Modus 05 Vermarkung zurueckgestellt
class tablelegendArchive extends Control {
  constructor() {
    const table = document.createElement('table');
    table.id = 'legend_archive';
    table.innerHTML = createLegendHTML([row_job_arc,
                                        row_pnt_che]);
    const element = document.createElement('div');
    element.className = 'legend  ol-unselectable ol-control';
    element.appendChild(table);
    super({
      element: element,
    });
  };
};
var legendArchive = new tablelegendArchive();

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  // vordefinierte Legenden
  legendOverview,
  legendCapture,
  legendMarking,
  legendDone,
  legendMarkingWait,
  legendArchive,
  // Inhalt
  row_job_cre,
  row_job_cre_VZ,
  row_job_cre_PM,
  row_job_rdy,
  row_job_fin,
  row_job_arc,
  row_pnt_cre,
  row_pnt_dne,
  row_pnt_che,
  // Erstellfunktion
  createLegendHTML,
};
// -------------------------------------------------------------------------------------------------