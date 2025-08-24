// functions/listings.js
import { db, collection, query, where, getDocs } from '../configs/firebase.js';
import { getAllDocs } from '../utils/queries/index.js';
import { showLoader, removeLoader } from '../utils/loader/index.js';
import { savePropertyDetails } from '../utils/storage/index.js';

// Load properties dynamically
export async function loadProperties() {
  const propertyList = document.getElementById('property-list');
  try {
    showLoader();
    const properties = await getAllDocs('properties');
    propertyList.innerHTML = '';
    properties.forEach((property, index) => {
      const propertyElement = document.createElement('div');
      propertyElement.className = 'col-12 col-md-6 col-xl-4';
      propertyElement.innerHTML = `
        <div class="single-featured-property mb-50 wow fadeInUp" data-wow-delay="${100 * (index + 1)}ms">
          <!-- Property Thumbnail -->
          <div class="property-thumb">
            <a href="#" class="property-link" data-property-id="${property.id}">
              <img src="${property.imageUrls?.[0] || 'img/bg-img/feature1.jpg'}" alt="">
            </a>
            <div class="tag">
              <span>${property.tag}</span>
            </div>
            <div class="list-price">
              <p>₦${property.price.toLocaleString('en-NG')}</p>
            </div>
          </div>
          <!-- Property Content -->
          <div class="property-content">
            <h5>${property.title}</h5>
            <p class="location"><img src="img/icons/location.png" alt="">${property.location}</p>
            <p>${property.description.substring(0, 100)}...</p>
            <div class="property-meta-data d-flex align-items-end justify-content-between">
              <div class="new-tag">
                <img src="img/icons/new.png" alt="">
              </div>
              <div class="bathroom">
                <img src="img/icons/bathtub.png" alt="">
                <span>${property.bathrooms}</span>
              </div>
              <div class="garage">
                <img src="img/icons/garage.png" alt="">
                <span>${property.garage}</span>
              </div>
              <div class="space">
                <img src="img/icons/space.png" alt="">
                <span>${property.space} sq ft</span>
              </div>
            </div>
          </div>
        </div>
      `;
      // Add click event to save property details and navigate
      const link = propertyElement.querySelector('.property-link');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        savePropertyDetails(property);
        window.location.href = `single-listings.html?id=${property.id}`;
      });
      propertyList.appendChild(propertyElement);
    });
  } catch (err) {
    console.error('Error loading properties:', err);
    propertyList.innerHTML = '<p class="text-center">Error loading properties. Please try again later.</p>';
  } finally {
    removeLoader();
  }
}

// Handle search form submission
export function handleSearch() {
  const searchForm = document.getElementById('advanceSearch');
  const propertyList = document.getElementById('property-list');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();

    try {
      // Get form values
      const keyword = searchForm.querySelector('input[name="input"]').value.trim().toLowerCase();
      const city = document.getElementById('cities').value;
      const category = document.getElementById('catagories').value;
      const offer = document.getElementById('offers').value;
      const listing = document.getElementById('listings').value;
      const bedrooms = document.getElementById('bedrooms').value;
      const bathrooms = document.getElementById('bathrooms').value;
      const spaceRange = document.querySelector('.slider-range-price[data-unit=" sq. ft"]');
      const priceRange = document.querySelector('.slider-range-price[data-unit=" mil"]');
      const type = document.getElementById('types').value;
      const action = document.getElementById('Actions').value;

      // Get slider values (assumes jQuery UI slider updates data attributes)
      const minSpace = parseInt(spaceRange.getAttribute('data-value-min')) || 120;
      const maxSpace = parseInt(spaceRange.getAttribute('data-value-max')) || 820;
      const minPrice = parseInt(priceRange.getAttribute('data-value-min')) * 1000000 || 10000000;
      const maxPrice = parseInt(priceRange.getAttribute('data-value-max')) * 1000000 || 1300000000;

      // Build Firestore query
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
        if (bedrooms === '5+') {
          q = query(q, where('bedrooms', '>=', 5));
        }
      }
      if (bathrooms !== 'Bathrooms') {
        const bathValue = bathrooms === '5+' ? 5 : parseInt(bathrooms);
        q = query(q, where('bathrooms', '>=', bathValue));
        if (bathrooms === '5+') {
          q = query(q, where('bathrooms', '>=', 5));
        }
      }
      q = query(q, where('space', '>=', minSpace), where('space', '<=', maxSpace));
      q = query(q, where('price', '>=', minPrice), where('price', '<=', maxPrice));

      // Execute query
      const snapshot = await getDocs(q);
      let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Client-side filtering for keyword
      if (keyword) {
        properties = properties.filter(property =>
          property.title.toLowerCase().includes(keyword) ||
          property.description.toLowerCase().includes(keyword) ||
          property.location.toLowerCase().includes(keyword)
        );
      }

      // Display filtered properties
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
                  <img src="${property.imageUrls?.[0] || 'img/bg-img/feature1.jpg'}" alt="">
                </a>
                <div class="tag">
                  <span>${property.tag}</span>
                </div>
                <div class="list-price">
                  <p>₦${property.price.toLocaleString('en-NG')}</p>
                </div>
              </div>
              <!-- Property Content -->
              <div class="property-content">
                <h5>${property.title}</h5>
                <p class="location"><img src="img/icons/location.png" alt="">${property.location}</p>
                <p>${property.description.substring(0, 100)}...</p>
                <div class="property-meta-data d-flex align-items-end justify-content-between">
                  <div class="new-tag">
                    <img src="img/icons/new.png" alt="">
                  </div>
                  <div class="bathroom">
                    <img src="img/icons/bathtub.png" alt="">
                    <span>${property.bathrooms}</span>
                  </div>
                  <div class="garage">
                    <img src="img/icons/garage.png" alt="">
                    <span>${property.garage}</span>
                  </div>
                  <div class="space">
                    <img src="img/icons/space.png" alt="">
                    <span>${property.space} sq ft</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          // Add click event to save property details and navigate
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

  // Toggle more filters
  const moreFilter = document.getElementById('moreFilter');
  const secondSteps = document.querySelector('.search-form-second-steps');
  moreFilter.addEventListener('click', (e) => {
    e.preventDefault();
    secondSteps.style.display = secondSteps.style.display === 'none' ? 'block' : 'none';
  });
}