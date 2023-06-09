/* Dieses File dient der Initialisierung von externen Datenquellen welche dem WebGIS als 
   Hintergrundkarten dienen.Die Daten werden ueber Web Map Services (WMS), 
   Web Map Tiling Services (WMTS) und Web Feature Service (WFS) bezogen.WMS, WMTS und WFS sind 
   Open Geospatial Consortium (OGC https://www.ogc.org/) Standards. */

// -------------------------------------------------------------------------------------------------

// Import
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector.js';
import TileWMS from 'ol/source/TileWMS.js'
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer} from 'ol/layer.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import {Circle, Fill, Stroke, Style, RegularShape} from 'ol/style.js';
import ImageWMS from 'ol/source/ImageWMS.js'

// relevante Objekte im Bezug auf Vermarkung als WFS (GetFeature Abfrage)
// -------------------------------------------------------------------------------------------------

// Liegenschaften (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_Liegenschaften = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:RESF&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Liegenschaften = new VectorLayer({
  id: "liegenschaften",
  source: source_vect_Liegenschaften,
  zIndex: 3,
  style: function(feature, resolution){
    const style_Liegenschaft = new Style({
      stroke: new Stroke({
        color: 'black', 
        width: 0.3 / resolution,
      }),
    });
  return [style_Liegenschaft];
  },
});

// projektierte Liegenschaften (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_ProjLiegenschaften = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:RESFPROJ&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_ProjLiegenschaften = new VectorLayer({
  id: "projliegenschaften",
  source: source_vect_ProjLiegenschaften,
  zIndex: 3,
  style: function(feature, resolution){
    const style_ProjLiegenschaft = new Style({
      stroke: new Stroke({
        color: 'red', 
        width: 0.3 / resolution,
      }),
    });
  return [style_ProjLiegenschaft];
  },
});

// selbststaendige und dauernde Rechte (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_SDR = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:DPRSF&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_SDR = new VectorLayer({
  id: "sdr",
  source: source_vect_SDR,
  zIndex: 2,
  style: function(feature, resolution){
    const style_SDR = [
      new Style({
        stroke: new Stroke({
          color: 'white',
          width: 0.3 / resolution,
        }),
      }),
      new Style({
      stroke: new Stroke({
        color: 'black', 
        width: 0.3 / resolution, 
        lineDash: [1.25 / resolution , 0.7 / resolution],
        lineCap: 'butt',
        }),
      }),
    ];
  return style_SDR;
  },
});

// selbststaendige und dauernde Rechte projektiert (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_ProjSDR = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:DPRSFPROJ&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_ProjSDR = new VectorLayer({
  id: "projsdr",
  source: source_vect_ProjSDR,
  zIndex: 2,
  style: function(feature, resolution){
    const style_ProjSDR = [
      new Style({
        stroke: new Stroke({
          color: 'white',
          width: 0.3 / resolution,
        }),
      }),
      new Style({
      stroke: new Stroke({
        color: 'red', 
        width: 0.3 / resolution, 
        lineDash: [1.25 / resolution , 0.7 / resolution],
        lineCap: 'butt',
        }),
      }),
    ];
  return style_ProjSDR;
  },
});

