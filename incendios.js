(function () {
  "use strict";

  const data = window.FIRE_DASHBOARD_DATA;
  const frame = document.getElementById("fire-map-frame");
  const frameFallback = document.getElementById("fire-map-fallback");
  const mapDescription = document.getElementById("fire-map-description");
  const mapOpen = document.getElementById("fire-map-open");
  const lastCheck = document.getElementById("fire-last-check");
  const refreshButton = document.getElementById("fire-refresh");
  const localityForm = document.getElementById("fire-locality-form");
  const localityInput = document.getElementById("fire-locality-input");
  const localityList = document.getElementById("fire-localities");
  const localityResult = document.getElementById("fire-locality-result");
  const localityError = document.getElementById("fire-locality-error");
  const mapButtons = Array.from(document.querySelectorAll(".fire-map-tab"));

  if (!data || !frame || !refreshButton || !localityForm) {
    throw new Error("No se pudo inicializar el panel de prevención de incendios.");
  }

  Object.keys(data.sources).forEach(function (key) {
    document.querySelectorAll('[data-source-link="' + key + '"]').forEach(function (link) {
      link.href = data.sources[key];
    });
  });

  data.localities.forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    localityList.appendChild(option);
  });

  let activeMap = "territorial";
  let lastRequestedAt = 0;

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "long",
      timeStyle: "short"
    }).format(date);
  }

  function requestMap(mapKey, forceReload) {
    const map = data.maps[mapKey];
    if (!map) {
      throw new Error("No existe la capa oficial solicitada: " + mapKey);
    }

    activeMap = mapKey;
    mapDescription.textContent = map.description;
    mapOpen.href = map.viewer;
    mapOpen.setAttribute("aria-label", "Abrir mapa oficial: " + map.label);
    mapButtons.forEach(function (button) {
      const selected = button.dataset.map === mapKey;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    const now = Date.now();
    if (forceReload || frame.src !== map.viewer) {
      frameFallback.hidden = true;
      frame.src = map.viewer;
      lastRequestedAt = now;
      lastCheck.dateTime = new Date(now).toISOString();
      lastCheck.textContent = formatDateTime(new Date(now));
    }
  }

  function refreshActiveMap() {
    frameFallback.hidden = true;
    const now = Date.now();
    frame.src = data.maps[activeMap].viewer;
    lastRequestedAt = now;
    lastCheck.dateTime = new Date(now).toISOString();
    lastCheck.textContent = formatDateTime(new Date(now));
  }

  function normalize(value) {
    return value.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function createLocalityResult(name) {
    localityResult.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = name;
    const note = document.createElement("p");
    note.className = "fire-locality-notice";
    note.textContent = "Esta página no dispone de una consulta de datos por localidad. El mapa IDECOR incluye el corredor de Punilla, pero no se asigna aquí un nivel territorial ni meteorológico sin un dato específico verificable.";

    const details = document.createElement("dl");
    [
      ["Riesgo territorial", "Sin dato puntual en esta página; consultá la capa oficial de IDECOR."],
      ["Índice meteorológico (FWI)", "Sin dato puntual en esta página; consultá el visor diario."],
      ["Fecha y condiciones meteorológicas", "No disponibles en este panel. Verificá la fecha dentro de las fuentes oficiales."],
      ["Alertas oficiales", "No hay un feed conectado. Esto no confirma ausencia de alertas."]
    ].forEach(function (item) {
      const term = document.createElement("dt");
      term.textContent = item[0];
      const description = document.createElement("dd");
      description.textContent = item[1];
      details.append(term, description);
    });

    const sourceLink = document.createElement("a");
    sourceLink.className = "fire-button fire-button-outline";
    sourceLink.href = data.maps.territorial.viewer;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = "Consultar mapa IDECOR";

    const recommendation = document.createElement("p");
    recommendation.className = "fire-locality-recommendation";
    recommendation.textContent = "Prevención: no enciendas fuego, respetá las restricciones vigentes y seguí las indicaciones de Bomberos y Defensa Civil.";

    localityResult.append(heading, note, details, sourceLink, recommendation);
  }

  mapButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      requestMap(button.dataset.map, button.dataset.map === activeMap);
    });
  });

  refreshButton.addEventListener("click", refreshActiveMap);

  frame.addEventListener("error", function () {
    frameFallback.hidden = false;
  });

  localityForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = normalize(localityInput.value);
    const match = data.localities.find(function (name) {
      return normalize(name) === query;
    });

    localityError.hidden = Boolean(match);
    if (match) {
      createLocalityResult(match);
    } else {
      localityResult.replaceChildren();
      localityInput.focus();
    }
  });

  localityInput.addEventListener("input", function () {
    if (!localityError.hidden) localityError.hidden = true;
  });

  requestMap(activeMap, true);

  window.setInterval(function () {
    if (!document.hidden && Date.now() - lastRequestedAt >= data.autoRefreshMilliseconds) {
      refreshActiveMap();
    }
  }, data.autoRefreshMilliseconds);
}());
