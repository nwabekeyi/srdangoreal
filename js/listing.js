// js/listing.js
import { db, collection, query, where, getDocs } from '../configs/firebase.js';
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
    propertyList.innerHTML = ''; // Clear existing properties
    if (properties.length === 0) {
      propertyList.innerHTML = '<p class="text-center">No properties available at this time.</p>';
    } else {
      properties.forEach((property, index) => {
        const propertyElement = document.createElement('div');
        propertyElement.className = 'col-12 col-md-6 col-xl-4';
        propertyElement.innerHTML = `
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
              <p class="location"><img src="img/icons/location.png" alt="Location">${property.location || 'Unknown Location'}</p>
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
        `;
        const link = propertyElement.querySelector('.property-link');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          savePropertyDetails(property);
          window.location.href = `single-listings.html?id=${property.id}`;
        });
        propertyList.appendChild(propertyElement);
      });
    }
  } catch (err) {
    console.error('Error loading properties:', err);
    propertyList.innerHTML = '<p class="text-center">Error loading properties. Please try again later.</p>';
  } finally {
    removeLoader();
  }
}

// Handle search form submission and more filter toggle
export function handleSearch() {
  const searchForm = document.getElementById('advanceSearch');
  const propertyList = document.getElementById('property-list');
  const moreFilter = document.getElementById('moreFilter');
  const secondSteps = document.querySelector('.search-form-second-steps');

  if (!searchForm) {
    console.error('Search form not found (#advanceSearch)');
    return;
  }
  if (!propertyList) {
    console.error('Property list container not found (#property-list)');
    return;
  }
  if (!moreFilter || !secondSteps) {
    console.warn('More filter or second steps not found, skipping filter toggle');
  } else {
    moreFilter.addEventListener('click', (e) => {
      e.preventDefault();
      secondSteps.style.display = secondSteps.style.display === 'none' ? 'block' : 'none';
    });
  }

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();

    try {
      const keyword = searchForm.querySelector('input[name="input"]')?.value.trim().toLowerCase() || '';
      const city = document.getElementById('cities')?.value || 'All Cities';
      const category = document.getElementById('catagories')?.value || 'All Categories';
      const offer = document.getElementById('offers')?.value || 'All Offers';
      const listing = document.getElementById('listings')?.value || 'All Listings';
      const bedrooms = document.getElementById('bedrooms')?.value || 'Bedrooms';
      const bathrooms = document.getElementById('bathrooms')?.value || 'Bathrooms';
      const spaceRange = document.querySelector('.slider-range-price[data-unit=" sq. ft"]');
      const priceRange = document.querySelector('.slider-range-price[data-unit=" mil"]');
      const type = document.getElementById('types')?.value || 'All Types';
      const action = document.getElementById('Actions')?.value || 'All Actions';

      const minSpace = spaceRange ? parseInt(spaceRange.getAttribute('data-value-min')) || 120 : 120;
      const maxSpace = spaceRange ? parseInt(spaceRange.getAttribute('data-value-max')) || 820 : 820;
      const minPrice = priceRange ? parseInt(priceRange.getAttribute('data-value-min')) * 1000000 || 10000000 : 10000000;
      const maxPrice = priceRange ? parseInt(priceRange.getAttribute('data-value-max')) * 1000000 || 1300000000 : 1300000000;

      let q = query(collection(db, 'properties'));
      if (city !== 'All Cities') {
        q = query(q, where('location', '==', city));
      }
      if (category !== 'All Categories') {
        q = query(q, where('type', '==', category));
      }
      if (action !== 'All Actions') {
        q = query(q, where('tag', '==', action));
      }
      if (type !== 'All Types') {
        q = query(q, where('type', '==', type));
      }
      if (bedrooms !== 'Bedrooms') {
        const bedValue = bedrooms === '5+' ? 5 : parseInt(bedrooms);
        q = query(q, where('bedrooms', '>=', bedValue));
      }
      if (bathrooms !== 'Bathrooms') {
        const bathValue = bathrooms === '5+' ? 5 : parseInt(bathrooms);
        q = query(q, where('bathrooms', '>=', bathValue));
      }
      q = query(q, where('space', '>=', minSpace), where('space', '<=', maxSpace));
      q = query(q, where('price', '>=', minPrice), where('price', '<=', maxPrice));

      const snapshot = await getDocs(q);
      let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (keyword) {
        properties = properties.filter(property =>
          (property.title?.toLowerCase().includes(keyword) || false) ||
          (property.description?.toLowerCase().includes(keyword) || false) ||
          (property.location?.toLowerCase().includes(keyword) || false)
        );
      }

      propertyList.innerHTML = '';
      if (properties.length === 0) {
        propertyList.innerHTML = '<p class="text-center">No properties found matching your criteria.</p>';
      } else {
        properties.forEach((property, index) => {
          const propertyElement = document.createElement('div');
          propertyElement.className = 'col-12 col-md-6 col-xl-4';
          propertyElement.innerHTML = `
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
              </div>


              
              <!-- Property Content -->
              <div class="property-content">
                <h5>${property.title || 'Untitled Property'}</h5>
                <p class="location"><img src="img/icons/location.png" alt="Location">${property.location || 'Unknown Location'}</p>
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
          `;
          const link = propertyElement.querySelector('.property-link');
          link.addEventListener('click', (e) => {
            e.preventDefault();
            savePropertyDetails(property);
            window.location.href = `single-listings.html?id=${property.id}`;
          });
          propertyList.appendChild(propertyElement);
        });
      }
    } catch (err) {
      console.error('Error searching properties:', err);
      propertyList.innerHTML = '<p class="text-center">Error searching properties. Please try again later.</p>';
    } finally {
      removeLoader();
    }
  });
}