// Grenzpunkte (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_Grenzpunkte = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:OSBP&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Bestimmung der Gueltigkeit der Grenzpunkte und entsprechende Einfaerbung
function color_Grenzpunkte(feature) {
  if (feature.get('Gueltigkeit') == 'gueltig') {
    return 'black';
  } 
  else {
    return 'red';
  };
};
// Instanziierung und Symbolisierung Vector Layer
const vect_Grenzpunkte = new VectorLayer({
  id: "grenzpunkte",
  source: source_vect_Grenzpunkte,
  zIndex: 5,
  style: function(feature, resolution){
    // Definition Symbol "Stein"
    const style_Stein = new Style({
      image: new Circle({
        radius: 0.7 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Grenzpunkte(feature), 
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Bolzen"
    const style_Bolzen = new Style({
      image: new Circle({
        radius: 0.5 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Grenzpunkte(feature),
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Rohr"
    const style_Rohr = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Grenzpunkte(feature),
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Style "Kreuz"
    const style_Kreuz_Kreis = new Circle({
      radius: 0.4 / resolution,
      fill: new Fill({
        color: 'white',
      }),
      stroke: new Stroke({
        color: color_Grenzpunkte(feature), 
        width: 0.25 / resolution,
      }),
    });
    const style_Kreuz_Kreuz = new RegularShape({
      points: 4,
      radius: 1.2 / resolution,
      radius2: 0,
      stroke: new Stroke({
        width: 0.25 / resolution, 
        color: color_Grenzpunkte(feature),
      }),
      angle: Math.PI/4,
    });
    const style_Kreuz = [
      new Style({
        image: style_Kreuz_Kreuz,
      }), 
      new Style({
        image: style_Kreuz_Kreis,
      }),
    ];
    // Definition Style "unversichert"
    const style_Unversichert = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: color_Grenzpunkte(feature),
        }),
        stroke: new Stroke({
          color: 'white', 
          width: 0.25 / resolution,
        }),
      }),
    });
    //Zuordnung der entsprechenden Symbolisierung nach Attribut "Punktzeichen"
    if (feature.get('Punktzeichen') == 'Stein' || feature.get('Punktzeichen') == 'Kunststoffzeichen') {
      return [style_Stein];
    }
    else if (feature.get('Punktzeichen') == 'Bolzen') {
      return [style_Bolzen];
    }
    else if (feature.get('Punktzeichen') == 'Rohr' || feature.get('Punktzeichen') == 'Pfahl') {
      return [style_Rohr];
    }
    else if (feature.get('Punktzeichen') == 'Kreuz') {
      return style_Kreuz;
    }
    else {
      return [style_Unversichert];
    };
  },
});

// Gemeindegrenzen (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_Gemeidegrenzen = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:MBSF&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Gemeinden = new VectorLayer({
  id: "liegenschaften",
  source: source_vect_Gemeidegrenzen,
  zIndex: 4,
  style: function(feature, resolution){
    const style_detail = [ 
      new Style({
        stroke: new Stroke({
          color: 'white',
          width: 0.3 / resolution,
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: 'black', 
          width: 0.3 / resolution, 
          lineDash: [1.0 / resolution , 1.0 / resolution],
          lineCap: 'butt',
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: 'black', 
          width: 0.3 / resolution, 
          lineDash: [3.0 / resolution , 3.0 / resolution],
          lineCap: 'butt',
        }),
      }),
    ];
    const style_ov= new Style({
      stroke: new Stroke({
        color: 'rgba(0,0,0,0)',
        width: 0,
      }),
    });
    if (resolution < 0.6) {
      return style_detail;
    }
    else {
      return [style_ov];
    };
  },
});

