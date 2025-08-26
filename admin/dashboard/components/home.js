import { getAllDocs } from '../../../utils/queries/index.js';

let categoryChartInstance;
let performanceChartInstance;

export async function loadAnalytics() {
  try {
    // Fetch properties and blogs from Firestore
    const properties = await getAllDocs('properties');
    const blogs = await getAllDocs('blogs');

    // Calculate analytics
    const totalProperties = properties.length;
    const forSale = properties.filter(p => p.tag === 'For Sale').length;
    const forRent = properties.filter(p => p.tag === 'For Rent').length;
    const totalBlogs = blogs.length;
    const totalReplies = blogs.reduce((sum, blog) => sum + (blog.replies || 0), 0);
    const categoryViews = {
      'For Sale': properties.filter(p => p.tag === 'For Sale').reduce((sum, p) => sum + (p.views || 0), 0),
      'For Rent': properties.filter(p => p.tag === 'For Rent').reduce((sum, p) => sum + (p.views || 0), 0),
    };

    // Update DOM
    document.getElementById('total-properties').textContent = totalProperties;
    document.getElementById('for-sale').textContent = forSale;
    document.getElementById('for-rent').textContent = forRent;
    document.getElementById('total-blogs').textContent = totalBlogs;
    document.getElementById('total-replies').textContent = totalReplies;

    // Destroy existing charts if they exist
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (performanceChartInstance) performanceChartInstance.destroy();

    // Create charts (requires Chart.js from index.html)
    categoryChartInstance = new Chart(document.getElementById('category-chart'), {
      type: 'pie',
      data: {
        labels: ['For Sale', 'For Rent'],
        datasets: [{
          data: [forSale, forRent],
          backgroundColor: ['#007bff', '#28a745'],
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
      },
    });

    performanceChartInstance = new Chart(document.getElementById('performance-chart'), {
      type: 'bar',
      data: {
        labels: ['For Sale', 'For Rent'],
        datasets: [{
          label: 'Total Views',
          data: [categoryViews['For Sale'], categoryViews['For Rent']],
          backgroundColor: '#007bff',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Views' } },
        },
      },
    });
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

// Sidebar navigation
export const sidebarNav = () => {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const sections = document.querySelectorAll('.content-section');

  // Function to set active section
  const setActiveSection = (sectionId) => {
    // Hide all sections
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    // Update active class on nav links
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  };

  // Set "Home" as the default section on page load
  setActiveSection('home');

  // Add click event listeners for navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      setActiveSection(sectionId);
      // Collapse sidebar on mobile
      if (window.innerWidth <= 767.98) {
        document.getElementById('sidebar').classList.remove('show');
      }
    });
  });
};