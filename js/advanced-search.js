import { db, collection, query, where, getDocs } from '../configs/firebase.js';
import { getFilterOptions } from '../utils/queries/index.js';
import { showLoader, removeLoader } from '../utils/loader/index.js';
import { savePropertyDetails } from '../utils/storage/index.js';

export async function injectAdvancedSearch() {
  const currentPath = window.location.pathname;
  if (currentPath === '/index.html' || currentPath === '/listings.html') {
    let insertAfterElement;
    if (currentPath === '/index.html') {
      insertAfterElement = document.querySelector('.hero-area');
      if (!insertAfterElement) {
        console.error('Hero-area element not found on /index.html');
        return;
      }
    } else if (currentPath === '/listings.html') {
      insertAfterElement = document.querySelector('.breadcumb-area');
      if (!insertAfterElement) {
        console.error('Breadcrumb-area element not found on /listings.html');
        return;
      }
    }

    // Fetch filter options
    let filterOptions;
    try {
      filterOptions = await getFilterOptions();
    } catch (error) {
      console.error('Error fetching filter options:', error);
      filterOptions = {
        cities: ['All Cities'],
        categories: ['All Categories'],
        listings: ['All Listings'],
        offers: ['All Offers']
      };
    }

    const searchArea = document.createElement('div');
    searchArea.className = 'south-search-area';
    searchArea.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div id="search-form" class="advanced-search-form">
              <!-- Search Title -->
              <div class="search-title">
                <p>Search for your home</p>
              </div>
              <!-- Search Form -->
              <form id="advanceSearch">
                <div class="row">
                  <div class="col-12 col-md-4 col-lg-3">
                    <div class="form-group">
                      <input type="text" class="form-control" name="input" placeholder="Keyword">
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-lg-3">
                    <div class="form-group">
                      <select class="form-control" id="cities">
                        ${filterOptions.cities.map(city => `<option>${city}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-lg-3">
                    <div class="form-group">
                      <select class="form-control" id="catagories">
                        ${filterOptions.categories.map(category => `<option>${category}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-lg-3">
                    <div class="form-group">
                      <select class="form-control" id="listings">
                        ${filterOptions.listings.map(listing => `<option>${listing}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-lg-3">
                    <div class="form-group">
                      <select class="form-control" id="offers">
                        ${filterOptions.offers.map(offer => `<option>${offer}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-xl-2">
                    <div class="form-group">
                      <select class="form-control" id="bedrooms">
                        <option>Bedrooms</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5+</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-4 col-xl-2">
                    <div class="form-group">
                      <select class="form-control" id="bathrooms">
                        <option>Bathrooms</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5+</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-12 col-md-8 col-lg-12 col-xl-5 d-flex">
                    <!-- Space Range -->
                    <div class="slider-range">
                      <div data-min="120" data-max="820" data-unit=" sq. ft" class="slider-range-price ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" data-value-min="120" data-value-max="820">
                        <div class="ui-slider-range ui-widget-header ui-corner-all"></div>
                        <span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0"></span>
                        <span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0"></span>
                      </div>
                      <div class="range">120 sq. ft - 820 sq. ft</div>
                    </div>
                    <!-- Price Range -->
                    <div class="slider-range">
                      <div data-min="10" data-max="1300" data-unit=" mil" class="slider-range-price ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" data-value-min="10" data-value-max="1300">
                        <div class="ui-slider-range ui-widget-header ui-corner-all"></div>
                        <span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0"></span>
                        <span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0"></span>
                      </div>
                      <div class="range">10 mil - 1300 mil</div>
                    </div>
                  </div>
                  <div class="col-12 d-flex justify-content-between align-items-end">
                    <!-- Submit -->
                    <div class="form-group mb-0">
                      <button type="submit" class="btn south-btn">Search</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    insertAfterElement.insertAdjacentElement('afterend', searchArea);

    // Initialize jQuery UI sliders
    if (jQuery.ui) {
      $('.slider-range-price').each(function () {
        const min = $(this).data('min');
        const max = $(this).data('max');
        const unit = $(this).data('unit');
        const valueMin = $(this).data('value-min');
        const valueMax = $(this).data('value-max');
        $(this).slider({
          range: true,
          min: min,
          max: max,
          values: [valueMin, valueMax],
          slide: function (event, ui) {
            const range = $(this).parent().find('.range');
            range.text(`${ui.values[0]}${unit} - ${ui.values[1]}${unit}`);
            $(this).attr('data-value-min', ui.values[0]);
            $(this).attr('data-value-max', ui.values[1]);
          }
        });
      });
    }

    // Handle search form submission
    const searchForm = document.getElementById('advanceSearch');
    const propertyList = document.getElementById('property-list');
    if (searchForm && propertyList) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        showLoader();

        try {
          const keyword = searchForm.querySelector('input[name="input"]')?.value.trim().toLowerCase() || '';
          const city = document.getElementById('cities')?.value || 'All Cities';
          const category = document.getElementById('catagories')?.value || 'All Categories';
          const listing = document.getElementById('listings')?.value || 'All Listings';
          const offer = document.getElementById('offers')?.value || 'All Offers';
          const bedrooms = document.getElementById('bedrooms')?.value || 'Bedrooms';
          const bathrooms = document.getElementById('bathrooms')?.value || 'Bathrooms';
          const spaceRange = document.querySelector('.slider-range-price[data-unit=" sq. ft"]');
          const priceRange = document.querySelector('.slider-range-price[data-unit=" mil"]');

          const minSpace = spaceRange ? parseInt(spaceRange.getAttribute('data-value-min')) || 120 : 120;
          const maxSpace = spaceRange ? parseInt(spaceRange.getAttribute('data-value-max')) || 820 : 820;
          const minPrice = priceRange ? parseInt(priceRange.getAttribute('data-value-min')) * 1000000 || 10000000 : 10000000;
          const maxPrice = priceRange ? parseInt(priceRange.getAttribute('data-value-max')) * 1000000 || 1300000000 : 1300000000;

          let q = query(collection(db, 'properties'));
          if (city !== 'All Cities') {
            q = query(q, where('city', '==', city));
          }
          if (category !== 'All Categories') {
            q = query(q, where('type', '==', category));
          }
          if (listing !== 'All Listings') {
            q = query(q, where('tag', '==', listing));
          }
          if (offer !== 'All Offers') {
            const offerValue = parseInt(offer); // Remove % for query
            q = query(q, where('offer', '==', offerValue));
          }
          // Only include space range in Firestore query
          q = query(q, where('space', '>=', minSpace), where('space', '<=', maxSpace));

          const snapshot = await getDocs(q);
          let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Apply client-side filtering for bedrooms, bathrooms, price, and keyword
          let filteredProperties = properties;
          if (bedrooms !== 'Bedrooms') {
            const bedValue = bedrooms === '5+' ? 5 : parseInt(bedrooms);
            filteredProperties = filteredProperties.filter(property => property.bedrooms >= bedValue);
          }
          if (bathrooms !== 'Bathrooms') {
            const bathValue = bathrooms === '5+' ? 5 : parseInt(bathrooms);
            filteredProperties = filteredProperties.filter(property => property.bathrooms >= bathValue);
          }
          if (minPrice !== 10000000 || maxPrice !== 1300000000) {
            filteredProperties = filteredProperties.filter(
              property => property.price >= minPrice && property.price <= maxPrice
            );
          }
          if (keyword) {
            filteredProperties = filteredProperties.filter(
              property =>
                (property.title?.toLowerCase().includes(keyword) || false) ||
                (property.description?.toLowerCase().includes(keyword) || false) ||
                (property.city?.toLowerCase().includes(keyword) || false)
            );
          }

          let html = '';
          if (filteredProperties.length === 0) {
            html = '<p class="text-center">No properties found matching your criteria.</p>';
          } else {
            filteredProperties.forEach((property, index) => {
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
          }

          // Update #property-list innerHTML
          propertyList.innerHTML = html;

          // Add click event listeners for property links
          document.querySelectorAll('.property-link').forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const propertyId = link.getAttribute('data-property-id');
              const property = filteredProperties.find(p => p.id === propertyId);
              if (property) {
                savePropertyDetails(property);
                window.location.href = `single-listings.html?id=${property.id}`;
              }
            });
          });
        } catch (err) {
          console.error('Error searching properties:', err);
          propertyList.innerHTML = '<p class="text-center">Error searching properties. Please try again later.</p>';
        } finally {
          removeLoader();
        }
      });
    } else {
      console.error('Search form or property list not found');
    }
  }
}