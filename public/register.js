document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form refresh

    const formData = new FormData();
    formData.append("name", document.getElementById('registerName').value);
    formData.append("surname", document.getElementById('registerSurname').value);
    formData.append("username", document.getElementById('registerUsername').value);
    formData.append("email", document.getElementById('registerEmail').value);
    formData.append("password", document.getElementById('registerPassword').value);
    formData.append("profile_picture", document.getElementById('registerProfilePicture').files[0]);

    console.log("Sending registration data...");
    try {
        // Send registration data to the server
        const response = await fetch('/register', {
            method: 'POST',
            body: formData // No need to set headers for FormData
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