// Hoheitsgrenzpunkte (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_Hoheitsgrenzpunkte = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:TBBP&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Bestimmung der Gueltigkeit der Hoheitsgrenzpunkte und entsprechende Einfaerbung
function color_Hoheitsgrenzpunkte(feature) {
  if (feature.get('Gueltigkeit') == 'gueltig') {
    return 'black';
  } 
  else {
    return 'red';
  };
};
// Instanziierung und Symbolisierung Vector Layer
const vect_Hoheitsgrenzpunkte = new VectorLayer({
  id: "hoheitsgrenzpunkte",
  source: source_vect_Hoheitsgrenzpunkte,
  zIndex: 5,
  style: function(feature, resolution){
    // Definition Symbol "Stein"
    const style_Stein = new Style({
      image: new Circle({
        radius: 0.7 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Grenzpunkte(feature), 
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Bolzen"
    const style_Bolzen = new Style({
      image: new Circle({
        radius: 0.5 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Hoheitsgrenzpunkte(feature), 
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Symbol "Rohr"
    const style_Rohr = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: color_Hoheitsgrenzpunkte(feature),
          width: 0.25 / resolution,
        }),
      }),
    });
    // Definition Style "Kreuz"
    const style_Kreuz_Kreis = new Circle({
      radius: 0.4 / resolution,
      fill: new Fill({
        color: 'white',
      }),
      stroke: new Stroke({
        color: color_Hoheitsgrenzpunkte(feature),
        width: 0.25 / resolution,
      }),
    });
    const style_Kreuz_Kreuz = new RegularShape({
      points: 4,
      radius: 1.2 / resolution,
      radius2: 0,
      stroke: new Stroke({
        width: 0.25 / resolution,
        color: color_Hoheitsgrenzpunkte(feature),
      }),
      angle: Math.PI/4,
    });
    const style_Kreuz = [
      new Style({
        image: style_Kreuz_Kreuz,
      }), 
      new Style({
        image: style_Kreuz_Kreis,
      }),
    ];
    // Definition Style "unversichert"
    const style_Unversichert = new Style({
      image: new Circle({
        radius: 0.4 / resolution,
        fill: new Fill({
          color: color_Hoheitsgrenzpunkte(feature)
        }),
        stroke: new Stroke({
          color: 'white', 
          width: 0.25 / resolution
        }),
      }),
    });
    //Zuordnung der entsprechenden Symbolisierung nach Attribut "Punktzeichen"
    if (feature.get('Punktzeichen') == 'Stein' || feature.get('Punktzeichen') == 'Kunststoffzeichen') {
      return [style_Stein];
    }
    else if (feature.get('Punktzeichen') == 'Bolzen') {
      return [style_Bolzen];
    }
    else if (feature.get('Punktzeichen') == 'Rohr' || feature.get('Punktzeichen') == 'Pfahl') {
      return [style_Rohr];
    }
    else if (feature.get('Punktzeichen') == 'Kreuz') {
      return style_Kreuz;
    }
    else {
      return [style_Unversichert];
    };
  },
});

// Fixpunkte (LFP 3) (geodienste.ch)
// ------------------------------------------------------------
// Definition der Datenquelle (Vector Source)
const source_vect_Fixpunkte = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    return(
      'https://geodienste.ch/db/av?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0' + 
      '&TYPENAME=ms:CPPT&SRSNAME=EPSG:2056&BBOX=' + extent.join(',') +',EPSG:2056' + 
      '&OUTPUTFORMAT=geojson'
    );
  },
  strategy: bboxStrategy,
});
// Instanziierung und Symbolisierung Vector Layer
const vect_Fixpunkte = new VectorLayer({
  id: "fixpunkte",
  source: source_vect_Fixpunkte,
  zIndex: 5,
  style: function(feature, resolution){
    // Definition Symbol "Lagefixpunkt 3 auf Markstein / Kunststoffgrenzzeichen"
    const style_Stein = [
      new Style({
        image: new Circle({
          radius: 1.2 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution,
          }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: 0.7 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution,
          }),
        }),
      }),
    ];
    // Definition Symbol "Lagefixpunkt 3 auf Bolzen"
    const style_Bolzen = [
      new Style({
        image: new Circle({
          radius: 1.2 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution,
          }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: 0.5 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution,
          }),
        }),
      }),
    ];
    // Definition Symbol "Lagefixpunkt 3 auf Rohr / Pfahl"
    const style_Rohr = [
      new Style({
        image: new Circle({
          radius: 1.2 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 0.25 / resolution
          }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: 0.4 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution
          }),
        }),
      }),
    ];
    // Definition Style "Lagefixpunkt 3 auf Kreuz"
    const style_Kreuz = [
      new Style({
        image: new Circle({
          radius: 1.2 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 0.25 / resolution,
          }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: 0.4 / resolution,
          fill: new Fill({
            color: 'white',
          }),
          stroke: new Stroke({
            color: 'black', 
            width: 0.25 / resolution,
          }),
        }),
      }),
      new Style({
        image:new RegularShape({
          points: 4,
          radius: 1.2 / resolution,
          radius2: 0,
          stroke: new Stroke({
            width: 0.25 / resolution, 
            color: 'black',
          }),
          angle: Math.PI/4,
        }),
      }),
    ];
    //Zuordnung der entsprechenden Symbolisierung nach Attribut "Punktzeichen"
    if (feature.get('Kategorie') == 'LFP3') {
      if (feature.get('Punktzeichen') == 'Stein' || feature.get('Punktzeichen') == 'Kunststoffzeichen') {
        return style_Stein;
      }
      else if (feature.get('Punktzeichen') == 'Bolzen') {
        return style_Bolzen;
      }
      else if (feature.get('Punktzeichen') == 'Rohr' || feature.get('Punktzeichen') == 'Pfahl') {
        return style_Rohr;
      }
      else if (feature.get('Punktzeichen') == 'Kreuz') {
        return style_Kreuz;
      };
    };
  },
});

