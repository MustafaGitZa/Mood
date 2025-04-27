document.addEventListener('DOMContentLoaded', () => {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const selectedAvatarInput = document.getElementById('selectedAvatar');
    const selectedAvatarDisplay = document.getElementById('selectedAvatarDisplay');
    const avatarOptionsContainer = document.querySelector('.avatar-options-container');
    const chooseAvatarLabel = document.getElementById('chooseAvatarLabel');
    const fileInput = document.getElementById('registerProfilePicture'); // Get the file input

    function resetAvatarSelection() {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
        selectedAvatarInput.value = '';
        selectedAvatarDisplay.style.display = 'none';
        avatarOptionsContainer.style.display = 'flex'; // Show avatar options again
        chooseAvatarLabel.textContent = 'Choose an Avatar (Optional)';
    }

    avatarOptions.forEach(avatar => {
        avatar.addEventListener('click', function() {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedAvatarInput.value = this.dataset.avatar;
            selectedAvatarDisplay.src = this.src;
            selectedAvatarDisplay.style.display = 'block';
            avatarOptionsContainer.style.display = 'none'; // Hide other options
            chooseAvatarLabel.textContent = 'Selected Avatar:';
            fileInput.value = ''; // Clear any selected file if an avatar is chosen
        });
    });

    // Clear selected avatar if a file is chosen
    fileInput.addEventListener('change', () => {
        resetAvatarSelection();
    });

    // Re-show avatar options if the selected avatar display is clicked
    selectedAvatarDisplay.addEventListener('click', () => {
        resetAvatarSelection();
    });
});

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById('registerName').value);
    formData.append("surname", document.getElementById('registerSurname').value);
    formData.append("username", document.getElementById('registerUsername').value);
    formData.append("email", document.getElementById('registerEmail').value);
    formData.append("password", document.getElementById('registerPassword').value);

    const selectedAvatarPath = document.getElementById('selectedAvatar').value;
    const uploadedFile = document.getElementById('registerProfilePicture').files[0];

    if (uploadedFile) {
        formData.append("profile_picture", uploadedFile);
    } else if (selectedAvatarPath) {
        formData.append("avatar_path", selectedAvatarPath);
    }

    console.log("Sending registration data...");
    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {
            alert(data.message);
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});