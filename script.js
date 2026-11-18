const formulario = document.getElementById("form-busqueda");
const campoBusqueda = document.getElementById("busqueda");
const galeria = document.getElementById("lista-fauna");
const mensajeSinResultados = document.getElementById("sin-resultados");
const contadorEspecies = document.getElementById("results-count");
const botonesFiltro = [...document.querySelectorAll(".filter-row > .filter-button")];
const filtroCategoria = document.getElementById("filtro-categoria");
const dialogo = document.getElementById("species-dialog");
const contenidoDialogo = document.getElementById("dialog-content");
const pestanasFuego = [...document.querySelectorAll(".fire-tabs [role='tab']")];
const panelFuego = document.getElementById("panel-incendio");
const acciones = [...document.querySelectorAll(".action-item")];
const progreso = document.getElementById("progress-fill");
const contadorProgreso = document.getElementById("progress-count");
const formularioExplorador = document.getElementById("explorer-form");
const busquedaExplorador = document.getElementById("explorer-search-input");
const filtrosExplorador = [...document.querySelectorAll(".explorer-filter")];
const ordenExplorador = document.getElementById("explorer-sort");
const resultadosExplorador = document.getElementById("explorer-results");
const destacadosExplorador = document.getElementById("explorer-featured-list");
const conteoExplorador = document.getElementById("explorer-count");
const sinResultadosExplorador = document.getElementById("explorer-empty");
const botonLimpiarExplorador = document.getElementById("explorer-clear");
const botonesMostrarTodos = [...document.querySelectorAll(".explorer-show-all")];

const nombresCategorias = {
  mamifero: "Mamíferos",
  ave: "Aves",
  reptil: "Reptiles",
  anfibio: "Anfibios",
  planta: "Plantas",
  pez: "Peces"
};

