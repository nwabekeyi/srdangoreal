

// Dummy data for analytics
const dummyAnalytics = {
    totalProperties: 50,
    forSale: 30,
    forRent: 20,
    totalBlogs: 10,
    totalReplies: 50,
    categoryViews: { 'For Sale': 1500, 'For Rent': 1000 },
  };


      // Sidebar navigation
  export const sidebarNav =  () => {
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
  };

  // Load analytics with dummy data
let categoryChartInstance;
let performanceChartInstance;

export function loadAnalytics() {
  try {
    const {
      totalProperties,
      forSale,
      forRent,
      totalBlogs,
      totalReplies,
      categoryViews,
    } = dummyAnalytics;

    document.getElementById('total-properties').textContent = totalProperties;
    document.getElementById('for-sale').textContent = forSale;
    document.getElementById('for-rent').textContent = forRent;
    document.getElementById('total-blogs').textContent = totalBlogs;
    document.getElementById('total-replies').textContent = totalReplies;

    // 🔴 Destroy existing charts if they exist
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (performanceChartInstance) performanceChartInstance.destroy();

    // ✅ Recreate fresh charts
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
