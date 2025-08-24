// utils/storage/index.js
// Save property details to sessionStorage
export function savePropertyDetails(property) {
    try {
      sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    } catch (err) {
      console.error('Error saving property to sessionStorage:', err);
    }
  }
  
  // Retrieve property details from sessionStorage
  export function getPropertyDetails() {
    try {
      const property = sessionStorage.getItem('selectedProperty');
      return property ? JSON.parse(property) : null;
    } catch (err) {
      console.error('Error retrieving property from sessionStorage:', err);
      return null;
    }
  }