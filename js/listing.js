// js/index.js
import { getAllDocs } from '../utils/queries/index.js';
import { showLoader, removeLoader } from '../utils/loader/index.js';
import { savePropertyDetails } from '../utils/storage/index.js';

// Load properties dynamically into #property-list
export async function loadProperties() {
  const propertyList = document.getElementById('property-list');
  if (!propertyList) {
    console.error('Property list container not found (#property-list)');
    return;
  }

  try {
    showLoader();
    const properties = await getAllDocs('properties');
    let html = '';

    if (properties.length === 0) {
      html = '<p class="text-center">No properties available at this time.</p>';
    } else {
      // Check if on index.html
      const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      const displayLimit = isIndexPage ? 9 : properties.length; // Limit to 9 on index.html, else show all
      const propertiesToShow = properties.slice(0, displayLimit); // Get up to 9 properties

      propertiesToShow.forEach((property, index) => {
        html += `
          <div class="col-12 col-md-6 col-xl-4">
            <div class="single-featured-property mb-50 wow fadeInUp" data-wow-delay="${100 * (index + 1)}ms">
              <!-- Property Thumbnail -->
              <div class="property-thumb">
                <a href="#" class="property-link" data-property-id="${property.id}">
                  <img src="${property.imageUrls?.[0] || 'img/bg-img/feature1.jpg'}" alt="${property.title || 'Property Image'}">
                </a>
                <div class="tag">
                  <span>${property.tag || 'For Sale'}</span>
                </div>
                <div class="list-price">
                  <p>₦${property.price ? property.price.toLocaleString('en-NG') : 'N/A'}</p>
                </div>
                <h5>${property.title || 'Untitled Property'}</h5>
              </div>
              <!-- Property Content -->
              <div class="property-content">
                <p class="location"><img src="img/icons/location.png" alt="Location">${property.city || 'Unknown Location'}</p>
                <p>${property.description ? property.description.substring(0, 100) + '...' : 'No description available.'}</p>
                <div class="property-meta-data d-flex align-items-end justify-content-between">
                  <div class="new-tag">
                    <img src="img/icons/new.png" alt="New">
                  </div>
                  <div class="bathroom">
                    <img src="img/icons/bathtub.png" alt="Bathroom">
                    <span>${property.bathrooms || 0}</span>
                  </div>
                  <div class="garage">
                    <img src="img/icons/garage.png" alt="Garage">
                    <span>${property.garage || 0}</span>
                  </div>
                  <div class="space">
                    <img src="img/icons/space.png" alt="Space">
                    <span>${property.space || 0} sq ft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Add "View More" button if on index.html and there are more than 9 properties
      if (isIndexPage && properties.length > 9) {
        html += `
          <div class="col-12 text-center mt-4">
            <a href="listings.html" class="btn south-btn">View More</a>
          </div>
        `;
      }
    }

    propertyList.innerHTML = html;

    // Add click event listeners for property links
    document.querySelectorAll('.property-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const propertyId = link.getAttribute('data-property-id');
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          savePropertyDetails(property);
          window.location.href = `single-listings.html?id=${property.id}`;
        }
      });
    });
  } catch (err) {
    console.error('Error loading properties:', err);
    propertyList.innerHTML = '<p class="text-center">Error loading properties. Please try again later.</p>';
  } finally {
    removeLoader();
  }
}