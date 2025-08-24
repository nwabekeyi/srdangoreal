// functions/home.js
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

    // Create charts
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

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      sections.forEach(section => section.style.display = 'none');
      document.getElementById(sectionId).style.display = 'block';
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (window.innerWidth <= 767.98) {
        document.getElementById('sidebar').classList.remove('show');
      }
    });
  });
}