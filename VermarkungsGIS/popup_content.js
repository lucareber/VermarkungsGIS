/* Dieses File dient der Erstellung der Popup-Inhalte. 
  Pro Attribut steht eine Textdarstellung, sowie ein Input zur Verfügung. Diese werden dem Zustand
  des Objekts und dem Modus entsprechend zu einem Popup zusammengefügt. */

// -------------------------------------------------------------------------------------------------

// Import
import dropdownData from './dropdown_values.js'
import communityData from './community_values.js'
import colorData from './color_values.js'

// Validierung und Bearbeitung von Daten (Darstellung und Uebergabe GeoServer)
// -------------------------------------------------------------------------------------------------
// Umformen des Datums aus dem WFS-Dienst in die deutsche Schreibweise
function unformDatetoDE (date) {
  if (date != undefined) {
    return date.split("-")[2] + '.' + date.split("-")[1] + '.' + date.split("-")[0];
  }
  else {
    return '';
  };
};
// Ueberpruefen, ob ein Datum in der Datenbank festgelegt ist.
function checkDateExist (date, id_string) {
  if (date != undefined) {
    return date;
  }
  else {
    return '';
  };
};

// Attribute der Auftraege
// -------------------------------------------------------------------------------------------------
// Auftragnummer
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_num(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Nummer</td>'+
            '<td class="popup_col">' + valueList[2] + '</td>' +
          '</tr>';
};
// Eingabe als Text -> Bearbeitung moeglich
function inpt_job_num(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Nummer</td>'+
            '<td class="popup_col">' + 
              '<input class="popup_input_num" id="popup_j_val_num" type="text" value=' + valueList[2] + '></input>' + 
            '</td>' +
          '</tr>';
};
// Art
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_typ(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Art</td>'+
            '<td class="popup_col">' + valueList[1] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_job_typ(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Art</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_j_val_typ" name="art">' +
              '<option value="none" selected disabled hidden>' + valueList[1] + '</option>' +
              dropdownData.dropdown_J_typ_inline +
            '</select></td>' +
          '</tr>';
};

// Status
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_sts(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Status</td>'+
            '<td class="popup_col">' + valueList[3] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_job_sts(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Status</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_j_val_sts" name="status">' +
              '<option value="none" selected disabled hidden>' + valueList[3] + '</option>' +
              dropdownData.dropdown_J_state_inline +
            '</select></td>' +
          '</tr>';
};
// Datum Erfassung
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_cre(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Erfassung</td>'+
            '<td class="popup_col" id="popup_j_val_cre">' + unformDatetoDE(valueList[4]) + '</td>' +
          '</tr>';
};
// Eingabe als Datum -> Bearbeitung moeglich
function inpt_job_cre(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Erfassung</td>'+
            '<td class="popup_col">' + 
              '<input class="popup_input_date" id="popup_j_val_cre" type="date" value=' + checkDateExist(valueList[4]) + '></input>' + 
            '</td>' +
          '</tr>';
};
// Datum Faelligkeit
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_dli(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Fälligkeit</td>'+
            '<td class="popup_col" id="popup_j_val_dli">' + unformDatetoDE(valueList[5]) + '</td>' +
          '</tr>';
};
// Eingabe als Datum -> Bearbeitung moeglich
function inpt_job_dli(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Fälligkeit</td>'+
            '<td class="popup_col">' + 
              '<input class="popup_input_date" id="popup_j_val_dli" type="date" value=' + checkDateExist(valueList[5]) + '></input>' + 
            '</td>' +
          '</tr>';
};
// Datum Abschluss
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_end(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Abschluss</td>'+
            '<td class="popup_col" id="popup_j_val_end">' + unformDatetoDE(valueList[6]) + '</td>' +
          '</tr>';
};
// Eingabe als Datum -> Bearbeitung moeglich
function inpt_job_end(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Abschluss</td>'+
            '<td class="popup_col"><input class="popup_input_date" id="popup_j_val_end" type="date" value=' + checkDateExist(valueList[6]) + '></input></td>' +
          '</tr>';
};
// Gemeinde
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_com(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Gemeinde</td>'+
            '<td class="popup_col">' + valueList[7] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_job_com(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Gemeinde</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_j_val_com" name="gemeinde">' +
              '<option value="none" selected disabled hidden>' + valueList[7] + '</option>' +
              communityData.dropdown_J_com_inline() +
            '</select></td>' +
          '</tr>';
};
// Anzahl Vermarkungspunkte
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_job_pnt(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Punkte</td>'+
            '<td class="popup_col">' + valueList[9].length + '</td>' +
          '</tr>';
};
// Textdarstellung mit Stand der Punkte -> keine Bearbeitung moeglich
function text_job_pnt2(valueList){
  var numPointsCre = 0;
  var numPointsMrk = 0;
  var numPointsChk = 0;
  valueList[9].forEach(function(point){
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
  return  '<tr>' +
            '<td class="popup_col">Punkte</td>'+
            '<td id="popup_num_pnts" class="popup_col">' + 
              '<a style="color:black;">' + valueList[9].length + ' (</a>' + 
              '<a style="color:' + colorData.clr_p_cre_line + ';">' + numPointsCre + '</a>' +
              '<a style="color:black;"> / </a>' +  
              '<a style="color:' + colorData.clr_p_mk_line + ';">' + numPointsMrk + '</a>' + 
              '<a style="color:black;"> / </a>' + 
              '<a style="color:' + colorData.clr_p_ck_line + ';">' + numPointsChk + '</a>' + 
              '<a style="color:black;">)</a>' + 
            '</td>' +
          '</tr>';
};

// Attribute der Punkte
// -------------------------------------------------------------------------------------------------
// Punktnummer
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_num(valueList) {
    // wenn kein Wert vergeben ist
    if (valueList[3] == null) {
        return  '<tr>' +
                    '<td class="popup_col">Nummer</td>'+
                    '<td class="popup_col">' + ' ' + '</td>' +
                '</tr>';
    }
    else {
        return  '<tr>' +
                    '<td class="popup_col">Nummer</td>'+
                    '<td class="popup_col">' + valueList[3] + '</td>' +
                '</tr>';
    };
};
// Eingabe als Zahl -> Bearbeitung moeglich
function inpt_pnt_num(valueList) {
  // wenn kein Wert vergeben ist
  if (valueList[3] == null) {
    return  '<tr>' +
              '<td class="popup_col">Nummer</td>'+
              '<td class="popup_col">' + 
                '<input class="popup_input_num skip-char" id="popup_p_val_num" type="number" ></input>' +
              '</td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Nummer</td>'+
              '<td class="popup_col">' + 
                '<input class="popup_input_num skip-char" id="popup_p_val_num" type="number" value=' + valueList[3] + '></input>' + 
              '</td>' +
            '</tr>';
  };
};
// Art
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_typ(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Art</td>'+
            '<td class="popup_col">' + valueList[2] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_pnt_typ(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Art</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_p_val_typ" name="typ">' +
              '<option value="none" selected disabled hidden>' + valueList[2] + '</option>' +
              dropdownData.dropdown_P_typ_inline +
            '</select></td>' +
          '</tr>';
};
// Markierung
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_tmrk(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Markierung</td>'+
            '<td class="popup_col">' + valueList[4] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_pnt_tmrk(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Markierung</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_p_val_tmrk" name="tempmarker">' +
              '<option value="none" selected disabled hidden>' + valueList[4] + '</option>' +
              dropdownData.dropdown_P_tempmarker_inline +
            '</select></td>' +
          '</tr>';
};
// Versicherung
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_mrk(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Versicherung</td>'+
            '<td class="popup_col">' + valueList[5] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_pnt_mrk(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Versicherung</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_p_val_mrk" name="marker">' +
              '<option value="none" selected disabled hidden>' + valueList[5] + '</option>' +
              dropdownData.dropdown_P_marker_inline +
            '</select></td>' +
          '</tr>';
};
// Kontrolle
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_ctr(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Kontrolle</td>'+
            '<td class="popup_col">' + valueList[6] + '</td>' +
          '</tr>';
};
// Eingabe als Dropdown-Menue -> Bearbeitung moeglich
function inpt_pnt_ctr(valueList){
  return  '<tr>' +
            '<td class="popup_col">Kontrolle</td>'+
            '<td class="popup_col"><select class="popup_select" id="popup_p_val_ctr" name="control">' +
              '<option value="none" selected disabled hidden>' + valueList[6] + '</option>' +
              dropdownData.dropdown_P_control_inline +
            '</select></td>' +
          '</tr>';
};
// Datum Erstellung Vermarkung
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_pnt_fnl(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Erstellung</td>'+
            '<td class="popup_col" id="popup_p_val_fnl">' + unformDatetoDE(valueList[7]) + '</td>' +
          '</tr>';
};
// Eingabe als Datum -> Bearbeitung moeglich
function inpt_pnt_fnl(valueList) {
  return  '<tr>' +
            '<td class="popup_col">Erstellung</td>'+
            '<td class="popup_col">' + 
              '<input class="popup_input_date" id="popup_p_val_fnl" type="date" value=' + checkDateExist(valueList[7]) + '></input>' + 
              '</td>' +
          '</tr>';
};

// Attribute der Kontrollmasse
// -------------------------------------------------------------------------------------------------
// Soll-Mass
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_chk_shd(valueList) {
  // wenn kein Wert vergeben ist
  if (valueList[2] == null) {
    return  '<tr>' +
              '<td class="popup_col">Soll [in m]</td>'+
              '<td class="popup_col">' + ' ' + '</td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Soll [in m]</td>'+
              '<td class="popup_col">' + valueList[2].toFixed(3) + '</td>' +
            '</tr>';
  };
};
// Eingabe als Zahl -> Bearbeitung moeglich
function inpt_chk_shd(valueList) {
  // wenn kein Wert vergeben ist
  if (valueList[2] == null) {
    return  '<tr>' +
              '<td class="popup_col">Soll [in m]</td>'+
              '<td class="popup_col"> ' + 
                '<input class="popup_input_num" id="popup_c_val_shd" type="number" ></input>' + 
              '</td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Soll [in m]</td>'+
              '<td class="popup_col">' +
                '<input class="popup_input_num" id="popup_c_val_shd" type="number" value=' + valueList[2] + '></input>' +
              '</td>' +
            '</tr>';
  };
};
// Ist-Mass
// ------------------------------------------------------------
// Textdarstellung -> keine Bearbeitung moeglich
function text_chk_is(valueList) {
  // wenn kein Wert vergeben ist
  if (valueList[3] == null) {
    return  '<tr>' +
              '<td class="popup_col">Ist [in m]</td>'+
              '<td class="popup_col">' + ' ' + '</td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Ist [in m]</td>'+
              '<td class="popup_col">' + valueList[3].toFixed(3) + '</td>' +
            '</tr>';
  };
};
// Eingabe als Zahl -> Bearbeitung moeglich
function inpt_chk_is(valueList) {
  // wenn kein Wert vergeben ist
  if (valueList[3] == null) {
    return  '<tr>' +
              '<td class="popup_col">Ist [in m]</td>'+
              '<td class="popup_col"><input class="popup_input_num" id="popup_c_val_is" type="number" ></input></td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Ist [in m]</td>'+
              '<td class="popup_col">' +
                '<input class="popup_input_num" id="popup_c_val_is" type="number" value=' + valueList[3] + '></input>' +
              '</td>' +
            '</tr>';
  };
};
// Berechnung Differenz zwischen Soll und Ist (Absolutwert)
// ------------------------------------------------------------
function text_chk_diff(valueList) {
  if (valueList[2] == null || valueList[3] == null) {
    return  '<tr>' +
              '<td class="popup_col">Differenz [in m]</td>'+
              '<td class="popup_col">' + ' ' + '</td>' +
            '</tr>';
  }
  else {
    return  '<tr>' +
              '<td class="popup_col">Differenz [in m]</td>'+
              '<td class="popup_col">' + (Math.round(Math.abs(valueList[2] - valueList[3])*1000)/1000).toFixed(3) + '</td>' +
            '</tr>';
  };
};

// Buttons zum aufrufen von Funktionen
// -------------------------------------------------------------------------------------------------
// Bearbeitungsmenue oeffnen
function but_edit() {
  return  '<button class="popup_button_pic" id="popup_but_edit">' +
            '<img class="popup_icon" src="./img/gear-solid.svg" alt="gear"></img>' +
          '</button>'
};
// Geometrie bearbeiten
function but_modi() {
  return  '<button class="popup_button_pic" id="popup_but_modi">' + 
            '<img class="popup_icon" src="./img/pen-solid.svg" alt="pen"></img>' +
          '</button>'
};
// Objekt loeschen
function but_dele() {
  return  '<button class="popup_button_pic" id="popup_but_dele">' +
            '<img class="popup_icon" src="./img/trash-can-solid.svg" alt="trash"></img>' +
          '</button>'
};
// Speichern
function but_save() {
  return '<button class="popup_button" id="popup_but_save">Speichern</button>'
};
// Freigabe fuer die Vermarkung
function but_rele() {
  return '<button class="popup_button" id="popup_but_rele">Freigeben</button>'
};
// Abschluss der Vermarkung (Vergroesserung des Buttons -> width = 200px)
function but_emrk() {
  return  '<button class="popup_button" id="popup_but_emrk" style="width: 200px;">' + 
            'Vermarkung abschliessen' + 
          '</button>'
};
// Archivierung des Auftrages (Vergroesserung des Buttons -> width = 200px)
function but_arch() {
  return  '<button class="popup_button" id="popup_but_arch" style="width: 200px;">' + 
            'Auftrag archivieren' + 
          '</button>'
};

// Abfuellen eines Popups nach den Eingabeparametern
// -------------------------------------------------------------------------------------------------
// Parameter:
//  typ: Unterscheidung zwischen Auftrag-Popup, Punkt-Popup und Kontrollmass-Popup
//  contentList: Inhalt des Popups als Liste
//  attributeList: Attribute des Objekts als Liste
//  buttonListTop: Buttons neben dem Titel als Liste
//  buttonListDown: Buttons unterhalb Informationen als Liste
function fillPopup(typ, contentList, attributeList, buttonListTop, buttonListDown){
var codeHTML =  '<a class="popup_title">' + typ + '</a><table class="popup_table">';
if (buttonListTop.length > 0){
    buttonListTop.forEach(button => codeHTML += button());
};
contentList.forEach(content => codeHTML += content(attributeList));
codeHTML += '</table>';
if (buttonListDown.length > 0){
    codeHTML += '<div class="popup_buttongroup">';
    buttonListDown.forEach(button => codeHTML += button());
    codeHTML += '<div>';
};
return codeHTML;
};

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  fillPopup,
  // Elemente Auftrag
  text_job_num,
  inpt_job_num,
  text_job_typ,
  inpt_job_typ,
  text_job_sts,
  inpt_job_sts,
  text_job_cre,
  inpt_job_cre,
  text_job_dli,
  inpt_job_dli,
  text_job_end,
  inpt_job_end,
  text_job_com,
  inpt_job_com,
  text_job_pnt,
  text_job_pnt2,
  // Elemente Punkt
  text_pnt_num,
  inpt_pnt_num,
  text_pnt_typ,
  inpt_pnt_typ,
  text_pnt_tmrk,
  inpt_pnt_tmrk,
  text_pnt_mrk,
  inpt_pnt_mrk,
  text_pnt_ctr,
  inpt_pnt_ctr,
  text_pnt_fnl,
  inpt_pnt_fnl,
  // Elemente Kontrollmasse
  inpt_chk_shd,
  text_chk_shd,
  inpt_chk_is,
  text_chk_is,
  text_chk_diff,
  // Buttons
  but_edit,
  but_modi,
  but_dele,
  but_save,
  but_rele,
  but_emrk,
  but_arch,
};
// -------------------------------------------------------------------------------------------------