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

    const marker = L.marker([latSeleccionada, lonSeleccionada]).addTo(map)
      .bindPopup(`<b>${nombreCultivo}</b><br>Ubicación: ${latSeleccionada}, ${lonSeleccionada}`)
      .openPopup();

    cultivo.marker = marker;

    const listaCultivos = document.getElementById('cultivos-lista');
    const li = document.createElement('li');
    li.innerHTML = `${nombreCultivo} - <button onclick="eliminarCultivo('${nombreCultivo}')">Eliminar</button>`;
    listaCultivos.appendChild(li);

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

    const listaCultivos = document.getElementById('cultivos-lista');
    const items = listaCultivos.getElementsByTagName('li');
    for (let item of items) {
      if (item.textContent.includes(nombre)) {
        item.remove();
        break;
      }
    }
  }
}

// Función para manejar el clic en el mapa
map.on('click', function(e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  if (currentMarker) {
    currentMarker.setLatLng(e.latlng);
  } else {
    currentMarker = L.marker([lat, lon]).addTo(map);
  }

  latSeleccionada = lat;
  lonSeleccionada = lon;

  getWeather(lat, lon);
});