// Hintergrundkarten als WMS (GetMap Abfrage)
// -------------------------------------------------------------------------------------------------

// Pixelkarte farbig (maps.geo.admin.ch)
// ------------------------------------------------------------
// Instanziierung und Symbolisierung Tile Layer
const grid_Overview_color = new TileLayer({
  id: "background_pixelkarte_color",
  source: new TileWMS({
    url: 'https://wms.geo.admin.ch/', 
    attributions: 'Hintergrund: ' + 
                  '<a target="new" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>',
    params: {
      'LAYERS': 'ch.swisstopo.pixelkarte-farbe',
      'FORMAT': 'image/png',
      'TILED': true,
      'VERSION': '1.1.1',
    },
    serverType: 'mapserver',
  }),
});

// Pixelkarte grau (maps.geo.admin.ch)
// ------------------------------------------------------------
// Instanziierung und Symbolisierung Tile Layer
const grid_Overview_gray = new TileLayer({
  id: "background_pixelkarte_gray",
  source: new TileWMS({
    url: 'https://wms.geo.admin.ch/', 
    attributions: 'Hintergrund: ' + 
                  '<a target="new" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>',
    params: {
      'LAYERS': 'ch.swisstopo.pixelkarte-grau',
      'FORMAT': 'image/png',
      'TILED': true,
      'VERSION': '1.1.1',
    },
    serverType: 'mapserver',
  }),
});

// Situationsplan farbig (geodienste.ch)
// ------------------------------------------------------------
// Instanziierung und Symbolisierung Image Layer
const grid_AV_color = new ImageLayer({
  id: "background_av_color",
  source: new ImageWMS({
    url: 'https://geodienste.ch/db/avc?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap',
    attributions: 'Hintergrund: ' + 
                  '<a target="new" href="https://geodienste.ch/">geodienste.ch</a>',
    params: {
      'LAYERS':'Liegenschaften,Bodenbedeckung,Einzelobjekte,Gebaeudeadressen,Nomenklatur,Fixpunkte'
    },
  }), 
});

// Situationsplan grau (geodienste.ch)
// ------------------------------------------------------------
// Instanziierung und Symbolisierung Image Layer
const grid_AV_gray = new ImageLayer({
  id: "background_av_gray",
  source: new ImageWMS({
    url: 'https://geodienste.ch/db/av?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap',
    attributions: 'Hintergrund: ' + 
                  '<a target="new" href="https://geodienste.ch/">geodienste.ch</a>',
    params: {
      'LAYERS':'Liegenschaften,Bodenbedeckung,Einzelobjekte,Gebaeudeadressen,Nomenklatur,Fixpunkte'
    },
  }), 
});

// Swissimage (wms.geo.admin.ch)
// ------------------------------------------------------------
// Instanziierung und Symbolisierung Tile Layer
const grid_Orthophoto = new TileLayer({
  id: "background_swissimage",
  source: new TileWMS({
    url: 'https://wms.geo.admin.ch/', 
    attributions: 'Hintergrund: ' + 
                  '<a target="new" href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>' + 
                  ' / ' +
                  '<a target="new" href="https://geodienste.ch/">geodienste.ch</a>',
    params: {
      'LAYERS': 'ch.swisstopo.swissimage',
      'FORMAT': 'image/png',
      'TILED': true,
      'VERSION': '1.1.1',
    },
    serverType: 'mapserver',
  }),
});

// Exportieren der Definitionen fuer die Weiterverwendung in weiteren JavaScript-Files.
/* Quelle: Coding Shiksha. (22.11.2022). 
   Javascript ES6 Modules Tutorial to Split Code in Multiple Files Using Import & Export Statements. 
   YouTube. URL: https://youtu.be/vMaKxS__kb4 [Abgerufen: 06.04.2023] */
// -------------------------------------------------------------------------------------------------
export default {
  vect_Liegenschaften,
  vect_ProjLiegenschaften,
  vect_SDR,
  vect_ProjSDR,
  vect_Grenzpunkte,
  vect_Gemeinden,
  vect_Hoheitsgrenzpunkte,
  vect_Fixpunkte,
  grid_AV_color,
  grid_AV_gray,
  grid_Orthophoto,
  grid_Overview_color,
  grid_Overview_gray,
};
// -------------------------------------------------------------------------------------------------