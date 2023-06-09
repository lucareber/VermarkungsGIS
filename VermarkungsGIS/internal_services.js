/* Dieses File dient der Initialisierung der Vermarkungsdatenbank. Die Daten werden ueber 
   Web Feature Service (WFS) bezogen. WFS gehoert zu den Open Geospatial Consortium 
   (OGC https://www.ogc.org/) Standards. */

// -------------------------------------------------------------------------------------------------

// Import
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import {Circle, Fill, Stroke, Style, RegularShape, Text} from 'ol/style.js';
import {Point} from 'ol/geom.js';
import colorData from './color_values.js';
import variableData from './variable_values.js'

// Vermarkungs WFS-Dienste
// -------------------------------------------------------------------------------------------------

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

// Auftraege
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const vect_source_Jobs = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return server_url + '?service=WFS' +
           '&version=1.1.0' + 
           '&request=GetFeature' + 
           '&typename=' + server_workspace + ':' + server_job_layer +
           '&SRSNAME=EPSG:2056' +
           '&outputFormat=application/json';
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Jobs = new VectorLayer({
  source: vect_source_Jobs,
  zIndex: 10,
  id: "vermarkung_job",
  style: function(feature, resolution){
    // Definition Style "ungespeichert"
    const style_Jobs_proj = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_proj_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_proj_fill,
      }),
    });
    // Definition Style "erstellt"
    const style_Jobs_cre = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_cre_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_cre_fill,
      }),
    });
    // Definition Style "erstellt" bei Vermarkung zurueckgestellt
    const style_Jobs_cre_vz = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_cre_vz_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_cre_vz_fill,
      }),
    });
    // Definition Style "erstellt" bei Projektmutation
    const style_Jobs_cre_pm = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_cre_pm_line,
        width: 0.6 / resolution,
        lineDash: [2.5 / resolution , 1.2 / resolution],
        lineCap: 'butt',
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_cre_pm_fill,
      }), 
    });
    // Definition Style "bereit fuer Vermarkung"
    const style_Jobs_rdy = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_rdy_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_rdy_fill,
      }),
    });
    // Definition Style "Vermarkung erstellt"
    const style_Jobs_mk = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_mk_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_mk_fill,
      }),
    });
    // Definition Style "archiviert"
    const style_Jobs_arc = new Style({
      stroke: new Stroke({
        color: colorData.clr_j_arc_line, 
        width: 0.6 / resolution, 
        lineDash: [2.5 / resolution , 1.2 / resolution], 
        lineCap: 'butt', 
        lineJoin: 'miter',
      }),
      fill: new Fill({
        color: colorData.clr_j_arc_fill,
      }),
    });
    // wenn Geometribearbeitung (Auftrag) aktiv - nur entsprechenden Auftrag darstellen (als projektiert)
    if (variableData.state_modifyJobPolygon == true) {
      if (feature.getId() == variableData.featureToModify.getId()) {
        return [style_Jobs_proj];
      }; 
    }
    // wenn Geometriebearbeitung (Punkt) aktiv - nur dazugehoerigen Auftrag darstellen
    else if (variableData.state_modifyPntPoint == true) {
      if (feature.getId() == 'vermarkung_auftraege.' + variableData.featureToModify.get('pkt_fk_auftr')) {
        // Darsstellung nach Auftragsstatus
        if (feature.get('auftr_status') == 'ungespeichert') {
          return [style_Jobs_proj];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') != 'Vermarkung zurückgestellt' 
                 && feature.get('auftr_typ') != 'Abschluss Projektmutation') {
          return [style_Jobs_cre];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Vermarkung zurückgestellt') {
          return [style_Jobs_cre_vz];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Abschluss Projektmutation') {
          return [style_Jobs_cre_pm];
        };
      };
    }
    // wenn keine Bearbeitung aktiv - Darstellung nach Modus und Auftragsstatus
    else {
      // Modus -> Uebersicht
      if (variableData.sel_mode == '00_overview') {
        if (feature.get('auftr_status') == 'erfasst' 
            && feature.get('auftr_typ') != 'Vermarkung zurückgestellt' 
            && feature.get('auftr_typ') != 'Abschluss Projektmutation') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_cre').checked) {
            return [style_Jobs_cre];
          };
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Vermarkung zurückgestellt') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_crevz').checked) {
            return [style_Jobs_cre_vz];
          };
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Abschluss Projektmutation') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_crepm').checked) {
            return [style_Jobs_cre_pm];
          };
        }
        else if (feature.get('auftr_status') == 'bereit zur Vermarkung') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_rdy').checked) {
            return [style_Jobs_rdy];
          };
        }
        else if (feature.get('auftr_status') == 'Vermarkung erstellt') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_mk').checked) {
            return [style_Jobs_mk];
          };
        }
        else if (feature.get('auftr_status') == 'archiviert') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_01_arc').checked) {
            return [style_Jobs_arc];
          };
        };
      }
      // Modus -> Erfassung
      else if (variableData.sel_mode == '01_capture') {
        if (feature.get('auftr_status') == 'ungespeichert') {
          return [style_Jobs_proj];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') != 'Vermarkung zurückgestellt' 
                 && feature.get('auftr_typ') != 'Abschluss Projektmutation') {
          return [style_Jobs_cre];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Vermarkung zurückgestellt') {
          return [style_Jobs_cre_vz];
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Abschluss Projektmutation') {
          return [style_Jobs_cre_pm];
        };
      }
      // Modus -> Vermarkung
      else if (variableData.sel_mode == '02_marking') {
        if (feature.get('auftr_status') == 'bereit zur Vermarkung') {
          return [style_Jobs_rdy];
        };
      }
      // Modus -> Erledigt
      else if (variableData.sel_mode == '03_done') {
        if (feature.get('auftr_status') == 'Vermarkung erstellt') {
          return [style_Jobs_mk];
        };
      }
      // Modus -> Vermarkung zurueckgestellt / Abschluss Projektmutation
      else if (variableData.sel_mode == '04_markingwait') {
        if (feature.get('auftr_status') == 'erfasst' 
            && feature.get('auftr_typ') == 'Vermarkung zurückgestellt') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_04_VZ').checked) {
            return [style_Jobs_cre_vz];
          };
        }
        else if (feature.get('auftr_status') == 'erfasst' 
                 && feature.get('auftr_typ') == 'Abschluss Projektmutation') {
          // Darstellung nur wenn Checkbox aktiviert
          if (document.querySelector('#ckbox_04_PM').checked) {
            return [style_Jobs_cre_pm];
          };
        };
      }
      // Modus -> Archiv
      else if (variableData.sel_mode == '05_archive') {
        if (feature.get('auftr_status') == 'archiviert') {
          return [style_Jobs_arc];
        };
      };
    };
  },
});

