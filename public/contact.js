// public/contact.js

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');
    const errorMessage = document.getElementById('error-message');
    const faqItems = document.querySelectorAll('.faq-item');
    const subjectInput = document.getElementById('subject');
    const messageGroup = document.getElementById('message-group');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formMessage.textContent = 'Your message has been sent successfully!';
            formMessage.classList.add('success');
            errorMessage.textContent = '';
            errorMessage.classList.remove('error');
            contactForm.reset();
            // Optionally hide the message area again after submission
            if (messageGroup) {
                messageGroup.classList.add('hidden');
            }
        });
    }

    if (faqItems) {
        faqItems.forEach(item => {
            item.addEventListener('click', function() {
                this.classList.toggle('open');
            });
        });
    }

    if (subjectInput && messageGroup) {
        subjectInput.addEventListener('focus', function() {
            messageGroup.classList.remove('hidden');
        });
    }
});