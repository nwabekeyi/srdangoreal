import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc
} from '../../configs/firebase.js'
import {
  loadProperties,
  listenToPropertyForm
} from './functions/properties.js';
import { sidebarNav, loadAnalytics } from './functions/home.js';
import { submitBlog, loadBlogs } from './functions/blog.js';document.addEventListener('DOMContentLoaded', () => {
  const errorDiv = document.getElementById('error');
  const logoutBtn = document.querySelector('.btn-logout');  //sidebar navidation
  sidebarNav();  // Check if user is admin
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      errorDiv.textContent = 'Access denied: Not an admin user.';
      await auth.signOut();
      window.location.href = 'login.html';
      return;
    }
    // Load properties, blogs, and analytics
    loadProperties();
    loadBlogs();
    loadAnalytics();
  });  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });  // Property form submission (Create/Update)
  listenToPropertyForm();  // Blog form submission (Create/Update)
  submitBlog();});

