document.addEventListener('DOMContentLoaded', () => {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    alert('You must be logged in to view your messages.');
    window.location.href = 'login.html';
    return;
  }

  fetchUserMessages(userEmail);
  fetchUnreadCount(userEmail);
});

function fetchUserMessages(email) {
  fetch(`/my-messages?email=${email}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#userMessagesTable tbody');
      tbody.innerHTML = ''; // clear existing rows

      data.forEach(msg => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${msg.id}</td>
          <td>${msg.subject}</td>
          <td>${msg.message}</td>
          <td>${msg.status}</td>
          <td>${new Date(msg.created_at).toLocaleString()}</td>
          <td>
            ${msg.status === 'unread' 
              ? `<button class="ack-btn" onclick="acknowledgeMessage(${msg.id}, this)">Acknowledge</button>`
              : '✓'
            }
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => console.error('Error fetching messages:', err));
}

function acknowledgeMessage(id, btn) {
  fetch(`/acknowledge-message/${id}`, { method: 'PUT' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        btn.outerHTML = '✓';
        fetchUnreadCount(localStorage.getItem('userEmail')); // refresh icon count
      }
    })
    .catch(err => console.error('Error acknowledging message:', err));
}

function fetchUnreadCount(email) {
  fetch(`/my-unread-messages-count?email=${email}`)
    .then(res => res.json())
    .then(data => {
      const badge = document.getElementById('userMessageCount');
      if (data.unreadCount > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = data.unreadCount;
      } else {
        badge.style.display = 'none';
      }
    })
    .catch(err => console.error('Error fetching count:', err));
}
