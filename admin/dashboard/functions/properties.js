// functions/properties.js
import {
    getAllDocs,
    getSingleDoc,
    createDoc,
    updateDoc,
    deleteDocById,
  } from '../../../utils/queries/index.js';
  import { uploadFile } from '../../../configs/cloudinary.js';
  import { loadAnalytics } from './home.js';
  import { savePropertyDetails } from '../../../utils/storage/index.js';
  
  // Load properties (GET)
  export async function loadProperties() {
    const propertyList = document.querySelector('.property-list .row');
    const errorDiv = document.getElementById('error');
  
    try {
      const properties = await getAllDocs('properties');
      propertyList.innerHTML = '';
      properties.forEach((property) => {
        const propertyElement = document.createElement('div');
        propertyElement.className = 'col-12 col-md-6 col-xl-4';
        propertyElement.innerHTML = `
          <div class="single-featured-property mb-4">
            <div class="property-thumb">
              <a href="#" class="property-link" data-property-id="${property.id}">
                <img src="${property.imageUrls?.[0] || 'img/bg-img/feature1.jpg'}" alt="">
              </a>
              <div class="tag"><span>${property.tag}</span></div>
              <div class="list-price"><p>₦${property.price.toLocaleString('en-NG')}</p></div>
            </div>
            <div class="property-content p-3">
              <h5>${property.title}</h5>
              <p class="location"><img src="img/icons/location.png" alt="">${property.location}</p>
              <p>${property.description.substring(0, 100)}...</p>
              <div class="property-meta-data d-flex align-items-end justify-content-between">
                <div class="new-tag"><img src="img/icons/new.png" alt=""></div>
                <div class="bathroom"><img src="img/icons/bathtub.png" alt=""><span>${property.bathrooms}</span></div>
                <div class="garage"><img src="img/icons/garage.png" alt=""><span>${property.garage}</span></div>
                <div class="space"><img src="img/icons/space.png" alt=""><span>${property.space} sq ft</span></div>
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
          window.location.href = '../single-listings.html?id=${property.id}';
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
            document.getElementById('description').value = property.description;
            document.getElementById('price').value = property.price;
            document.getElementById('bathrooms').value = property.bathrooms;
            document.getElementById('garage').value = property.garage;
            document.getElementById('space').value = property.space;
            document.getElementById('tag').value = property.tag;
            // Populate core features as comma-separated string
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
            // Add placeholders for existing images
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
  
  // Property form submission (Create/Update)
  export const listenToPropertyForm = () => {
    const propertyForm = document.getElementById('propertyForm');
    const errorDiv = document.getElementById('error');
  
    propertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const propertyId = document.getElementById('propertyId').value;
      const title = document.getElementById('title').value;
      const location = document.getElementById('location').value;
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
        // Reset image inputs to one
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