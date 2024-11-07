// API Key de OpenWeatherMap
const apiKey = '54fb37f0f575fcc31840ec316bff8962';

// Inicializar el mapa centrado en la región de Ñuble (Chile)
const map = L.map('map').setView([-36.6118, -71.6755], 10);

// Capa de mapa base (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Variables para cultivos y recordatorios
let cultivos = [];
let recordatorios = [];
let currentMarker = null;
let latSeleccionada = null;
let lonSeleccionada = null;

// Función para mostrar el clima en la ubicación seleccionada
function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const weatherInfo = `
        <p><strong>Ciudad:</strong> ${data.name}</p>
        <p><strong>Temperatura:</strong> ${data.main.temp} °C</p>
        <p><strong>Condición:</strong> ${data.weather[0].description}</p>
        <p><strong>Humedad:</strong> ${data.main.humidity}%</p>
      `;
      document.getElementById('clima-info').innerHTML = weatherInfo;
    })
    .catch(error => {
      console.error('Error al obtener el clima:', error);
      document.getElementById('clima-info').innerHTML = "<p>Error al obtener el clima. Intenta nuevamente.</p>";
    });
}

// Función para agregar un cultivo
document.getElementById('form-cultivo').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombreCultivo = document.getElementById('nombre-cultivo').value;

  if (!latSeleccionada || !lonSeleccionada) {
    alert('Por favor, selecciona una ubicación en el mapa primero.');
    return;
  }

  if (nombreCultivo) {
    const cultivo = { nombre: nombreCultivo, lat: latSeleccionada, lon: lonSeleccionada };
    cultivos.push(cultivo);

    // Actualizar el campo de selección de cultivos en el formulario de recordatorios
    const selectCultivoRiego = document.getElementById('cultivo-riego');
    const option = document.createElement('option');
    option.value = nombreCultivo;
    option.textContent = nombreCultivo;
    selectCultivoRiego.appendChild(option);

    const marker = L.marker([latSeleccionada, lonSeleccionada]).addTo(map)
      .bindPopup(`<b>${nombreCultivo}</b><br>Ubicación: ${latSeleccionada}, ${lonSeleccionada}`)
      .openPopup();

    cultivo.marker = marker;

    // Agregar a la lista de cultivos en la interfaz
    const listaCultivos = document.getElementById('cultivos-lista');
    const li = document.createElement('li');
    li.innerHTML = `${nombreCultivo} - <button onclick="eliminarCultivo('${nombreCultivo}')">Eliminar</button>`;
    listaCultivos.appendChild(li);

    // Limpiar el campo de entrada de cultivo
    document.getElementById('nombre-cultivo').value = '';
  } else {
    alert('Por favor, ingresa el nombre del cultivo.');
  }
});

// Función para eliminar un cultivo
function eliminarCultivo(nombre) {
  const cultivoIndex = cultivos.findIndex(cultivo => cultivo.nombre === nombre);
  if (cultivoIndex !== -1) {
    const cultivo = cultivos[cultivoIndex];
    cultivos.splice(cultivoIndex, 1);
    map.removeLayer(cultivo.marker);

    // Eliminar de la lista de cultivos en la interfaz
    const listaCultivos = document.getElementById('cultivos-lista');
    const items = listaCultivos.getElementsByTagName('li');
    for (let item of items) {
      if (item.textContent.includes(nombre)) {
        item.remove();
        break;
      }
    }

    // Eliminar la opción del campo de selección de riego
    const selectCultivoRiego = document.getElementById('cultivo-riego');
    const options = selectCultivoRiego.getElementsByTagName('option');
    for (let option of options) {
      if (option.value === nombre) {
        option.remove();
        break;
      }
    }
  }
}

// Función para agregar un recordatorio de riego
document.getElementById('form-riego').addEventListener('submit', function(e) {
  e.preventDefault();
  const cultivoRiego = document.getElementById('cultivo-riego').value;
  const fechaRiego = document.getElementById('fecha-riego').value;

  if (!cultivoRiego || !fechaRiego) {
    alert('Por favor, selecciona un cultivo y una fecha de riego.');
    return;
  }

  // Agregar el recordatorio al array
  recordatorios.push({ nombre: cultivoRiego, fecha: fechaRiego });

  // Mostrar en la lista de recordatorios
  const listaRecordatorios = document.getElementById('recordatorios-lista');
  const li = document.createElement('li');
  li.innerHTML = `${cultivoRiego} - Riego: ${fechaRiego} <button onclick="eliminarRecordatorio('${cultivoRiego}')">Eliminar</button>`;
  listaRecordatorios.appendChild(li);

  // Limpiar los campos del formulario de riego
  document.getElementById('cultivo-riego').value = '';
  document.getElementById('fecha-riego').value = '';
});

// Función para eliminar un recordatorio de riego
function eliminarRecordatorio(nombre) {
  const recordatorioIndex = recordatorios.findIndex(riego => riego.nombre === nombre);
  if (recordatorioIndex !== -1) {
    recordatorios.splice(recordatorioIndex, 1); // Eliminar recordatorio del array
    // Eliminar de la lista de recordatorios en la interfaz
    const listaRecordatorios = document.getElementById('recordatorios-lista');
    const items = listaRecordatorios.getElementsByTagName('li');
    for (let item of items) {
      if (item.textContent.includes(nombre)) {
        item.remove();
        break;
      }
    }
  }
}

// Manejador de clic en el mapa para seleccionar ubicación
map.on('click', function(e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  // Si ya hay un marcador, lo actualizamos
  if (currentMarker) {
    currentMarker.setLatLng(e.latlng);
  } else {
    // Si no hay un marcador, lo creamos
    currentMarker = L.marker([lat, lon]).addTo(map);
  }

  // Guardar la latitud y longitud seleccionadas
  latSeleccionada = lat;
  lonSeleccionada = lon;

  // Obtener el clima de esa ubicación
  getWeather(lat, lon);
});
