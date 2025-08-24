// functions/blogs.js
import {
  getAllDocs,
  getSingleDoc,
  createDoc,
  updateDoc,
  deleteDocById,
} from '../../../utils/queries/index.js';
import { loadAnalytics } from './home.js';

// Load blogs (GET)
export async function loadBlogs() {
  const blogErrorDiv = document.getElementById('blogError');
  const blogList = document.querySelector('.blog-list .row');
  try {
    const blogs = await getAllDocs('blogs');
    blogList.innerHTML = '';
    blogs.forEach((blog) => {
      const blogElement = document.createElement('div');
      blogElement.className = 'col-12 col-md-6 col-xl-4';
      blogElement.innerHTML = `
        <div class="single-blog-post mb-4">
          <div class="blog-content p-3">
            <h5>${blog.title}</h5>
            <p>${blog.content.substring(0, 100)}...</p>
            <p><strong>Replies:</strong> ${blog.replies || 0}</p>
          </div>
          <div class="blog-actions">
            <button class="btn btn-edit" data-id="${blog.id}">Edit</button>
            <button class="btn btn-delete" data-id="${blog.id}">Delete</button>
          </div>
        </div>
      `;
      blogList.appendChild(blogElement);
    });

    // Edit button event listeners
    document.querySelectorAll('.blog-actions .btn-edit').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const blog = await getSingleDoc('blogs', id);
          document.getElementById('blogId').value = id;
          document.getElementById('blogTitle').value = blog.title;
          document.getElementById('blogContent').value = blog.content;
        } catch (err) {
          blogErrorDiv.textContent = 'Error loading blog post: ' + err.message;
          console.error('Error:', err);
        }
      });
    });

    // Delete button event listeners
    document.querySelectorAll('.blog-actions .btn-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this blog post?')) {
          try {
            await deleteDocById('blogs', id);
            console.log('✅ Blog deleted:', id);
            blogErrorDiv.textContent = 'Blog post deleted successfully!';
            loadBlogs();
            loadAnalytics();
          } catch (err) {
            blogErrorDiv.textContent = 'Error deleting blog post: ' + err.message;
            console.error('Error:', err);
          }
        }
      });
    });
  } catch (err) {
    blogErrorDiv.textContent = 'Error loading blogs: ' + err.message;
    console.error('Error:', err);
  }
}

// Blog form submission (Create/Update)
export const submitBlog = () => {
  const blogForm = document.getElementById('blogForm');
  const blogErrorDiv = document.getElementById('blogError');

  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blogId = document.getElementById('blogId').value;
    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;

    try {
      const blogData = {
        title,
        content,
        replies: 0,
        createdAt: new Date(),
      };

      if (blogId) {
        await updateDoc('blogs', blogId, blogData);
        console.log('✅ Blog updated:', blogId);
        blogErrorDiv.textContent = 'Blog post updated successfully!';
      } else {
        await createDoc('blogs', blogData);
        console.log('✅ Blog created');
        blogErrorDiv.textContent = 'Blog post created successfully!';
      }

      blogForm.reset();
      document.getElementById('blogId').value = '';
      loadBlogs();
      loadAnalytics();
    } catch (err) {
      blogErrorDiv.textContent = 'Error saving blog post: ' + err.message;
      console.error('Error:', err);
    }
  });
}