const placeholderImagen = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'%3E%3Crect width='800' height='520' fill='%23d9dece'/%3E%3Ctext x='400' y='250' fill='%2353644c' font-family='Arial' font-size='28' text-anchor='middle'%3EFotograf%C3%ADa pendiente%3C/text%3E%3Ctext x='400' y='290' fill='%23747769' font-family='Arial' font-size='18' text-anchor='middle'%3EContenido e imagen de confirmaci%C3%B3n cient%C3%ADfica%3C/text%3E%3C/svg%3E";
const especies = window.CORDOBA_SPECIES.map((especie) => ({
  ...especie,
  group: especie.group || "animal",
  id: normalizar(especie.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  image: especie.image || {
    url: placeholderImagen,
    credit: "Fotografía pendiente",
    page: "https://commons.wikimedia.org/",
    license: "Pendiente de verificar",
    pending: true
  },
  conservation: especie.conservation || {
    label: "Estado a confirmar",
    detail: "Categoría nacional, provincial o local pendiente de verificar."
  },
  sources: especie.sources || [
    { label: "Sistema de Información de Biodiversidad (SIB)", url: "https://sib.gob.ar/" },
    { label: "Parques Nacionales Argentina", url: "https://www.argentina.gob.ar/parquesnacionales" }
  ]
}));

const contenidoIncendios = {
  antes: {
    titulo: "Un territorio más frágil",
    texto: "La sequía, el viento y la vegetación seca pueden favorecer la propagación. La prevención empieza mucho antes de ver humo."
  },
  durante: {
    titulo: "El fuego desplaza la vida",
    texto: "El humo, el calor y la pérdida de refugio afectan a la fauna. No te acerques ni intentes combatir un incendio: avisá a emergencias."
  },
  despues: {
    titulo: "La recuperación lleva tiempo",
    texto: "El suelo queda expuesto a la erosión y las especies pierden alimento y refugio. El monte necesita protección para regenerarse."
  }
};

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearEnlace(texto, url) {
  const enlace = crearElemento("a", "", texto);
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  return enlace;
}

function crearTarjeta(especie, indice) {
  const tarjeta = crearElemento("article", "species-card");
  tarjeta.dataset.category = especie.category;
  tarjeta.dataset.group = especie.group;

  const visual = crearElemento("div", "species-visual");
  const imagen = document.createElement("img");
  imagen.src = especie.image.url;
  imagen.alt = especie.image.pending
    ? `Fotografía pendiente de confirmar para ${especie.name}`
    : `${especie.name} (${especie.scientific})`;
  imagen.loading = indice < 4 ? "eager" : "lazy";
  imagen.decoding = "async";
  imagen.addEventListener("error", () => {
    imagen.classList.add("image-missing");
    const aviso = crearElemento(
      "span",
      "image-fallback",
      especie.image.pending ? "Fotografía pendiente de verificación" : "No se pudo cargar la fotografía"
    );
    visual.append(aviso);
  }, { once: true });
  visual.append(imagen);

  const credito = crearElemento("small", "photo-credit");
  if (especie.image.pending) {
    credito.textContent = "Fotografía pendiente de confirmación";
  } else {
    credito.append(
      document.createTextNode("Foto: "),
      crearEnlace(especie.image.credit, especie.image.page),
      document.createTextNode(" · "),
      crearEnlace(especie.image.license, especie.image.licenseUrl || especie.image.page)
    );
  }

  const contenido = crearElemento("div", "card-content");
  const meta = crearElemento("div", "card-meta");
  meta.append(
    crearElemento("span", "", nombresCategorias[especie.category]),
    crearElemento("span", `status ${especie.threatened ? "status-danger" : "status-watch"}`, especie.conservation.label)
  );
  const nombre = crearElemento("h3", "", especie.name);
  const cientifico = crearElemento("p", "scientific", especie.scientific);
  const descripcion = crearElemento("p", "", especie.description);
  const pie = crearElemento("div", "card-footer", especie.habitat);
  const boton = crearElemento("button", "species-details-button");
  boton.type = "button";
  boton.append(document.createTextNode("Ver más información "), crearElemento("span", "", "↗"));
  boton.addEventListener("click", () => abrirFicha(especie));

  contenido.append(meta, nombre, cientifico, descripcion, pie, boton);
  tarjeta.append(visual, credito, contenido);
  return tarjeta;
}

function dibujarGaleria() {
  galeria.replaceChildren(...especies.map(crearTarjeta));
  filtrarEspecies();
}

function animalesDelCatalogo() {
  return especies.filter((especie) => especie.group === "animal");
}

function crearTarjetaExplorador(especie, indice, lista) {
  const tarjeta = crearElemento("article", "explorer-card");
  const enlace = crearElemento("a", "explorer-card-link");
  const urlFicha = new URL(window.location.href);
  urlFicha.searchParams.set("especie", especie.id);
  urlFicha.hash = "explorador";
  enlace.href = `${urlFicha.pathname}${urlFicha.search}${urlFicha.hash}`;
  enlace.setAttribute("aria-label", `Abrir ficha de ${especie.name}`);
  enlace.addEventListener("click", (evento) => {
    evento.preventDefault();
    abrirFicha(especie, lista);
  });

  const visual = crearElemento("div", "explorer-card-visual");
  const imagen = document.createElement("img");
  imagen.src = especie.image.url;
  imagen.alt = especie.image.pending
    ? `Fotografía pendiente de confirmar para ${especie.name}`
    : `${especie.name} (${especie.scientific})`;
  imagen.loading = indice < 4 ? "eager" : "lazy";
  imagen.decoding = "async";
  imagen.addEventListener("error", () => {
    imagen.classList.add("image-missing");
    visual.append(crearElemento(
      "span",
      "explorer-image-fallback",
      especie.image.pending ? "Fotografía pendiente de verificación" : "No se pudo cargar la fotografía"
    ));
  }, { once: true });
  if (especie.image.pending) {
    imagen.classList.add("image-missing");
    visual.append(imagen, crearElemento("span", "explorer-image-fallback", "Fotografía pendiente de verificación"));
  } else {
    visual.append(imagen);
  }

  const contenido = crearElemento("div", "explorer-card-content");
  const meta = crearElemento("div", "explorer-card-meta");
  meta.append(
    crearElemento("span", "", nombresCategorias[especie.category]),
    especie.threatened
      ? crearElemento("span", "status status-danger", "Amenazada")
      : crearElemento("span", "status status-watch", "Estado a confirmar")
  );
  contenido.append(
    meta,
    crearElemento("h3", "", especie.name),
    crearElemento("p", "scientific", especie.scientific),
    crearElemento("p", "explorer-habitat", especie.habitat),
    crearElemento("p", "explorer-description", especie.description),
    crearElemento("span", "explorer-card-cta", "Abrir ficha ↗")
  );
  enlace.append(visual, contenido);
  tarjeta.append(enlace);

  const credito = crearElemento("small", "explorer-photo-credit");
  if (especie.image.pending) {
    credito.textContent = "Fotografía pendiente de verificación";
  } else {
    credito.append(
      document.createTextNode("Foto: "),
      crearEnlace(especie.image.credit, especie.image.page),
      document.createTextNode(" · "),
      crearEnlace(especie.image.license, especie.image.licenseUrl || especie.image.page)
    );
  }
  tarjeta.append(credito);
  return tarjeta;
}

function actualizarExplorador() {
  const todosLosAnimales = animalesDelCatalogo();
  const categoriasActivas = new Set(
    filtrosExplorador
      .filter((filtro) => filtro.dataset.kind === "category" && filtro.classList.contains("active"))
      .map((filtro) => filtro.dataset.value)
  );
  const ambientesActivos = new Set(
    filtrosExplorador
      .filter((filtro) => filtro.dataset.kind === "habitat" && filtro.classList.contains("active"))
      .map((filtro) => filtro.dataset.value)
  );
  const terminos = normalizar(busquedaExplorador.value.trim()).split(/\s+/).filter(Boolean);

  let encontrados = todosLosAnimales.filter((especie) => {
    const textoBuscable = normalizar([
      especie.name,
      especie.scientific,
      especie.category,
      nombresCategorias[especie.category],
      "animal animales fauna",
      especie.habitat,
      ...(especie.habitats || []),
      (especie.habitats || []).map((ambiente) => `animales de las ${ambiente}`).join(" "),
      especie.description,
      especie.behavior,
      especie.ecologicalImportance
    ].join(" "));
    const coincideTexto = terminos.every((termino) => textoBuscable.includes(termino));
    const coincideCategoria = categoriasActivas.size === 0 || categoriasActivas.has(especie.category);
    const coincideAmbiente = ambientesActivos.size === 0 ||
      (especie.habitats || []).some((ambiente) => ambientesActivos.has(ambiente));
    return coincideTexto && coincideCategoria && coincideAmbiente;
  });

  encontrados.sort((a, b) => {
    if (ordenExplorador.value === "threatened" && a.threatened !== b.threatened) {
      return Number(b.threatened) - Number(a.threatened);
    }
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });

  resultadosExplorador.replaceChildren(
    ...encontrados.map((especie, indice) => crearTarjetaExplorador(especie, indice, encontrados))
  );
  conteoExplorador.textContent = `${encontrados.length} ${encontrados.length === 1 ? "animal encontrado" : "animales encontrados"}`;
  sinResultadosExplorador.hidden = encontrados.length > 0;
}

function limpiarFiltrosExplorador() {
  busquedaExplorador.value = "";
  ordenExplorador.value = "alphabetical";
  filtrosExplorador.forEach((filtro) => {
    const seleccionado = filtro.dataset.kind === "category";
    filtro.classList.toggle("active", seleccionado);
    filtro.setAttribute("aria-pressed", String(seleccionado));
  });
  actualizarExplorador();
}

formularioExplorador.addEventListener("submit", (evento) => {
  evento.preventDefault();
  actualizarExplorador();
});
busquedaExplorador.addEventListener("input", actualizarExplorador);
ordenExplorador.addEventListener("change", actualizarExplorador);
filtrosExplorador.forEach((filtro) => {
  filtro.addEventListener("click", () => {
    const seleccionado = !filtro.classList.contains("active");
    filtro.classList.toggle("active", seleccionado);
    filtro.setAttribute("aria-pressed", String(seleccionado));
    actualizarExplorador();
  });
});
botonLimpiarExplorador.addEventListener("click", limpiarFiltrosExplorador);
botonesMostrarTodos.forEach((boton) => {
  boton.addEventListener("click", () => {
    limpiarFiltrosExplorador();
    document.getElementById("explorer-results").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function filtrarEspecies() {
  const consulta = normalizar(campoBusqueda.value.trim());
  const filtroGrupo = document.querySelector("#especies .filter-button.active").dataset.filter;
  const filtroCategoriaActivo = filtroCategoria.value;
  let resultados = 0;

  [...galeria.children].forEach((tarjeta, indice) => {
    const especie = especies[indice];
    const textoBusqueda = normalizar([
      especie.name, especie.scientific, especie.category, especie.habitat,
      especie.description, especie.diet, especie.curiosity
    ].join(" "));
    const coincideTexto = textoBusqueda.includes(consulta);
    const coincideGrupo = filtroGrupo === "todos" || especie.group === filtroGrupo;
    const coincideCategoria = filtroCategoriaActivo === "todas" || especie.category === filtroCategoriaActivo;
    const visible = coincideTexto && coincideGrupo && coincideCategoria;

    tarjeta.hidden = !visible;
    if (visible) resultados++;
  });

  mensajeSinResultados.hidden = resultados > 0;
  mensajeSinResultados.textContent = "No encontramos especies con esos filtros. Probá con otra búsqueda o categoría.";
  contadorEspecies.textContent = `${resultados} ${resultados === 1 ? "especie" : "especies"}`;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  filtrarEspecies();
});

campoBusqueda.addEventListener("input", filtrarEspecies);

botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach((opcion) => {
      const seleccionado = opcion === boton;
      opcion.classList.toggle("active", seleccionado);
      opcion.setAttribute("aria-pressed", String(seleccionado));
    });

    filtrarEspecies();
  });
});

