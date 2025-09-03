export function setupFormspree({ formId, formspreeEndpoint, successMessage = 'Thank you for your message! We will get back to you soon.', errorMessage = 'There was an error submitting your form. Please try again.', additionalData = {}, onSubmit = () => {}, onComplete = () => {} }) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Form with ID "${formId}" not found.`);
        return;
    }

    form.action = formspreeEndpoint; // Set the Formspree endpoint dynamically
    form.addEventListener('submit', async (e) => {
        console.log(`Form "${formId}" submit event triggered`); // Debugging
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
            onSubmit(); // Show loader
            console.log('Sending Formspree request to:', formspreeEndpoint); // Debugging
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success: Show success message
                console.log('Form submission successful'); // Debugging
                alert(successMessage);
                form.reset(); // Clear the form
            } else {
                // Error: Show error message
                const errorData = await response.json();
                console.error('Form submission failed:', errorData); // Debugging
                alert(errorData.error || errorMessage);
            }
        } catch (error) {
            console.error(`Form submission error for form "${formId}":`, error);
            alert('An error occurred. Please try again later.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false; // Re-enable button
            }
            onComplete(); // Remove loader
        }
    });
}