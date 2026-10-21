const formulario = document.getElementById("form-busqueda");
const campoBusqueda = document.getElementById("busqueda");
const animales = [...document.querySelectorAll("#lista-fauna article")];
const mensajeSinResultados = document.getElementById("sin-resultados");

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function filtrarAnimales() {
  const consulta = normalizar(campoBusqueda.value.trim());
  let resultados = 0;

  animales.forEach((animal) => {
    const coincide = normalizar(animal.textContent).includes(consulta);
    animal.hidden = !coincide;
    if (coincide) resultados++;
  });

  mensajeSinResultados.hidden = resultados > 0;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  filtrarAnimales();
});

campoBusqueda.addEventListener("input", filtrarAnimales);
