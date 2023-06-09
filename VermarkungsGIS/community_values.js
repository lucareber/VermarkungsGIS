/* Dieses File dient der Einrichtung der Dropdown-Menues fuer die Gemeindewahl. 
   Die Wahloptionen werden automatisch in HTML-Schreibweise aufbereitet und spaeter direkt in die
   Dropdown-Menues uebernommen. */

// -------------------------------------------------------------------------------------------------

// Liste pro Dropdown-Menue mit den moeglichen Optionen.
// -------------------------------------------------------------------------------------------------

// Nachfuehrungsgemeinden
// ------------------------------------------------------------
// RSW AG
const comm_rsw_list = [
  //[Gemeinde Nr., NBIdent, Gemeinde, (Fusionskreis)]
  ['301', 'BE0200000006', 'Aarberg', ''],
  ['381', 'BE0200000061', 'Arch', ''],
  ['302', 'BE0200000007', 'Bargen (BE)', ''],
  ['382', 'BE0200000062', 'Büetigen', ''],
  ['383', 'BE0200000063', 'Büren a.A.', ''],
  ['385', 'BE0200000065', 'Diessbach', ''],
  ['386', 'BE0200000066', 'Dotzigen', ''],
  ['303', 'BE0200000002', 'Grossaffoltern', ''],
  ['304', 'BE0200000008', 'Kallnach', '(Kallnach)'],
  ['304', 'BE0200000012', 'Kallnach', '(Niederried)'],
  ['304', 'BE0200000219', 'Kallnach', '(Golaten)'],
  ['305', 'BE0200000009', 'Kappelen', ''],
  ['387', 'BE0200000067', 'Lengnau (BE)', ''],
  ['388', 'BE0200000068', 'Leuzigen', ''],
  ['306', 'BE0200000010', 'Lyss', '(Lyss)'],
  ['306', 'BE0200000064', 'Lyss', '(Busswil BE)'],
  ['389', 'BE0200000069', 'Meienried', ''],
  ['307', 'BE0200000011', 'Meikirch', ''],
  ['390', 'BE0200000070', 'Meinisberg', ''],
  ['391', 'BE0200000071', 'Oberwil bei Büren', ''],
  ['392', 'BE0200000072', 'Pieterlen', ''],
  ['309', 'BE0200000013', 'Radelfingen', ''],
  ['310', 'BE0200000014', 'Rapperswil (BE)', '(Rapperswil)'],
  ['310', 'BE0200000146', 'Rapperswil (BE)', '(Ruppoldsried)'],
  ['310', 'BE0200000130', 'Rapperswil (BE)', '(Bangerten)'],
  ['393', 'BE0200000073', 'Rüti bei Büren', ''],
  ['311', 'BE0200000015', 'Schüpfen', ''],
  ['312', 'BE0200000016', 'Seedorf (BE)', ''],
  ['394', 'BE0200000074', 'Wengi', '']
];
// Luescher & Aeschlimann AG
const comm_la_list = [
  //[Gemeinde Nr., NBIdent, Gemeinde, (Fusionskreis)]
  ['491', 'BE0200000117', 'Brüttelen', ''],
  ['492', 'BE0200000118', 'Erlach', ''],
  ['493', 'BE0200000119', 'Finsterhennen', ''],
  ['494', 'BE0200000120', 'Gals', ''],
  ['495', 'BE0200000121', 'Gampelen', ''],
  ['496', 'BE0200000122', 'Ins', ''],
  ['723', 'BE0200000255', 'La Neuveville', ''],
  ['497', 'BE0200000123', 'Lüscherz', ''],
  ['498', 'BE0200000124', 'Müntschemier', ''],
  ['724', 'BE0200000256', 'Nods', ''],
  ['726', 'BE0200000253', 'Plateau de Diesse', '(Diesse)'],
  ['726', 'BE0200000254', 'Plateau de Diesse', '(Lamboing)'],
  ['726', 'BE0200000257', 'Plateau de Diesse', '(Prêles)'],
  ['499', 'BE0200000125', 'Siselen', ''],
  ['500', 'BE0200000126', 'Treiten', ''],
  ['501', 'BE0200000127', 'Tschugg', ''],
  ['502', 'BE0200000128', 'Vinelz', '']
];

// Abfuellen des <select>-Tags fuer die Parzellensuche (mit Fusionskreis)
// -------------------------------------------------------------------------------------------------
function parzSearchGmd_inline () {
  var temp_inlineHTML = '';
  // Dropdown fuer Nachfuehrungsgemeinden RSW AG
  temp_inlineHTML += '<optgroup label="RSW AG">';
  for (let i = 0; i < comm_rsw_list.length; i++) {
    temp_inlineHTML +=  '<option value=' + comm_rsw_list[i][1] + '>' + 
                          comm_rsw_list[i][2] + ' ' + comm_rsw_list[i][3] + 
                        '</option>';
  };
  temp_inlineHTML += '</optgroup>';
  // Dropdown fuer Nachfuehrungsgemeinden Luescher & Aeschlimann AG
  temp_inlineHTML += '<optgroup label="Lüscher & Aeschlimann AG">';
  for (let i = 0; i < comm_la_list.length; i++) {
    temp_inlineHTML +=  '<option value=' + comm_la_list[i][1] + '>' + 
                          comm_la_list[i][2] + ' ' + comm_la_list[i][3] +
                        '</option>';
  };
  temp_inlineHTML += '</optgroup>';
  // Rueckgabe 
  return temp_inlineHTML;
};

// Abfuellen des <select>-Tags fuer die Gemeindeauswahl (Datenbank)
// -------------------------------------------------------------------------------------------------
function dropdown_J_com_inline () {
  var temp_inlineHTML = '';
  var bfs_List = [];
  // Dropdown fuer Nachfuehrungsgemeinden RSW AG
  temp_inlineHTML += '<optgroup label="RSW AG">';
  for (let i = 0; i < comm_rsw_list.length; i++) {
    if (bfs_List.includes(comm_rsw_list[i][0]) == false) {
      bfs_List.push(comm_rsw_list[i][0]);
        temp_inlineHTML +=  '<option value=' + comm_rsw_list[i][0] + '>' +
                              comm_rsw_list[i][2] +
                            '</option>';
    };
  };
  temp_inlineHTML += '</optgroup>';
  // Dropdown fuer Nachfuehrungsgemeinden Luescher & Aeschlimann AG
  temp_inlineHTML += '<optgroup label="Lüscher & Aeschlimann AG">';
  for (let i = 0; i < comm_la_list.length; i++) {
    if (bfs_List.includes(comm_la_list[i][0]) == false) {
      bfs_List.push(comm_la_list[i][0]);
      temp_inlineHTML +=  '<option value=' + comm_la_list[i][0] + '>' +
                            comm_la_list[i][2] + 
                          '</option>';
    };
  };
  temp_inlineHTML += '</optgroup>';
  // Rueckgabe
  return temp_inlineHTML
};

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  parzSearchGmd_inline,
  dropdown_J_com_inline,
};
// -------------------------------------------------------------------------------------------------