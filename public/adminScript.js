document.addEventListener('DOMContentLoaded', function () {
    // Store the fetched users globally for filtering
      let allUsers = [];
  
    // Fetch all registered users
    async function fetchRegisteredUsers() {
      try {
        const response = await fetch('/admin/registered-users');
        console.log("Fetching /admin/registered-users...");
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const users = await response.json();
        console.log("Users fetched successfully:", users);
  
        // Store users globally for filtering
        allUsers = users;
  
        // Show total user count
        const totalUsersDiv = document.getElementById('totalUsers');
        if (totalUsersDiv) {
          totalUsersDiv.textContent = `Total Registered Users: ${users.length}`;
        }
  
        renderUsers(users); // Render the users in the table
      } catch (error) {
        console.error('Failed to fetch users:', error);
        const totalUsersDiv = document.getElementById('totalUsers');
        if (totalUsersDiv) {
          totalUsersDiv.textContent = 'Error loading user data.';
        }
      }
    }
  
    // Render users in the table
    function renderUsers(users) {
      const tbody = document.querySelector('#userTable tbody');
      if (tbody) {
        tbody.innerHTML = '';
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.surname}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td>
              <div class="dropdown">
                <button class="dropbtn">${user.role || "user"}</button>
                <div class="dropdown-content">
                  <a href="#" class="role-user">User</a>
                  <a href="#" class="role-admin">Admin</a>
                </div>
              </div>
            </td>
          `;
          tbody.appendChild(row);
  
          // Add event listeners for role change
          row.querySelector('.role-user').addEventListener('click', (e) => {
            e.preventDefault();
            updateUserRole(user.user_id, 'user');
          });
  
          row.querySelector('.role-admin').addEventListener('click', (e) => {
            e.preventDefault();
            updateUserRole(user.user_id, 'admin');
          });
        });
      }
    }
  
  // Filter users based on search input
  function filterUsers() {
    const searchInput = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchInput) ||
      user.surname.toLowerCase().includes(searchInput) ||
      user.username.toLowerCase().includes(searchInput) ||
      user.email.toLowerCase().includes(searchInput)
    );
    renderUsers(filteredUsers); // Re-render the table with filtered users
  }
  
  
    // Fetch active users
    async function fetchActiveUsers() {
      try {
        const response = await fetch('/admin/active-users');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const activeUsers = await response.json();
  
        const activeUsersDiv = document.getElementById('activeUsers');
        if (activeUsersDiv) {
          activeUsersDiv.textContent = `Active Users (Last 7 Days): ${activeUsers.length}`;
        }
  
        const tbody = document.querySelector('#activeUserTable tbody');
        if (tbody) {
          tbody.innerHTML = '';
          activeUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.name}</td>
              <td>${user.surname}</td>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${new Date(user.last_login).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
          });
        }
      } catch (error) {
        console.error('Failed to fetch active users:', error);
        const activeUsersDiv = document.getElementById('activeUsers');
        if (activeUsersDiv) {
          activeUsersDiv.textContent = 'Error loading active user data.';
        }
      }
    }
  
    // Update user role
    async function updateUserRole(userId, newRole) {
  
      console.log("Sending role update request for userId:", userId, "to newRole:", newRole); // Debugging log
  
      try {
        const response = await fetch('/admin/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newRole }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert(result.message); // Show success message
          fetchRegisteredUsers(); // Refresh the table
        } else {
          alert(`Failed to update role: ${result.message}`); // Show error message
        }
      } catch (error) {
        console.error('Error updating user role:', error);
        alert('An error occurred while updating the user role.');
      }
    }
  
     document.getElementById('userSearch').addEventListener('input', filterUsers); // Add event listener for search input
  
    // Run both fetch functions on load
    fetchRegisteredUsers();
    fetchActiveUsers();
  
  });