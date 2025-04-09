document.getElementById('sendResetLinkBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    

    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.message); // Show message to the user
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});