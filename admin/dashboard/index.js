// index.js
import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc
} from '../../configs/firebase.js';
import {
  loadProperties,
  listenToPropertyForm
} from './components/properties.js';
import { sidebarNav, loadAnalytics } from './components/home.js';
import { submitBlog, loadBlogs } from './components/blog.js';

document.addEventListener('DOMContentLoaded', () => {
  const errorDiv = document.getElementById('error');
  const logoutBtn = document.querySelector('.btn-logout');
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.querySelector('.btn-dark.d-md-none');

  // Sidebar navigation
  sidebarNav();

  // Click-outside functionality for sidebar (mobile only)
  const handleClickOutside = (event) => {
    // Only proceed if sidebar is open (has .show class) and screen is mobile
    if (window.innerWidth <= 767.98 && sidebar.classList.contains('show')) {
      // Check if click is outside sidebar and toggle button
      if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
        sidebar.classList.remove('show'); // Collapse sidebar
      }
    }
  };

  // Add global click listener for click-outside
  document.addEventListener('click', handleClickOutside);

  // Check if user is admin
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      errorDiv.textContent = 'Access denied: Not an admin user.';
      await auth.signOut();
      window.location.href = 'index.html';
      return;
    }
    // Load properties, blogs, and analytics
    loadProperties();
    loadBlogs();
    loadAnalytics();
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = '../index.html';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });

  // Property form submission (Create/Update)
  listenToPropertyForm();

  // Blog form submission (Create/Update)
  submitBlog();
});