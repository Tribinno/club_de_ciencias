window.FIRE_DASHBOARD_DATA = {
  localities: [
    "La Falda",
    "Villa Giardino",
    "Huerta Grande",
    "Valle Hermoso",
    "Cosquín",
    "Santa María de Punilla",
    "Bialet Massé",
    "Villa Carlos Paz",
    "Tanti",
    "Capilla del Monte",
    "La Cumbre",
    "Los Cocos",
    "San Antonio de Arredondo",
    "Cabalango"
  ],
  maps: {
    territorial: {
      label: "Riesgo local",
      viewer: "https://mapascordoba.gob.ar/viewer/mapa/353",
      description: "Riesgo local territorial: una capa regional de amenaza y vulnerabilidad, distinta del índice meteorológico diario."
    },
    fwi: {
      label: "Peligro meteorológico FWI",
      viewer: "https://mapascordoba.gob.ar/viewer/mapa/442",
      description: "Índice Meteorológico de Peligro de Incendios (FWI), calculado diariamente. Consultá en el visor su fecha y período de referencia."
    }
  },
  sources: {
    fwi: "https://mapascordoba.gob.ar/viewer/mapa/442",
    territorial: "https://www.idecor.gob.ar/mapas/mapa-de-riesgo-local-para-incendios-forestales/",
    fwiPage: "https://www.idecor.gob.ar/mapas/indice-meteorologico-de-peligro-de-incendios-fwi-diario/",
    snmf: "https://www.argentina.gob.ar/seguridad/servicio-nacional-de-manejo-del-fuego/evaluacion-de-peligro-y-alerta-temprana/mapa-de",
    smn: "https://www.smn.gob.ar/indices_peligro_fuego",
    smnAlerts: "https://www.smn.gob.ar/alertas",
    affected: "https://www.idecor.gob.ar/mapas/mapa-areas-afectadas-por-incendios-2026/"
  },
  autoRefreshMilliseconds: 30 * 60 * 1000
};
