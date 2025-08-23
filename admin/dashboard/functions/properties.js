import {
    db,
    doc,
    deleteDoc,
    collection,
    getDocs,
    getDoc,
    setDoc
  } from '../../../app.js';
  import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../../secrets.js';
  import { loadAnalytics } from './home.js';


  // Load properties
  export async function loadProperties() {
    const propertyList = document.querySelector('.property-list .row');

    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      propertyList.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const property = { id: doc.id, ...doc.data() };
        const propertyElement = document.createElement('div');
        propertyElement.className = 'col-12 col-md-6 col-xl-4';
        propertyElement.innerHTML = `
          <div class="single-featured-property mb-4">
            <div class="property-thumb">
              <img src="${property.imageUrl || 'img/bg-img/feature1.jpg'}" alt="">
              <div class="tag"><span>${property.tag}</span></div>
              <div class="list-price"><p>$${property.price.toLocaleString()}</p></div>
            </div>
            <div class="property-content p-3">
              <h5>${property.title}</h5>
              <p class="location"><img src="img/icons/location.png" alt="">${property.location}</p>
              <p>${property.description}</p>
              <div class="property-meta-data d-flex align-items-end justify-content-between">
                <div class="new-tag"><img src="img/icons/new.png" alt=""></div>
                <div class="bathroom"><img src="img/icons/bathtub.png" alt=""><span>${property.bathrooms}</span></div>
                <div class="garage"><img src="img/icons/garage.png" alt=""><span>${property.garage}</span></div>
                <div class="space"><img src="img/icons/space.png" alt=""><span>${property.space} sq ft</span></div>
              </div>
            </div>
            <div class="property-actions">
              <button class="btn btn-edit" data-id="${property.id}">Edit</button>
              <button class="btn btn-delete" data-id="${property.id}">Delete</button>
            </div>
          </div>
        `;
        propertyList.appendChild(propertyElement);
      });

      document.querySelectorAll('.btn-edit').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const docSnap = await getDoc(doc(db, 'properties', id));
          if (docSnap.exists()) {
            const property = docSnap.data();
            document.getElementById('propertyId').value = id;
            document.getElementById('title').value = property.title;
            document.getElementById('location').value = property.location;
            document.getElementById('description').value = property.description;
            document.getElementById('price').value = property.price;
            document.getElementById('bathrooms').value = property.bathrooms;
            document.getElementById('garage').value = property.garage;
            document.getElementById('space').value = property.space;
            document.getElementById('tag').value = property.tag;
          }
        });
      });

      document.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this property?')) {
            try {
              await deleteDoc(doc(db, 'properties', id));
              console.log('✅ Property deleted:', id);
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
  };


// Property form submission (Create/Update)
export const listenToPropertyForm =  () => {
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
        const imageFile = document.getElementById('image').files[0];
    
        try {
          let imageUrl = '';
          if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: 'POST', body: formData }
            );
            const data = await response.json();
            if (data.secure_url) {
              imageUrl = data.secure_url;
            } else {
              throw new Error('Cloudinary upload failed: ' + (data.error?.message || 'Unknown error'));
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
            ...(imageUrl && { imageUrl }),
          };
    
          if (propertyId) {
            await setDoc(doc(db, 'properties', propertyId), propertyData, { merge: true });
            console.log('✅ Property updated:', propertyId);
          } else {
            await setDoc(doc(collection(db, 'properties')), propertyData);
            console.log('✅ Property created');
          }
    
          propertyForm.reset();
          document.getElementById('propertyId').value = '';
          errorDiv.textContent = 'Property saved successfully!';
          loadProperties();
          loadAnalytics();
        } catch (err) {
          errorDiv.textContent = 'Error saving property: ' + err.message;
          console.error('Error:', err);
        }
      });

}