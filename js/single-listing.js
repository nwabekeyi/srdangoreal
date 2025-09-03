import { getPropertyDetails } from '../utils/storage/index.js';
import { showLoader, removeLoader } from '../utils/loader/index.js';
import { fetchAddressSuggestions } from '../utils/queries/index.js';
import { initMap } from './map-active.js';
import { setupFormspree } from '../js/formSpree.js'; // Import setupFormspree
import { FORMSPREE_ENDPOINTS } from '../secrets.js'; // Import Formspree endpoints

document.addEventListener('DOMContentLoaded', async () => {
  const listingsContent = document.querySelector('.listings-content');
  const mainSlider = document.querySelector('.main-slider');
  const thumbnailContainer = document.querySelector('.thumbnail-container');
  const mapContainer = document.getElementById('map');

  try {
    showLoader();
    const property = getPropertyDetails();

    if (!property) {
      listingsContent.innerHTML = '<p class="text-center">No property details found. Please select a property.</p>';
      mainSlider.innerHTML = ''; // Clear main slider
      thumbnailContainer.innerHTML = ''; // Clear thumbnail container
      if (mapContainer) mapContainer.style.display = 'none'; // Hide map on error
      return;
    }

    // Update main slider images using <img> tags
    const images = property.imageUrls?.length > 0
      ? property.imageUrls
      : ['img/bg-img/hero4.jpg', 'img/bg-img/hero5.jpg']; // Fallback images
    mainSlider.innerHTML = images.map((url, index) => `
      <div class="single-hero-slide">
        <div class="container h-100">
          <div class="row h-100 align-items-center">
            <div class="col-12">
              <img src="${url}" alt="Property Image" class="slider-image">
              <div class="hero-slides-content" data-animation="fadeInUp" data-delay="${100 * (index + 1)}ms">
                <!-- Optional content can go here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Update thumbnail container (static)
    thumbnailContainer.innerHTML = images.map((url, index) => `
      <div class="thumbnail-slide" data-index="${index}">
        <img src="${url}" alt="Property Thumbnail" class="thumbnail-image">
      </div>
    `).join('');

    // Initialize Main Slider
    $(mainSlider).slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      speed: 1000,
      dots: true,
      arrows: true,
      prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
      nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
      infinite: true,
      lazyLoad: 'ondemand', // Improve performance for images
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
      ]
    });

    // Add click event listeners to thumbnails
    const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail-slide');
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        const index = parseInt(thumbnail.getAttribute('data-index'));
        $(mainSlider).slick('slickGoTo', index);
        // Update active thumbnail styling
        thumbnails.forEach((thumb) => thumb.classList.remove('active'));
        thumbnail.classList.add('active');
      });
    });

    // Update active thumbnail when main slider changes
    $(mainSlider).on('afterChange', (event, slick, currentSlide) => {
      thumbnails.forEach((thumb) => thumb.classList.remove('active'));
      thumbnails[currentSlide].classList.add('active');
    });

    // Set first thumbnail as active initially
    if (thumbnails.length > 0) {
      thumbnails[0].classList.add('active');
    }

    // Update listings content
    listingsContent.innerHTML = `
      <!-- Price -->
      <div class="list-price">
        <p>₦${property.price.toLocaleString('en-NG')}</p>
      </div>
      <h5>${property.title}</h5>
      <p class="location"><img src="img/icons/location.png" alt="">${property.location}</p>
      <p>${property.description}</p>
      <!-- Meta -->
      <div class="property-meta-data d-flex align-items-end">
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
      <!-- Core Features -->
      <ul class="listings-core-features d-flex align-items-center">
        ${property.coreFeatures?.length > 0
          ? property.coreFeatures.map(feature => `<li><i class="fa fa-check" aria-hidden="true"></i> ${feature}</li>`).join('')
          : '<li>No features available</li>'}
      </ul>
    `;

    // Initialize MapTiler map
    let coordinates;
    if (property.lat && property.lng) {
      coordinates = { lng: property.lng, lat: property.lat };
    } else {
      // Geocode the location using MapTiler
      const suggestions = await fetchAddressSuggestions(property.location);
      if (suggestions.length > 0) {
        coordinates = suggestions[0].center; // [lng, lat]
        coordinates = { lng: coordinates[0], lat: coordinates[1] }; // Convert to { lng, lat }
      } else {
        console.warn('No coordinates found for location:', property.location);
        coordinates = { lng: 3.3792, lat: 6.5244 }; // Fallback to Lagos, Nigeria
      }
    }
    console.log('Coordinates before initMap:', coordinates); // Debugging
    initMap(coordinates, property.title);

    // Setup Formspree for the contact form
    const additionalData = {
      propertyTitle: property.title,
      propertyPrice: `₦${property.price.toLocaleString('en-NG')}`,
      propertyLocation: property.location,
      propertyDescription: property.description,
      propertyBathrooms: property.bathrooms,
      propertyGarage: property.garage,
      propertySpace: `${property.space} sq ft`,
      propertyFeatures: property.coreFeatures?.length > 0 ? property.coreFeatures.join(', ') : 'No features available'
    };

    setupFormspree({
      formId: 'realtor-contact-form',
      formspreeEndpoint: FORMSPREE_ENDPOINTS.property_inquiry,
      successMessage: 'Thank you for your inquiry! We will get back to you soon.',
      errorMessage: 'There was an error submitting your inquiry. Please try again.',
      additionalData,
      onSubmit: showLoader, // Show loader when form submission starts
      onComplete: removeLoader // Remove loader when submission completes
    });

  } catch (err) {
    console.error('Error loading single listing:', err);
    listingsContent.innerHTML = '<p class="text-center">Error loading property details. Please try again.</p>';
    mainSlider.innerHTML = ''; // Clear main slider on error
    thumbnailContainer.innerHTML = ''; // Clear thumbnail container on error
    if (mapContainer) mapContainer.style.display = 'none'; // Hide map on error
  } finally {
    removeLoader();
  }
});