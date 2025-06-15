document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const faqItems = document.querySelectorAll('.faq-item');
  const subjectInput = document.getElementById('subject');
  const messageGroup = document.getElementById('message-group');

  // Show message area when subject is focused
  if (subjectInput && messageGroup) {
    subjectInput.addEventListener('focus', () => {
      messageGroup.classList.remove('hidden');
    });
  }

  // FAQ toggle
  if (faqItems) {
    faqItems.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('open');
      });
    });
  }

  // Submit form handler
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      // Basic validation
      if (!message) {
        showModal('Please enter your message.', false);
        return;
      }

      // Call backend API
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          showModal(data.error, false);
        } else {
          showModal(data.message, true);
          contactForm.reset();
          if (messageGroup) {
            messageGroup.classList.add('hidden');
          }
        }
      })
      .catch(error => {
        console.error('Error submitting message:', error);
        showModal('An unexpected error occurred. Please try again.', false);
      });
    });
  }

  // Modal popup function
  function showModal(message, isSuccess = true) {
    const modal = document.getElementById('contactModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModal');

    modalContent.innerHTML = message;
    modal.style.display = 'flex';
    modalContent.style.color = isSuccess ? '#28a745' : '#dc3545';

    // Close button click
    closeModalBtn.onclick = () => {
      modal.style.display = 'none';
    };

    // Close modal if user clicks outside of it
    window.onclick = (e) => {
      if (e.target == modal) {
        modal.style.display = 'none';
      }
    };
  }
});
