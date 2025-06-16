function fetchUserMessages(userId) {
  fetch(`/my-messages?user_id=${encodeURIComponent(userId)}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#userMessagesTable tbody');
      tbody.innerHTML = '';

      data.forEach(msg => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${msg.id}</td>
          <td>${msg.subject}</td>
          <td>${msg.message}</td>
          <td>${msg.response ? msg.response : '-'}</td>
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

function fetchUnreadCount(userId) {
  fetch(`/my-unread-messages-count?user_id=${userId}`)
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
