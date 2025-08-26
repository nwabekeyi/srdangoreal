import { mapTilerKey } from '../secrets.js';

export function initMap(coordinates, title) {
    console.log(coordinates)
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found (#map)');
    return;
  }

  try {
    // Initialize MapTiler map
    maptilersdk.config.apiKey = mapTilerKey;
    const map = new maptilersdk.Map({
      container: 'map',
      style: maptilersdk.MapStyle.STREETS, // Default streets style
      center: [coordinates.lng, coordinates.lat],
      zoom: 14, // Adjust zoom level for property view
    });

    // Add a marker
    new maptilersdk.Marker()
      .setLngLat([coordinates.lng, coordinates.lat])
      .setPopup(
        new maptilersdk.Popup({ offset: 25 })
          .setHTML(`<h5>${title}</h5><p>${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}</p>`)
      )
      .addTo(map);
  } catch (err) {
    console.error('Error initializing MapTiler map:', err);
    mapContainer.style.display = 'none'; // Hide map on error
  }
}