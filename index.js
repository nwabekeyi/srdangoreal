// index.js
import { loadProperties, loadFeaturedProperties} from './js/listing.js';
import { injectAdvancedSearch } from './js/advanced-search.js';

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    // Check if header and footer elements exist
    if (!header || !footer) {
        console.error('Header or footer element not found in the DOM');
        return;
    }

    header.innerHTML = `
        <!-- Top Header Area -->
        <div class="top-header-area">
            <div class="h-100 d-md-flex justify-content-between align-items-center">
                <div class="email-address">
                    <a href="mailto:contact@srdango.com">contact@srdango.com</a>
                </div>
                <div class="phone-number d-flex">
                    <div class="icon">
                        <img src="img/icons/phone-call.png" alt="">
                    </div>
                    <div class="number">
                        <a href="tel:+2348135032249">+234 813 503 2249</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Header Area -->
        <div class="main-header-area" id="stickyHeader">
            <div class="classy-nav-container breakpoint-off">
                <!-- Classy Menu -->
                <nav class="classy-navbar justify-content-between" id="southNav">
                    <!-- Logo -->
                    <a class="nav-brand" href="index.html"><img src="img/core-img/logo.png" alt=""></a>
                    <!-- Navbar Toggler (Existing) -->
                    <div class="classy-navbar-toggler">
                        <span class="navbarToggler"><span></span><span></span><span></span></span>
                    </div>
                    <!-- Menu (Existing) -->
                    <div class="classy-menu">
                        <!-- close btn -->
                        <div class="classycloseIcon">
                            <div class="cross-wrap"><span class="top"></span><span class="bottom"></span></div>
                        </div>
                        <!-- Nav Start -->
                        <div class="classynav">
                            <ul>
                                <li><a href="index.html">Home</a></li>
                                <li><a href="about-us.html">About Us</a></li>
                                <li><a href="listings.html">Properties</a></li>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="contact.html">Contact</a></li>
                            </ul>
                            <!-- Search Form -->
                            <div class="south-search-form">
                                <form action="#" method="post">
                                    <input type="search" name="search" id="search" placeholder="Search Anything ...">
                                    <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
                                </form>
                            </div>
                            <!-- Search Button -->
                            <a href="#" class="searchbtn"><i class="fa" aria-hidden="true"></i></a>
                        </div>
                        <!-- Nav End -->
                    </div>
                    <!-- New Mobile Nav Toggle -->
                    <button class="mobile-nav-toggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <!-- New Mobile Navigation -->
                    <nav class="mobile-nav">
                        <button class="mobile-nav-close">&times;</button>
                        <ul>
                            <li><a href="index.html">Home</a></li>
                            <li><a href="about-us.html">About Us</a></li>
                            <li><a href="listings.html">Properties</a></li>
                            <li><a href="blog.html">Blog</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                        <div class="south-search-form">
                            <form action="#" method="post">
                                <input type="search" name="mobile-search" id="mobile-search" placeholder="Search Anything ...">
                                <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
                            </form>
                        </div>
                    </nav>
                </nav>
            </div>
        </div>
    `;

    footer.innerHTML = `
    <div class="main-footer-area">
        <div class="container">
            <div class="row">
                <!-- Single Footer Widget -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="footer-widget-area mb-100">
                        <!-- Widget Title -->
                        <div class="widget-title">
                            <h6>About Us</h6>
                        </div>
                        <img src="img/bg-img/footer.jpg" alt="">
                        <div class="footer-logo my-4">
                            <img src="img/core-img/logo.png" alt="">
                        </div>
                        <p>SR Dango Real Estate is committed to providing premium properties that meet the lifestyle and investment needs of our clients. With a strong presence across Nigeria, we specialize in residential, commercial, and luxury real estate solutions tailored to you.</p>
                    </div>
                </div>
                <!-- Single Footer Widget -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="footer-widget-area mb-100">
                        <!-- Widget Title -->
                        <div class="widget-title">
                            <h6>Hours</h6>
                        </div>
                        <!-- Office Hours -->
                        <div class="weekly-office-hours">
                            <ul>
                                <li class="d-flex align-items-center justify-content-between"><span>Monday - Friday</span> <span>09 AM - 19 PM</span></li>
                                <li class="d-flex align-items-center justify-content-between"><span>Saturday</span> <span>09 AM - 14 PM</span></li>
                                <li class="d-flex align-items-center justify-content-between"><span>Sunday</span> <span>Closed</span></li>
                            </ul>
                        </div>
                        <!-- Address -->
                        <div class="address">
                            <h6><img src="img/icons/phone-call.png" alt=""> +234 813 503 2249</h6>
                            <h6><img src="img/icons/envelope.png" alt=""> office@srdango.com</h6>
                            <h6><img src="img/icons/location.png" alt=""> Abuja Office: Anthony Enahoro street, Utako, Abuja, FCT</h6>
                            <h6><img src="img/icons/location.png" alt=""> Lagos Office: 4, Oluwole Agbede, off Idowu Dabiri, Sangotedo, Lagos</h6>
                            <h6><img src="img/icons/location.png" alt=""> Ibadan Office: suit 1 & 2, Ni'motallahi Awujoola central mosque complex, Ologeru, Ibadan</h6>
                        </div>
                    </div>
                </div>
                <!-- Single Footer Widget -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="footer-widget-area mb-100">
                        <!-- Widget Title -->
                        <div class="widget-title">
                            <h6>Useful Links</h6>
                        </div>
                        <!-- Nav -->
                        <ul class="useful-links-nav d-flex align-items-center">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Services</a></li>
                            <li><a href="#">Properties</a></li>
                            <li><a href="#">Listings</a></li>
                            <li><a href="#">Testimonials</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <!-- Single Footer Widget -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="footer-widget-area mb-100">
                        <!-- Widget Title -->
                        <div class="widget-title">
                            <h6>Featured Properties</h6>
                        </div>
                        <!-- Featured Properties Slides -->
                        <div class="featured-properties-slides owl-carousel">
                            <!-- Single Slide -->
                            <div class="single-featured-properties-slide">
                                <a href="#"><img src="img/bg-img/fea-product.jpg" alt=""></a>
                            </div>
                            <!-- Single Slide -->
                            <div class="single-featured-properties-slide">
                                <a href="#"><img src="img/bg-img/fea-product.jpg" alt=""></a>
                            </div>
                            <!-- Single Slide -->
                            <div class="single-featured-properties-slide">
                                <a href="#"><img src="img/bg-img/fea-product.jpg" alt=""></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Copywrite Text -->
    <div class="copywrite-text d-flex align-items-center justify-content-center">
        <p>Developed by <a href="http://www.beks.com" target="_blank">BeksTech</a> and GYtech</p>
    </div>
`;

    // Inject advanced search
    injectAdvancedSearch();

    // New mobile nav toggle functionality
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navClose = document.querySelector('.mobile-nav-close');

    // Debug: Check if new mobile nav elements are found
    if (!navToggle) {
        console.error('Mobile nav toggle (.mobile-nav-toggle) not found in the DOM');
    }
    if (!mobileNav) {
        console.error('Mobile nav (.mobile-nav) not found in the DOM');
    }
    if (!navClose) {
        console.error('Mobile nav close (.mobile-nav-close) not found in the DOM');
    }

    // Toggle menu function for new mobile nav
    if (navToggle && mobileNav && navClose) {
        const toggleMenu = () => {
            console.log('Toggling mobile nav...');
            mobileNav.classList.toggle('active');
            navToggle.classList.toggle('active');
            if (mobileNav.classList.contains('active')) {
                mobileNav.style.animation = 'slideIn 0.3s ease-in-out forwards';
                console.log('Mobile nav opened');
            } else {
                mobileNav.style.animation = 'slideOut 0.3s ease-in-out forwards';
                setTimeout(() => {
                    mobileNav.style.animation = ''; // Clear animation after closing
                }, 300);
                console.log('Mobile nav closed');
            }
        };

        // Click event for nav toggle
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Mobile nav toggle clicked');
            toggleMenu();
        });

        // Click event for close button
        navClose.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Mobile nav close clicked');
            toggleMenu();
        });

        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !navToggle.contains(e.target) && mobileNav.classList.contains('active')) {
                console.log('Clicked outside mobile nav');
                toggleMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                console.log('Escape key pressed');
                toggleMenu();
            }
        });
    }

    // Initialize listings (unchanged)
    try {
        loadProperties();
        // Load featured properties only on blog.html and about-us.html
    if (window.location.pathname.includes('blog.html') || window.location.pathname.includes('about-us.html')) {
        loadFeaturedProperties();
      }
    } catch (error) {
        console.error('Error initializing listings:', error);
    }
});