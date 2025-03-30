document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form refresh

    const name = document.getElementById('registerName').value;
    const surname = document.getElementById('registerSurname').value;
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        // Send registration data to the server
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password ,email, name, surname })
        });

        const data = await response.json();

        console.log(data); // Log the response for debugging

        // Handle server response
        if (response.ok) {
            alert(data.message); // Registration successful
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
