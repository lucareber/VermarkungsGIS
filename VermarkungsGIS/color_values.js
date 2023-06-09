/* Dieses File dient der einfachen Uebernahme der Farben aus dem css-File in die JavaScript-Files. 
   Dadurch wird eine Inkonsistenz in der Farbgebung verhindert und allfaellige Anpassungen 
   vereinfacht. */

// -------------------------------------------------------------------------------------------------

// Abfragen der Farben aus dem css-File
/* Quelle: vsync. & Oriol. (03.01.2021). Access CSS variable from javascript. stack overflow.
   URL: https://stackoverflow.com/questions/41725725/access-css-variable-from-javascript
   [Abgerufen: 21.04.2023] */
// -------------------------------------------------------------------------------------------------
function getColorfromCSS (variable) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variable);
};

// Hauptfarben
// ------------------------------------------------------------
// Primaerhintergrundfarbe, ausgewaehlte Optionen
const clr_background_1 = getColorfromCSS ('--color_background_1');
//Sekundaerhintergrundfarbe
const clr_background_2 = getColorfromCSS ('--color_background_2');
//Teritaerehintergrundfarbe -> weiss
const clr_background_3 = getColorfromCSS ('--color_background_3');
//Umrandungsfarbe
const clr_border = getColorfromCSS ('--color_border');
//Schriftfarbe
const clr_font = getColorfromCSS ('--color_font_general');

// Farben Auftrag-Datenbank
// ------------------------------------------------------------
//Linienfarbe projektierte Auftraege
const clr_j_proj_line = getColorfromCSS ('--color_j_proj_line');
//Fuellfarbe projektierte Auftraege
const clr_j_proj_fill = getColorfromCSS ('--color_j_proj_fill');
//Linienfarbe erfasste Auftraege
const clr_j_cre_line = getColorfromCSS ('--color_j_cre_line');
//Fuellfarbe erfasste Auftraege
const clr_j_cre_fill  = getColorfromCSS ('--color_j_cre_fill');
//Linienfarbe erfasste Auftraege (VZ)
const clr_j_cre_vz_line = getColorfromCSS ('--color_j_cre_vz_line');
//Fuellfarbe erfasste Auftraege (VZ)
const clr_j_cre_vz_fill = getColorfromCSS ('--color_j_cre_vz_fill');
//Linienfarbe erfasste Auftraege (PM)
const clr_j_cre_pm_line = getColorfromCSS ('--color_j_cre_pm_line');
//Fuellfarbe erfasste Auftraege (PM)
const clr_j_cre_pm_fill = getColorfromCSS ('--color_j_cre_pm_fill');
//Linienfarbe Auftraege bereit fuer Vermarkung
const clr_j_rdy_line = getColorfromCSS ('--color_j_rdy_line');
//Fuellfarbe Auftraege bereit fuer Vermarkung
const clr_j_rdy_fill = getColorfromCSS ('--color_j_rdy_fill');
//Linienfarbe vermarkte Auftraege
const clr_j_mk_line = getColorfromCSS ('--color_j_mk_line');
//Fuellfarbe vermarkte Auftraege
const clr_j_mk_fill = getColorfromCSS ('--color_j_mk_fill');
//Linienfarbe archivierte Auftraege
const clr_j_arc_line = getColorfromCSS ('--color_j_arc_line');
//Fuellfarbe vermarkte Auftraege
const clr_j_arc_fill = getColorfromCSS ('--color_j_arc_fill');

// Farben Grenzpunkt-Datenbank
// ------------------------------------------------------------
// Linienfarbe erfasste Punkte
const clr_p_cre_line = getColorfromCSS ('--color_p_cre_line');
// Fuellfarbe erfasste Punkte
const clr_p_cre_fill = getColorfromCSS ('--color_p_cre_fill');
// Linienfarbe vermarkte Punkte
const clr_p_mk_line = getColorfromCSS ('--color_p_mk_line');
// Fuellfarbe vermarkte Punkte
const clr_p_mk_fill = getColorfromCSS ('--color_p_mk_fill');
// Linienfarbe kontrollierte Punkte
const clr_p_ck_line = getColorfromCSS ('--color_p_ck_line');
// Fuellfarbe kontrollierte Punkte
const clr_p_ck_fill = getColorfromCSS ('--color_p_ck_fill');

// Farben Kontrollmass-Datenbank
// ------------------------------------------------------------
// Linienfarbe vollstaendige Kontrollmasse
const clr_c_all_cmpl = getColorfromCSS ('--color_c_all_cmpl');
// Linienfarbe unvollstaendige Kontrollmasse
const clr_c_all_incmpl = getColorfromCSS ('--color_c_all_incmpl');

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  // Hauptfarben
  clr_background_1,
  clr_background_2,
  clr_background_3,
  clr_border,
  clr_font,
  // Farben Auftrag-Datenbank
  clr_j_proj_line,
  clr_j_proj_fill,
  clr_j_cre_line,
  clr_j_cre_fill,
  clr_j_cre_vz_line,
  clr_j_cre_vz_fill,
  clr_j_cre_pm_line,
  clr_j_cre_pm_fill,
  clr_j_rdy_line,
  clr_j_rdy_fill,
  clr_j_mk_line,
  clr_j_mk_fill,
  clr_j_arc_line,
  clr_j_arc_fill,
  // Farben Grenzpunk-Datenbank
  clr_p_cre_line,
  clr_p_cre_fill,
  clr_p_mk_line,
  clr_p_mk_fill,
  clr_p_ck_line,
  clr_p_ck_fill,
  // Farben Kontrollmasse-Datenbank
  clr_c_all_cmpl,
  clr_c_all_incmpl,
};
// -------------------------------------------------------------------------------------------------