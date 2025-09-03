// auth.js
import {
  auth,
  db,
  signInWithEmailAndPassword,
  doc,
  getDoc,
} from '../configs/firebase.js'; // Import Firebase services from your firebase module

document.addEventListener('DOMContentLoaded', () => {
  // Get form, button, and error elements
  const loginForm = document.querySelector('form');
  const loginButton = document.querySelector('form button');
  const errorDiv = document.getElementById('error');

  // Login form handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Update button to loading state
    loginButton.textContent = 'Loading...';
    loginButton.disabled = true; // Disable to prevent multiple submissions
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Check user role in Firestore
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        window.location.href = './dashboard/index.html';
      } else {
        errorDiv.textContent = 'Access denied: Not an admin user.';
        await auth.signOut(); // Sign out if not an admin
        loginButton.textContent = 'Log In'; // Revert button text
        loginButton.disabled = false; // Re-enable button
      }
    } catch (err) {
      errorDiv.textContent = 'Invalid email or password. Please try again.';
      console.error('Login failed:', err);
      loginButton.textContent = 'Log In'; // Revert button text
      loginButton.disabled = false; // Re-enable button
    }
  });
});