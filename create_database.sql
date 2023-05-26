-- Erstellen einer neuen Datenbank
CREATE DATABASE vermarkung
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE vermarkung
    IS 'Datenbank dient der Verwaltung von Vermarkungen.';

-- Erstellen der PostGIS-Erweiterung für die Datenbank
CREATE EXTENSION postgis;

-- Erstellen der Tabelle Auftraege
CREATE TABLE auftraege ( 
  auftr_pk_id SERIAL PRIMARY KEY,
  auftr_typ VARCHAR(255) NOT NULL,
  auftr_nummer VARCHAR(20) NOT NULL,
  auftr_status VARCHAR(255) NOT NULL,
  auftr_erfassung DATE NOT NULL,
  auftr_faelligkeit DATE,
  auftr_abschluss DATE,
  auftr_gemeinde VARCHAR(255) NOT NULL,
  auftr_flaeche GEOMETRY(Polygon, 2056) NOT NULL);

-- Erstellen der Tabelle Grenzpunkte 
CREATE TABLE grenzpunkte ( 
  pkt_pk_id SERIAL PRIMARY KEY,
  pkt_fk_auftr INT REFERENCES auftraege (auftr_pk_id),
  pkt_typ VARCHAR(255) NOT NULL,
  pkt_nummer INT,
  pkt_markierung VARCHAR(255) NOT NULL,
  pkt_versicherung VARCHAR(255) NOT NULL,
  pkt_kontrolle VARCHAR(255) NOT NULL,
  pkt_vermarkung DATE,
  pkt_punkt GEOMETRY(Point, 2056) NOT NULL);
  
-- Erstellen der Tabelle Kontrollmasse
 CREATE TABLE kontrollmasse ( 
  ktr_pk_id SERIAL PRIMARY KEY,
  ktr_fk_pkt INT REFERENCES grenzpunkte (pkt_pk_id),
  ktr_soll NUMERIC(10,3),
  ktr_ist NUMERIC(10,3),
  ktr_linie GEOMETRY(Linestring, 2056) NOT NULL);
  
-- Raeumliche Indizierung der Tabellen
CREATE INDEX index_auftraege ON auftraege USING GIST (auftr_flaeche);
CREATE INDEX index_grenzpunkte ON grenzpunkte USING GIST (pkt_punkt);
CREATE INDEX index_kontrollmasse ON kontrollmasse USING GIST (ktr_linie);