filtroCategoria.addEventListener("change", filtrarEspecies);

let listaFichaActiva = especies;

function abrirFicha(especie, lista = especies) {
  listaFichaActiva = lista;
  const indice = listaFichaActiva.indexOf(especie);
  const imagen = document.createElement("img");
  imagen.className = "dialog-image";
  imagen.src = especie.image.url;
  imagen.alt = especie.image.pending
    ? `Fotografía pendiente de confirmar para ${especie.name}`
    : `${especie.name} (${especie.scientific})`;
  if (especie.image.pending) imagen.classList.add("image-missing");
  imagen.addEventListener("error", () => imagen.classList.add("image-missing"), { once: true });

  const cuerpo = crearElemento("div", "dialog-body");
  const tituloEspecie = crearElemento("h2", "", especie.name);
  tituloEspecie.id = "dialog-title";
  cuerpo.append(
    crearElemento("p", "eyebrow eyebrow-dark", nombresCategorias[especie.category]),
    tituloEspecie,
    crearElemento("p", "scientific", especie.scientific),
    crearElemento("p", "dialog-description", especie.description)
  );

  const datos = crearElemento("div", "detail-grid");
  [
    ["Características físicas", especie.characteristics || especie.description],
    ["Alimentación", especie.diet || "Pendiente de documentar con una fuente verificable."],
    ["Hábitat", especie.habitat],
    ["Distribución en Córdoba", especie.distribution || especie.habitat],
    ["Comportamiento", especie.behavior || "Pendiente de documentar con una fuente verificable."],
    ["Importancia ecológica", especie.ecologicalImportance || "Pendiente de documentar con una fuente verificable."],
    ["Estado de conservación", especie.conservation.detail],
    ["Principales amenazas", especie.threats || "Pendiente de documentar con una fuente verificable."]
  ].forEach(([titulo, texto]) => {
    const bloque = document.createElement("section");
    bloque.append(crearElemento("h3", "", titulo), crearElemento("p", "", texto));
    datos.append(bloque);
  });

  const fuentes = crearElemento("section", "source-list");
  fuentes.append(crearElemento("h3", "", "Fuentes y créditos"));
  const listaFuentes = document.createElement("ul");
  especie.sources.forEach((fuente) => {
    const item = document.createElement("li");
    item.append(crearEnlace(fuente.label, fuente.url));
    listaFuentes.append(item);
  });
  const itemFoto = document.createElement("li");
  if (especie.image.pending) {
    itemFoto.textContent = `Fotografía de ${especie.name}: pendiente de verificación.`;
  } else {
    itemFoto.append(
      document.createTextNode(`Fotografía de ${especie.name}: `),
      crearEnlace(especie.image.credit, especie.image.page),
      document.createTextNode(" ("),
      crearEnlace(especie.image.license, especie.image.licenseUrl || especie.image.page),
      document.createTextNode(")")
    );
  }
  listaFuentes.append(itemFoto);
  fuentes.append(listaFuentes);

  const navegacion = crearElemento("div", "dialog-navigation");
  const anterior = crearElemento("button", "filter-button", "← Anterior");
  const siguiente = crearElemento("button", "filter-button", "Siguiente →");
  anterior.type = "button";
  siguiente.type = "button";
  anterior.disabled = indice <= 0;
  siguiente.disabled = indice < 0 || indice >= listaFichaActiva.length - 1;
  anterior.addEventListener("click", () => abrirFicha(listaFichaActiva[indice - 1], listaFichaActiva));
  siguiente.addEventListener("click", () => abrirFicha(listaFichaActiva[indice + 1], listaFichaActiva));
  navegacion.append(anterior, siguiente);

  const accionesFicha = crearElemento("div", "species-dialog-actions");
  const volverBuscador = crearElemento("button", "filter-button", "Volver al buscador");
  volverBuscador.type = "button";
  volverBuscador.addEventListener("click", () => {
    dialogo.close();
    document.getElementById("explorador").scrollIntoView({ behavior: "smooth" });
  });
  const compartir = crearElemento("button", "filter-button", "Compartir especie");
  compartir.type = "button";
  compartir.addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("especie", especie.id);
    url.hash = "explorador";
    try {
      if (navigator.share) {
        await navigator.share({ title: `${especie.name} | Biodiversidad de Córdoba`, url: url.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url.href);
        compartir.textContent = "Enlace copiado";
      } else {
        window.prompt("Copiá el enlace de esta especie:", url.href);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        window.prompt("Copiá el enlace de esta especie:", url.href);
      }
    }
  });
  accionesFicha.append(volverBuscador, compartir);

  const volverInicio = crearElemento("a", "back-to-home", "Volver al inicio ↑");
  volverInicio.href = "#inicio";
  volverInicio.addEventListener("click", () => dialogo.close());
  cuerpo.append(datos, fuentes, accionesFicha, navegacion, volverInicio);
  contenidoDialogo.replaceChildren(imagen, cuerpo);
  if (!dialogo.open) dialogo.showModal();
}

