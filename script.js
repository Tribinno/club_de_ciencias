const formulario = document.getElementById("form-busqueda");
const campoBusqueda = document.getElementById("busqueda");
const galeria = document.getElementById("lista-fauna");
const mensajeSinResultados = document.getElementById("sin-resultados");
const contadorEspecies = document.getElementById("results-count");
const botonesFiltro = [...document.querySelectorAll(".filter-button")];
const filtroCategoria = document.getElementById("filtro-categoria");
const dialogo = document.getElementById("species-dialog");
const contenidoDialogo = document.getElementById("dialog-content");
const pestanasFuego = [...document.querySelectorAll(".fire-tabs [role='tab']")];
const panelFuego = document.getElementById("panel-incendio");
const acciones = [...document.querySelectorAll(".action-item")];
const progreso = document.getElementById("progress-fill");
const contadorProgreso = document.getElementById("progress-count");

const especies = [];

const nombresCategorias = {
  mamifero: "Mamíferos",
  ave: "Aves",
  reptil: "Reptiles",
  anfibio: "Anfibios",
  planta: "Plantas"
};

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
  imagen.alt = `${especie.name} (${especie.scientific}) en su ambiente natural`;
  imagen.loading = indice < 4 ? "eager" : "lazy";
  imagen.decoding = "async";
  imagen.addEventListener("error", () => {
    imagen.classList.add("image-missing");
    const aviso = crearElemento("span", "image-fallback", "Foto no disponible");
    visual.append(aviso);
  }, { once: true });
  visual.append(imagen);

  const credito = crearElemento("small", "photo-credit");
  credito.append(
    document.createTextNode("Foto: "),
    crearEnlace(especie.image.credit, especie.image.page),
    document.createTextNode(` · ${especie.image.license}`)
  );

  const contenido = crearElemento("div", "card-content");
  const meta = crearElemento("div", "card-meta");
  meta.append(
    crearElemento("span", "", nombresCategorias[especie.category]),
    crearElemento("span", "status status-watch", especie.conservation.label)
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

function filtrarEspecies() {
  const consulta = normalizar(campoBusqueda.value.trim());
  const filtroGrupo = document.querySelector(".filter-button.active").dataset.filter;
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

function abrirFicha(especie) {
  const indice = especies.indexOf(especie);
  const imagen = document.createElement("img");
  imagen.className = "dialog-image";
  imagen.src = especie.image.url;
  imagen.alt = `${especie.name} (${especie.scientific})`;
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
    ["Hábitat en Córdoba", especie.habitat],
    ["Alimentación", especie.diet],
    ["Conservación", especie.conservation.detail],
    ["Dato curioso", especie.curiosity]
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
  itemFoto.append(
    document.createTextNode(`Fotografía de ${especie.name}: `),
    crearEnlace(especie.image.credit, especie.image.page),
    document.createTextNode(` (${especie.image.license})`)
  );
  listaFuentes.append(itemFoto);
  fuentes.append(listaFuentes);

  const navegacion = crearElemento("div", "dialog-navigation");
  const anterior = crearElemento("button", "filter-button", "← Anterior");
  const siguiente = crearElemento("button", "filter-button", "Siguiente →");
  anterior.type = "button";
  siguiente.type = "button";
  anterior.disabled = indice === 0;
  siguiente.disabled = indice === especies.length - 1;
  anterior.addEventListener("click", () => abrirFicha(especies[indice - 1]));
  siguiente.addEventListener("click", () => abrirFicha(especies[indice + 1]));
  navegacion.append(anterior, siguiente);

  cuerpo.append(datos, fuentes, navegacion);
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
