// js/formspree.js
export function setupFormspree({ formId, formspreeEndpoint, successMessage = 'Thank you for your message! We will get back to you soon.', errorMessage = 'There was an error submitting your form. Please try again.', additionalData = {} }) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Form with ID "${formId}" not found.`);
        return;
    }

    form.action = formspreeEndpoint; // Set the Formspree endpoint dynamically
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);
        
        // Append additional data to FormData
        for (const [key, value] of Object.entries(additionalData)) {
            formData.append(key, value);
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true; // Disable button during submission
        }

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success: Show a success message
                alert(successMessage);
                form.reset(); // Clear the form
            } else {
                // Error: Show error message
                const errorData = await response.json();
                alert(errorData.error || errorMessage);
            }
        } catch (error) {
            console.error(`Form submission error for form "${formId}":`, error);
            alert('An error occurred. Please try again later.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false; // Re-enable button
            }
        }
    });
}