// Grenzpunkte
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const vect_source_Points = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return server_url + '?service=WFS' +
           '&version=1.1.0' + 
           '&request=GetFeature' + 
           '&typename=' + server_workspace + ':' + server_pnt_layer +
           '&SRSNAME=EPSG:2056' +
           '&outputFormat=application/json';
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Points = new VectorLayer({
  source: vect_source_Points,
  zIndex: 12,
  id: "vermarkung_pnt",
  style: function(feature, resolution){
    var symbolColorFill;
    var symbolColorLine;
    // Farbgebung - Punkt weder vermarkt noch kontrolliert
    if (feature.get('pkt_vermarkung') == null ) {
      symbolColorFill = colorData.clr_p_cre_fill;
      symbolColorLine = colorData.clr_p_cre_line;
    }
    // Farbgebung - Punkt vermarkt, jedoch nicht kontrolliert
    else if (feature.get('pkt_vermarkung') != null 
             && feature.get('pkt_kontrolle') == 'ausstehend') {
      symbolColorFill = colorData.clr_p_mk_fill;
      symbolColorLine = colorData.clr_p_mk_line;
    }
    // Farbgebung - Punkt vermarkt und kontrolliert
    else {
      symbolColorFill = colorData.clr_p_ck_fill;
      symbolColorLine = colorData.clr_p_ck_line;
    };
    // Definition Symbol "Stein"
    const style_Stein = new Style({
      image: new Circle({
        radius: 0.7 / resolution,
        fill: new Fill({
          color: symbolColorFill,
        }),
        stroke: new Stroke({
          color: symbolColorLine, 
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Bolzen"
    const style_Bolzen = new Style({
      image: new Circle({
        radius: 0.5 / resolution,
        fill: new Fill({
          color: symbolColorFill,
        }),
        stroke: new Stroke({
          color: symbolColorLine, 
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Rohr"
    const style_Rohr = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: symbolColorFill
        }),
        stroke: new Stroke({
          color: symbolColorLine,
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Style "Kreuz"
    const style_Kreuz_Kreis = new Circle({
      radius: 0.4 / resolution,
      fill: new Fill({
        color: symbolColorFill,
      }),
      stroke: new Stroke({
        color: symbolColorLine, 
        width: 0.25 / resolution,
      }),
    });
    const style_Kreuz_Kreuz = new RegularShape({
      points: 4,
      radius: 1.2 / resolution,
      radius2: 0,
      stroke: new Stroke({
        width: 0.25 / resolution, 
        color: symbolColorLine,
      }),
      angle: Math.PI/4,
    });
    const style_Kreuz = [
      new Style({image: style_Kreuz_Kreuz}), 
      new Style({image: style_Kreuz_Kreis}),
    ];
    // Definition Style "unversichert"
    const style_Unversichert = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: symbolColorLine
        }),
        stroke: new Stroke({
          color: symbolColorFill, 
          width: 0.25 / resolution,
        }),
      }),
    });
    // innere Funktion zur ermittluch der Versicherungsart
    function getPointStyle (feature) {
      if (feature.get('pkt_versicherung') == 'Stein' 
          || feature.get('pkt_versicherung') == 'Kunststoffzeichen') {
        return [style_Stein];
      }
      else if (feature.get('pkt_versicherung') == 'Bolzen') {
        return [style_Bolzen];
      }
      else if (feature.get('pkt_versicherung') == 'Rohr' 
               || feature.get('pkt_versicherung') == 'Pfahl') {
        return [style_Rohr];
      }
      else if (feature.get('pkt_versicherung') == 'Kreuz') {
        return style_Kreuz;
      }
      else {
        return [style_Unversichert];
      };
    };
    // wenn Geometriebearbeitung (Auftrag) aktiv - nur dazugehoerige Punkte darstellen
    if (variableData.state_modifyJobPolygon == true) {
      if (variableData.featureToModify.get('auftr_pk_id') == feature.get('pkt_fk_auftr')) {
        return getPointStyle(feature)
      };
    }
    // wenn Geometriebearbeitung (Punkt) aktiv - nur Punkte im selben Auftrag darstellen
    else if (variableData.state_modifyPntPoint == true) {
      if (variableData.featureToModify.get('pkt_fk_auftr') == feature.get('pkt_fk_auftr')) {
        return getPointStyle(feature)
      };
    }
    // wenn keine Bearbeitung aktiv - Darstellung nach Modus und Punktstatus
    else {
      if (feature.get('pkt_fk_auftr') != null) {
        // Modus -> Uebersicht
        if (variableData.sel_mode == '00_overview') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            // Checkbox 'Auftrag erfasst' aktiviert
            if (jobFeature.get('auftr_status') == 'erfasst' 
                && jobFeature.get('auftr_typ') != 'Vermarkung zurückgestellt' 
                && jobFeature.get('auftr_typ') != 'Abschluss Projektmutation'
                && document.querySelector('#ckbox_01_cre').checked) {
                  return getPointStyle(feature);
            }
            // Checkbox 'Auftrag erfasst (VZ)' aktiviert
            else if (jobFeature.get('auftr_status') == 'erfasst' 
                     && jobFeature.get('auftr_typ') == 'Vermarkung zurückgestellt' 
                     && document.querySelector('#ckbox_01_crevz').checked) {
              return getPointStyle(feature);
            }
            // Checkbox 'Auftrag erfasst (PM)' aktiviert
            else if ((jobFeature.get('auftr_status') == 'erfasst' 
                      && jobFeature.get('auftr_typ') == 'Abschluss Projektmutation' 
                      && document.querySelector('#ckbox_01_crepm').checked)) {
              return getPointStyle(feature);
            }
            // Checkbox 'Auftrag freigegeben' aktiviert
            else if (jobFeature.get('auftr_status') == 'bereit zur Vermarkung'
                     && document.querySelector('#ckbox_01_rdy').checked) {
              return getPointStyle(feature);
            }
            // Checkbox 'Auftrag erledigt' aktiviert
            else if (jobFeature.get('auftr_status') == 'Vermarkung erstellt'
                     && document.querySelector('#ckbox_01_mk').checked) {
              return getPointStyle(feature);
            }
            // Checkbox 'Auftrag archiviert' aktiviert
            else if (jobFeature.get('auftr_status') == 'archiviert'
                     && document.querySelector('#ckbox_01_arc').checked) {
              return getPointStyle(feature);
            }
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        }
        // Modus -> Erfassung
        else if (variableData.sel_mode == '01_capture') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            if (jobFeature.get('auftr_status') == 'erfasst') {
              return getPointStyle(feature);
            }; 
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        }
        // Modus -> Vermarkung
        else if (variableData.sel_mode == '02_marking') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            if (jobFeature.get('auftr_status') == 'bereit zur Vermarkung') {
              return getPointStyle(feature);
            };
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        }
        // Modus -> Erledigt
        else if (variableData.sel_mode == '03_done') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            if (jobFeature.get('auftr_status') == 'Vermarkung erstellt') {
              return getPointStyle(feature);
            };
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        }
        // Modus -> Vermarkung zurueckgestellt / Abschluss Projektmutation
        else if (variableData.sel_mode == '04_markingwait') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            if (jobFeature.get('auftr_status') == 'erfasst' 
                && jobFeature.get('auftr_typ') == 'Vermarkung zurückgestellt' 
                && document.querySelector('#ckbox_04_VZ').checked) {
              return getPointStyle(feature);
            }
            else if ((jobFeature.get('auftr_status') == 'erfasst' 
                      && jobFeature.get('auftr_typ') == 'Abschluss Projektmutation' 
                      && document.querySelector('#ckbox_04_PM').checked)) {
              return getPointStyle(feature);
            }
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        }
        // Modus -> Archiv
        else if (variableData.sel_mode == '05_archive') {
          var jobFeatureID = 'vermarkung_auftraege.' + feature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          try {
            if (jobFeature.get('auftr_status') == 'archiviert') {
              return getPointStyle(feature);
            };
          } catch (error) {
            vect_Points.getSource().refresh();
          };
        };
      };
    };
  },
});

// Kontrollmasse
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const vect_source_Checks = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return server_url + '?service=WFS' +
           '&version=1.1.0' + 
           '&request=GetFeature' + 
           '&typename=' + server_workspace + ':' + server_chk_layer +
           '&SRSNAME=EPSG:2056' +
           '&outputFormat=application/json';
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Checks = new VectorLayer({
  source: vect_source_Checks,
  zIndex: 11,
  id: "vermarkung_kontrollmasse",
  style: function(feature, resolution){
    // Farbe ermitteln (je nach Vollstaendigkeit)
    if (feature.get('ktr_soll') != null && feature.get('ktr_ist') != null) {
      var chkLineColor = colorData.clr_c_all_cmpl;
    }
    else {
      var chkLineColor = colorData.clr_c_all_incmpl;
    };
    // Definition Style
    const style_checks = [
      new Style({
        stroke: new Stroke({
          color: chkLineColor, 
          width: 0.6 / resolution
        }),
      }),
    ];
    // Begrenzungslinien an Start und Ende einfuegen
    feature.getGeometry().forEachSegment(function (startPnt, endPnt) {
      const dE = endPnt[0] - startPnt[0];
      const dN = endPnt[1] - startPnt[1];
      const rotation = Math.atan2(dE, dN);
      // Begrenzung am Endpunkt  
      style_checks.push(
        new Style({
          geometry: new Point(endPnt),
          image: new RegularShape({
            points: 2,
            radius: 2 / resolution,
            radius2: 0,
            stroke: new Stroke({
              width: 0.5 / resolution, 
              color: chkLineColor,
              lineJoin: 'miter',
            }),
            angle: rotation + Math.PI/2,
          }),
        }),
      );
      // Begrenzung am Startpunkt
      style_checks.push(
        new Style({
          geometry: new Point(startPnt),
          image: new RegularShape({
            points: 2,
            radius: 2 / resolution,
            radius2: 0,
            stroke: new Stroke({
              width: 0.5 / resolution, 
              color: chkLineColor,
              lineJoin: 'miter',
            }),
            angle: rotation + Math.PI/2,
          }),
        }),
      );
      // Textanzeige je nach Vollstaendigkeit
      function getChkText (feature) {
        if (feature.get('ktr_soll') != null && feature.get('ktr_ist') != null) {
          return 'Soll: ' + feature.get('ktr_soll') + ' m / Ist: ' + feature.get('ktr_ist') + ' m';
        }
        else if (feature.get('ktr_soll') != null) {
          return 'Soll: ' + feature.get('ktr_soll') + ' m';
        }
        else if (feature.get('ktr_ist') != null) {
          return 'Ist: ' + feature.get('ktr_ist') + ' m';
        }
        else {
          return '';
        };
      };
      // Textanzeige hinzufuegen
      style_checks.push(
        new Style({
          text: new Text ({
            text: getChkText(feature),          
            placement: 'line',
            font: 'Arial',
            fill: new Fill ({
              color: chkLineColor,
            }),
            scale: 2,
            offsetY: 20,
          }),
        }),
      );
    });
    // Je nach Modus anzeigen der Kontrollmasse (abhaengig von Auftragsstatus)
    if (variableData.state_modifyJobPolygon == false && variableData.state_modifyPntPoint == false) {
      try {
        // Modus -> Vermarkung
        if (variableData.sel_mode == '02_marking') {
          var pntFeatureID = 'vermarkung_grenzpunkte.' + feature.get('ktr_fk_pkt');
          var pntFeature = vect_Points.getSource().getFeatureById(pntFeatureID);
          var jobFeatureID = 'vermarkung_auftraege.' + pntFeature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          if (jobFeature.get('auftr_status') == 'bereit zur Vermarkung') {
            return style_checks;
          };
        }
        // Modus -> Erledigt
        else if (variableData.sel_mode == '03_done') {
          var pntFeatureID = 'vermarkung_grenzpunkte.' + feature.get('ktr_fk_pkt');
          var pntFeature = vect_Points.getSource().getFeatureById(pntFeatureID);
          var jobFeatureID = 'vermarkung_auftraege.' + pntFeature.get('pkt_fk_auftr');
          var jobFeature = vect_Jobs.getSource().getFeatureById(jobFeatureID);
          if (jobFeature.get('auftr_status') == 'Vermarkung erstellt') {
            return style_checks;
          };
        };
      } catch (error) {
        vect_Checks.getSource().refresh();
      };
    };
  },
});

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  // Vermarkungsdienste
  vect_Points,
  vect_Jobs,
  vect_Checks,
  // Serververbindung
  server_url,
  server_workspace,
  server_workspace_URI,
  server_job_layer,
  server_pnt_layer,
  server_chk_layer,
};
// -------------------------------------------------------------------------------------------------