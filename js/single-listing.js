// js/single-listing.js
import { getPropertyDetails } from '../utils/storage/index.js';
import { showLoader, removeLoader } from '../utils/loader/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const listingsContent = document.querySelector('.listings-content');
  const carousel = document.querySelector('.hero-slides');

  try {
    showLoader();
    const property = getPropertyDetails();

    if (!property) {
      listingsContent.innerHTML = '<p class="text-center">No property details found. Please select a property.</p>';
      carousel.innerHTML = ''; // Clear carousel
      return;
    }

    // Update carousel images
    const images = property.imageUrls?.length > 0
      ? property.imageUrls
      : ['img/bg-img/hero4.jpg', 'img/bg-img/hero5.jpg']; // Fallback images
    carousel.innerHTML = images.map((url, index) => `
      <div class="single-hero-slide bg-img" style="background-image: url(${url});">
        <div class="container h-100">
          <div class="row h-100 align-items-center">
            <div class="col-12">
              <div class="hero-slides-content" data-animation="fadeInUp" data-delay="${100 * (index + 1)}ms">
                <!-- Optional content can go here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Initialize Owl Carousel to match hero-slides
    $(carousel).owlCarousel({
      items: 1,
      loop: true, // Match hero-slides behavior
      nav: true,
      dots: true,
      autoplay: true,
      autoplayTimeout: 5000,
      smartSpeed: 1000,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
      ],
      responsive: {
        0: { items: 1 },
        600: { items: 1 },
        1000: { items: 1 }
      }
    });

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
  } catch (err) {
    console.error('Error loading single listing:', err);
    listingsContent.innerHTML = '<p class="text-center">Error loading property details. Please try again.</p>';
    carousel.innerHTML = ''; // Clear carousel on error
  } finally {
    removeLoader();
  }
});