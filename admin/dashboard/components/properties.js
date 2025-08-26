import {
    getAllDocs,
    getSingleDoc,
    createDoc,
    updateDoc,
    deleteDocById,
    fetchAddressSuggestions
  } from '../../../utils/queries/index.js';
  import { uploadFile } from '../../../configs/cloudinary.js';
  import { loadAnalytics } from './home.js';
  import { savePropertyDetails } from '../../../utils/storage/index.js';
  
  // List of Nigerian cities for the city dropdown
  const nigerianCities = [
    "Lagos", , "Abuja", "Ibadan", "Aba", "Abakaliki", "Abeokuta", "Ado-Ekiti", "Afikpo", "Agbor", "Akure", "Asaba", "Awka",
    "Bauchi", "Benin City", "Birnin Kebbi", "Calabar", "Damaturu", "Dutse", "Effurun", "Enugu", "Forçados", "Gombe",
    "Gusau", "Hadejia", "Ife", "Ijebu-Ode", "Ilorin", "Jos", "Kaduna", "Kano", "Katsina",
    "Keffi", "Lafia", "Lokoja", "Maiduguri", "Makurdi", "Minna", "Nnewi", "Nsukka", "Ogbomoso",
    "Okene", "Okitipupa", "Onitsha", "Osogbo", "Owerri", "Port Harcourt", "Sapele", "Sokoto", "Umuahia", "Uyo",
    "Warri", "Yenagoa", "Yola", "Zaria", "Zungeru", "Bida", "Iwo", "Owo", "Ugep", "Wukari"
  ];
  
  // Load properties (GET)
  export async function loadProperties() {
    const propertyList = document.querySelector('.property-list .row');
    const errorDiv = document.getElementById('error');
  
    try {
        const properties = await getAllDocs('properties');
        propertyList.innerHTML = '';
        console.log(properties);
        properties.forEach((property) => {
            const propertyElement = document.createElement('div');
            propertyElement.className = 'col-12 col-md-6 col-xl-4';
            propertyElement.innerHTML = `
                <div class="single-featured-property mb-4">
                    <div class="property-thumb">
                        <a href="#" class="property-link" data-property-id="${property.id}">
                            <img src="${property.imageUrls?.[0] || '../../img/bg-img/feature1.jpg'}" alt="">
                        </a>
                        <div class="tag"><span>${property.tag}</span></div>
                        <div class="list-price"><p>₦${property.price.toLocaleString('en-NG')}</p></div>
                        ${property.offer ? `<div class="offer-tag"><span>${property.offer}% Off</span></div>` : ''}
                    </div>
                    <div class="property-content p-3">
                        <h5>${property.title}</h5>
                        <p class="location"><img src="../../img/icons/location.png" alt="">${property.location}, ${property.city}</p>
                        <p>${property.description.substring(0, 100)}...</p>
                        <div class="property-meta-data d-flex align-items-end justify-content-between">
                            <div class="new-tag"><img src="../../img/icons/new.png" alt=""></div>
                            <div class="bathroom"><img src="../../img/icons/bathtub.png" alt=""><span>${property.bathrooms}</span></div>
                            <div class="garage"><img src="../../img/icons/garage.png" alt=""><span>${property.garage}</span></div>
                            <div class="space"><img src="../../img/icons/space.png" alt=""><span>${property.space} sq ft</span></div>
                        </div>
                        <ul class="listings-core-features d-flex align-items-center">
                            ${property.coreFeatures?.length > 0
                                ? property.coreFeatures.map(feature => `<li><i class="fa fa-check" aria-hidden="true"></i> ${feature}</li>`).join('')
                                : '<li>No features available</li>'}
                        </ul>
                    </div>
                    <div class="property-actions">
                        <button class="btn btn-edit btn-primary btn-sm" data-id="${property.id}">Edit</button>
                        <button class="btn btn-delete btn-danger btn-sm" data-id="${property.id}" data-public-ids="${property.publicIds?.join(',') || ''}">Delete</button>
                    </div>
                </div>
            `;
            // Add click event to save property details and navigate
            const link = propertyElement.querySelector('.property-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                savePropertyDetails(property);
                window.location.href = `../single-listings.html?id=${property.id}`;
            });
            propertyList.appendChild(propertyElement);
        });
  
        // Edit button event listeners
        document.querySelectorAll('.btn-edit').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                try {
                    const property = await getSingleDoc('properties', id);
                    document.getElementById('propertyId').value = id;
                    document.getElementById('title').value = property.title;
                    document.getElementById('location').value = property.location;
                    document.getElementById('city').value = property.city || '';
                    // Ensure offer is set as a string to match select option values
                    const offerSelect = document.getElementById('offer');
                    offerSelect.value = property.offer ? String(property.offer) : '0';
                    document.getElementById('description').value = property.description;
                    document.getElementById('price').value = property.price;
                    document.getElementById('bathrooms').value = property.bathrooms;
                    document.getElementById('garage').value = property.garage;
                    document.getElementById('space').value = property.space;
                    // Ensure tag is set correctly
                    const tagSelect = document.getElementById('tag');
                    tagSelect.value = property.tag || '';
                    document.getElementById('coreFeatures').value = property.coreFeatures?.join(', ') || '';
                    // Clear existing image inputs and populate placeholders
                    const imageInputsContainer = document.getElementById('imageInputs');
                    imageInputsContainer.innerHTML = `
                        <label>Images</label>
                        <div class="image-input-group mb-2">
                            <input type="file" class="form-control image-input" name="images" accept="image/*" required>
                            <button type="button" class="btn btn-danger btn-sm remove-image mt-1">Remove</button>
                        </div>
                    `;
                    if (property.imageUrls?.length > 0) {
                        property.imageUrls.forEach((url, index) => {
                            const imageInputGroup = document.createElement('div');
                            imageInputGroup.className = 'image-input-group mb-2';
                            imageInputGroup.innerHTML = `
                                <input type="file" class="form-control image-input" name="images" accept="image/*">
                                <button type="button" class="btn btn-danger btn-sm remove-image mt-1">Remove</button>
                                <p class="mt-1">Existing: <a href="${url}" target="_blank">Image ${index + 1}</a></p>
                            `;
                            imageInputsContainer.appendChild(imageInputGroup);
                        });
                    }
                } catch (err) {
                    errorDiv.textContent = 'Error loading property: ' + err.message;
                    console.error('Error:', err);
                }
            });
        });
  
        // Delete button event listeners
        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const publicIds = btn.getAttribute('data-public-ids');
                if (confirm(`Are you sure you want to delete this property? ${publicIds ? `Manually delete the images in Cloudinary using Public IDs: ${publicIds}` : ''}`)) {
                    try {
                        await deleteDocById('properties', id);
                        console.log('✅ Property deleted:', id);
                        errorDiv.textContent = `Property deleted successfully. ${publicIds ? `Delete the images in Cloudinary Dashboard using Public IDs: ${publicIds}` : ''}`;
                        loadProperties();
                        loadAnalytics();
                    } catch (err) {
                        errorDiv.textContent = 'Error deleting property: ' + err.message;
                        console.error('Error:', err);
                    }
                }
            });
        });
    } catch (err) {
        errorDiv.textContent = 'Error loading properties: ' + err.message;
        console.error('Error:', err);
    }
  }
  

  // Throttle function to limit API calls to once every specified interval
  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
  }
  
  // Debounce function to delay API calls until typing stops
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Initialize location autocomplete with throttling and debouncing
  function initializeLocationAutocomplete() {
    const locationInput = document.getElementById('location');
    const suggestionsContainer = document.getElementById('location-suggestions');
  
    // Function to handle fetching and displaying suggestions
    const fetchAndDisplaySuggestions = async (query) => {
        if (query.length < 3) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('show');
            return;
        }
  
        const suggestions = await fetchAddressSuggestions(query);
        suggestionsContainer.innerHTML = '';
  
        if (suggestions.length === 0) {
            suggestionsContainer.classList.remove('show');
            return;
        }
  
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('a');
            suggestionItem.className = 'dropdown-item';
            suggestionItem.href = '#';
            suggestionItem.textContent = suggestion.place_name;
            suggestionItem.addEventListener('click', (e) => {
                e.preventDefault();
                locationInput.value = suggestion.place_name;
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.remove('show');
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
  
        suggestionsContainer.classList.add('show');
    };
  
    // Apply throttling (1 second) and debouncing (500ms)
    const throttledFetch = throttle(fetchAndDisplaySuggestions, 1000);
    const debouncedThrottledFetch = debounce(throttledFetch, 500);
  
    locationInput.addEventListener('input', (e) => {
        debouncedThrottledFetch(e.target.value.trim());
    });
  
    // Show suggestions on focus
    locationInput.addEventListener('focus', () => {
        if (locationInput.value.trim().length >= 3) {
            debouncedThrottledFetch(locationInput.value.trim());
        }
    });
  
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!locationInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('show');
        }
    });
  }
  
  // Property form submission (Create/Update)
  export const listenToPropertyForm = () => {
    const propertyForm = document.getElementById('propertyForm');
    const errorDiv = document.getElementById('error');
  
    // Initialize autocomplete for location
    initializeLocationAutocomplete();
  
    // Populate city dropdown
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
    nigerianCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
  
    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const propertyId = document.getElementById('propertyId').value;
        const title = document.getElementById('title').value;
        const location = document.getElementById('location').value;
        const city = document.getElementById('city').value;
        const offer = parseInt(document.getElementById('offer').value) || 0;
        const description = document.getElementById('description').value;
        const price = parseFloat(document.getElementById('price').value);
        const bathrooms = parseInt(document.getElementById('bathrooms').value);
        const garage = parseInt(document.getElementById('garage').value);
        const space = parseInt(document.getElementById('space').value);
        const tag = document.getElementById('tag').value;
        const imageInputs = document.querySelectorAll('input[name="images"]');
        const coreFeaturesInput = document.getElementById('coreFeatures').value;
        const coreFeatures = coreFeaturesInput
            ? coreFeaturesInput.split(',').map(feature => feature.trim()).filter(feature => feature)
            : [];
  
        // Validate select inputs
        if (!tag) {
            errorDiv.textContent = 'Please select a valid tag (For Sale or For Rent).';
            return;
        }
        if (!city) {
            errorDiv.textContent = 'Please select a valid city.';
            return;
        }
  
        try {
            let imageUrls = [];
            let publicIds = [];
            for (const input of imageInputs) {
                if (input.files.length > 0) {
                    const file = input.files[0];
                    const { url, publicId: cloudinaryPublicId } = await uploadFile(file, 'srDango');
                    imageUrls.push(url);
                    publicIds.push(cloudinaryPublicId);
                }
            }
  
            const propertyData = {
                title,
                location,
                city,
                offer,
                description,
                price,
                bathrooms,
                garage,
                space,
                tag,
                views: 0,
                coreFeatures,
                ...(imageUrls.length > 0 && { imageUrls }),
                ...(publicIds.length > 0 && { publicIds }),
            };
  
            if (propertyId) {
                await updateDoc('properties', propertyId, propertyData);
                console.log('✅ Property updated:', propertyId);
                errorDiv.textContent = `Property updated successfully! ${publicIds.length > 0 ? `New Public IDs: ${publicIds.join(', ')}` : ''}`;
            } else {
                const newProperty = await createDoc('properties', propertyData);
                console.log('✅ Property created:', newProperty.id);
                errorDiv.textContent = `Property created successfully! ${publicIds.length > 0 ? `Public IDs: ${publicIds.join(', ')} (use for manual deletion in Cloudinary Dashboard)` : ''}`;
            }
  
            propertyForm.reset();
            document.getElementById('propertyId').value = '';
            document.getElementById('offer').value = '0';
            document.getElementById('tag').value = '';
            document.getElementById('city').value = '';
            document.getElementById('imageInputs').innerHTML = `
                <label>Images</label>
                <div class="image-input-group mb-2">
                    <input type="file" class="form-control image-input" name="images" accept="image/*" required>
                    <button type="button" class="btn btn-danger btn-sm remove-image mt-1">Remove</button>
                </div>
            `;
            loadProperties();
            loadAnalytics();
        } catch (err) {
            errorDiv.textContent = 'Error saving property: ' + err.message;
            console.error('Error:', err);
        }
    });
  };