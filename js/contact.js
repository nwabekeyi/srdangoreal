// js/contact.js
import { setupFormspree } from './formspree.js';
import { FORMSPREE_ENDPOINTS } from '../secrets.js';

document.addEventListener('DOMContentLoaded', () => {
    // Example of dynamic additional data
    const currentPage = window.location.href;
    const submissionTime = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }); // WAT timezone

    const forms = [
        {
            formId: 'contact-form',
            formspreeEndpoint: FORMSPREE_ENDPOINTS.contactForm, // Use endpoint from secrets.js
            successMessage: 'Thank you for contacting us! We will respond soon.',
            errorMessage: 'Failed to send your message. Please try again.',
            additionalData: {
                page: currentPage,
                submitted_at: submissionTime,
                form_type: 'Contact Form'
            }
        },
        {
            formId: 'newsletter-form',
            formspreeEndpoint: FORMSPREE_ENDPOINTS.newsletterForm, // Use endpoint from secrets.js
            successMessage: 'You have successfully subscribed to our newsletter!',
            errorMessage: 'Error subscribing. Please try again.',
            additionalData: {
                page: currentPage,
                submitted_at: submissionTime,
                form_type: 'Newsletter Signup'
            }
        }
        // Add more forms as needed, e.g.:
        /*
        {
            formId: 'feedback-form',
            formspreeEndpoint: FORMSPREE_ENDPOINTS.feedbackForm,
            successMessage: 'Thank you for your feedback!',
            errorMessage: 'Error submitting feedback. Please try again.',
            additionalData: {
                page: currentPage,
                submitted_at: submissionTime,
                form_type: 'Feedback Form',
                browser: navigator.userAgent
            }
        }
        */
    ];

    forms.forEach(formConfig => {
        if (formConfig.formspreeEndpoint) {
            setupFormspree(formConfig);
        } else {
            console.error(`No Formspree endpoint found for form "${formConfig.formId}"`);
        }
    });
});