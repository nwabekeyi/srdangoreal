import { setupFormspree } from './formSpree.js';
import { FORMSPREE_ENDPOINTS } from '../secrets.js';
import { showLoader, removeLoader } from '../utils/loader/index.js'; // Import loader functions

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic additional data for tracking
    const currentPage = window.location.href;
    const submissionTime = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }); // WAT timezone

    const forms = [
        {
            formId: 'contact-form',
            formspreeEndpoint: FORMSPREE_ENDPOINTS.contact_form, // Use contact form endpoint: https://formspree.io/f/xdklajpw
            successMessage: 'Thank you for contacting us! We will respond soon.',
            errorMessage: 'Failed to send your message. Please try again.',
            additionalData: {
                page: currentPage,
                submitted_at: submissionTime,
                form_type: 'Contact Form'
            },
            onSubmit: showLoader, // Show loader on form submission
            onComplete: removeLoader // Remove loader on completion
        }
    ];

    forms.forEach(formConfig => {
        if (formConfig.formspreeEndpoint) {
            console.log(`Setting up Formspree for form "${formConfig.formId}" with endpoint: ${formConfig.formspreeEndpoint}`);
            setupFormspree(formConfig);
        } else {
            console.error(`No Formspree endpoint found for form "${formConfig.formId}"`);
        }
    });
});