dialogo.addEventListener("click", (evento) => {
  if (evento.target === dialogo) dialogo.close();
});

function seleccionarPestana(pestana) {
  pestanasFuego.forEach((boton) => {
    const seleccionado = boton === pestana;
    boton.setAttribute("aria-selected", String(seleccionado));
    boton.tabIndex = seleccionado ? 0 : -1;
  });

  const contenido = contenidoIncendios[pestana.dataset.tab];
  const titulo = document.createElement("h3");
  const texto = document.createElement("p");
  const indice = document.createElement("span");
  const descripcion = document.createElement("div");

  titulo.textContent = contenido.titulo;
  texto.textContent = contenido.texto;
  indice.className = "panel-index";
  indice.textContent = String(pestanasFuego.indexOf(pestana) + 1).padStart(2, "0");

  descripcion.append(titulo, texto);
  panelFuego.replaceChildren(indice, descripcion);
  panelFuego.setAttribute("aria-labelledby", pestana.id);
}

pestanasFuego.forEach((pestana, indice) => {
  pestana.addEventListener("click", () => seleccionarPestana(pestana));
  pestana.addEventListener("keydown", (evento) => {
    let siguiente = indice;

    if (evento.key === "ArrowRight") siguiente = (indice + 1) % pestanasFuego.length;
    else if (evento.key === "ArrowLeft") siguiente = (indice - 1 + pestanasFuego.length) % pestanasFuego.length;
    else if (evento.key === "Home") siguiente = 0;
    else if (evento.key === "End") siguiente = pestanasFuego.length - 1;
    else return;

    evento.preventDefault();
    pestanasFuego[siguiente].focus();
    seleccionarPestana(pestanasFuego[siguiente]);
  });
});

function actualizarProgreso() {
  const completadas = acciones.filter((accion) => accion.getAttribute("aria-pressed") === "true").length;
  progreso.style.width = `${(completadas / acciones.length) * 100}%`;
  contadorProgreso.textContent = `${completadas} / ${acciones.length}`;
}

acciones.forEach((accion) => {
  accion.addEventListener("click", () => {
    const marcada = accion.getAttribute("aria-pressed") !== "true";
    accion.setAttribute("aria-pressed", String(marcada));
    actualizarProgreso();
  });
});

dibujarGaleria();
const animales = animalesDelCatalogo();
const especiesDestacadas = ["Puma", "Cóndor andino", "Aguará guazú", "Carpincho"]
  .map((nombre) => animales.find((especie) => especie.name === nombre))
  .filter(Boolean);
destacadosExplorador.replaceChildren(
  ...especiesDestacadas.map((especie, indice) => crearTarjetaExplorador(especie, indice, animales))
);
actualizarExplorador();

const especieCompartida = new URLSearchParams(window.location.search).get("especie");
if (especieCompartida) {
  const especie = especies.find((elemento) => elemento.id === especieCompartida);
  if (especie) abrirFicha(especie, especie.group === "animal" ? animales : especies);
}
