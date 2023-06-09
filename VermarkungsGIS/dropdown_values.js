/* Dieses File dient der einfachen Erweiterung der Dropdown-Menues. 
   Die Wahloptionen werden automatisch in HTML-Schreibweise aufbereitet und spaeter direkt 
   uebernommen. Es gilt zu beachten, dass die Werte auch fuer die Zuordnung bzw. Einfaerbung 
   verwendet werden, daher sind die Werte nur mit Vorsicht anzupassen. */

// -------------------------------------------------------------------------------------------------

// Liste pro Dropdown-Menue mit den moeglichen Optionen.
// -------------------------------------------------------------------------------------------------

// Auftraege
// ------------------------------------------------------------
// Art (keine Verwendung Zuordnung od. Einfaerbung)
const dropdown_J_typ = [
  //[Optionsname, angezeigter Text]
  ['rek', 'Rekonstruktion'],
  ['mut', 'Liegenschaftsmutation'],
  ['pm', 'Abschluss Projektmutation'],
  ['vz', 'Vermarkung zurückgestellt'],
  ['neu', 'Ersterhebung / Erneuerung'],
  ['and', 'andere']
];
// Status
const dropdown_J_state = [
  //[Optionsname, angezeigter Text]
  ['erf', 'erfasst'],
  ['ber', 'bereit zur Vermarkung'],
  ['erl', 'Vermarkung erstellt'],
  ['arc', 'archiviert']
];

// Punkte
// ------------------------------------------------------------
// Typ (keine Verwendung Zuordnung od. Einfaerbung)
const dropdown_P_typ = [
  //[Optionsname, angezeigter Text]
  ['neu', 'Neuerstellung'],
  ['ins', 'Instandstellung'],
  ['ent', 'Entfernung']
];
// Versicherungsart
const dropdown_P_marker = [
  //[Optionsname, angezeigter Text]
  ['ste', 'Stein'],
  ['kze', 'Kunststoffzeichen'],
  ['bol', 'Bolzen'],
  ['roh', 'Rohr'],
  ['pfa', 'Pfahl'],
  ['kre', 'Kreuz'],
  ['unv', 'unversichert']
];
// Markierungsart (keine Verwendung Zuordnung od. Einfaerbung)
const dropdown_P_tempmarker = [
  //[Optionsname, angezeigter Text]
  ['pfa', 'Pfahl'],
  ['bor', 'Bohrloch'],
  ['nag', 'Nagel'],
  ['far', 'Farbe'],
  ['and', 'andere']
];
// Kontrolle
const dropdown_P_control = [
  //[Optionsname, angezeigter Text]
  ['aus', 'ausstehend'],
  ['tps', 'Tachymeter'],
  ['gnss', 'GNSS'],
  ['kma', 'Kontrollmass'],
  ['and', 'andere']
];

// Umwandeln der Liste in die HTML-Schreibweise fuer die Integration in den <select>-Tag.
// -------------------------------------------------------------------------------------------------
function dropdown_inline(array) {
  var temp_inlineHTML = '';
  for (let i = 0; i < array.length; i++) {
    temp_inlineHTML += '<option value=' + array[i][0] + '>' + array[i][1] + '</option>';
  };
  return temp_inlineHTML;
};

// Umgewandelte Elemente fuer die weitergabe an das Hauptfile.
// -------------------------------------------------------------------------------------------------
const dropdown_J_typ_inline = dropdown_inline(dropdown_J_typ);
const dropdown_J_state_inline = dropdown_inline(dropdown_J_state);
const dropdown_P_typ_inline = dropdown_inline(dropdown_P_typ);
const dropdown_P_marker_inline = dropdown_inline(dropdown_P_marker);
const dropdown_P_tempmarker_inline = dropdown_inline(dropdown_P_tempmarker);
const dropdown_P_control_inline = dropdown_inline(dropdown_P_control);

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  dropdown_J_typ_inline,
  dropdown_J_state_inline,
  dropdown_P_typ_inline,
  dropdown_P_marker_inline,
  dropdown_P_tempmarker_inline,
  dropdown_P_control_inline,
};
// -------------------------------------------------------------------------------------------------