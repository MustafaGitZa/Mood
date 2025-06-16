document.addEventListener('DOMContentLoaded', () => {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const selectedAvatarInput = document.getElementById('selectedAvatar');
    const selectedAvatarDisplay = document.getElementById('selectedAvatarDisplay');
    const avatarOptionsContainer = document.querySelector('.avatar-options-container');
    const chooseAvatarLabel = document.getElementById('chooseAvatarLabel');

    function resetAvatarSelection() {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
        selectedAvatarInput.value = '';
        selectedAvatarDisplay.style.display = 'none';
        avatarOptionsContainer.style.display = 'flex';
        chooseAvatarLabel.textContent = 'Choose an Avatar (Optional)';
    }

    avatarOptions.forEach(avatar => {
        avatar.addEventListener('click', function () {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedAvatarInput.value = this.dataset.avatar;
            selectedAvatarDisplay.src = this.src;
            selectedAvatarDisplay.style.display = 'block';
            avatarOptionsContainer.style.display = 'none';
            chooseAvatarLabel.textContent = 'Selected Avatar:';
        });
    });

    selectedAvatarDisplay.addEventListener('click', resetAvatarSelection);
});
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const termsCheck = document.getElementById('termsCheck');
    const termsError = document.getElementById('termsError');

    if (!termsCheck.checked) {
        termsError.style.display = 'block';
        return;
    } else {
        termsError.style.display = 'none';
    }

    clearErrorMessages();
    clearInvalidFields();

    const name = document.getElementById('registerName').value.trim();
    const surname = document.getElementById('registerSurname').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;

    let hasError = false;

    // Validate Name - must not be empty and only letters and spaces allowed
    if (!name) {
        displayError('name', 'Please enter your name.');
        focusOnInvalidField('name');
        hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        displayError('name', 'Name can only contain letters and spaces.');
        focusOnInvalidField('name');
        hasError = true;
    }

    // Validate Surname - must not be empty and only letters and spaces allowed
    if (!surname) {
        displayError('surname', 'Please enter your surname.');
        if (!hasError) focusOnInvalidField('surname');
        hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(surname)) {
        displayError('surname', 'Surname can only contain letters and spaces.');
        if (!hasError) focusOnInvalidField('surname');
        hasError = true;
    }

    if (!emailRegex.test(email)) {
        displayError('email', 'Please enter a valid email address.');
        if (!hasError) focusOnInvalidField('email');
        hasError = true;
    }

    if (!passwordRegex.test(password)) {
        displayError('password', 'Password must be at least 8 characters, include one number and one special character.');
        if (!hasError) focusOnInvalidField('password');
        hasError = true;
    }

    if (!hasError) {
        try {
            const emailCheckResponse = await fetch('/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const emailCheckData = await emailCheckResponse.json();
            if (emailCheckData.exists) {
                displayError('email', 'Email already exists. Please use a different one.');
                focusOnInvalidField('email');
                hasError = true;
            }
        } catch (error) {
            console.error('Error checking email availability:', error);
            alert('An error occurred while checking the email. Please try again.');
            return;
        }
    }

    if (hasError) return; // If there's an error, stop the form submission

    const formData = new FormData();
    formData.append("name", name);
    formData.append("surname", surname);
    formData.append("username", document.getElementById('registerUsername').value);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("dob", document.getElementById("dob").value);

    const selectedAvatar = document.getElementById('selectedAvatar').value;
    if (selectedAvatar) {
        formData.append("avatar_path", selectedAvatar);
    }

    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;

    const spinnerOverlay = document.getElementById('spinnerOverlay');
    spinnerOverlay.style.display = 'flex';

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('successMessage', data.message);
            window.location.href = 'register.html';
        } else if (data.field) {
            displayError(data.field, data.message);
            focusOnInvalidField(data.field);
        } else {
            alert(data.message || "Registration failed. Please try again.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        setTimeout(() => {
            spinnerOverlay.style.display = 'none';
            registerBtn.disabled = false;
            registerBtn.innerHTML = 'Register';
        }, 1500);
    }
});

function clearErrorMessages() {
    ['email', 'password', 'username', 'name', 'surname'].forEach(id => {
        const errEl = document.getElementById(`${id}Error`);
        if (errEl) errEl.textContent = '';
        const inputEl = document.getElementById(`register${capitalizeFirstLetter(id)}`);
        if (inputEl) inputEl.classList.remove('invalid');
    });
}

function clearInvalidFields() {
    document.querySelectorAll('input').forEach(field => field.classList.remove('invalid'));
}

function displayError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    const inputElement = document.getElementById(`register${capitalizeFirstLetter(field)}`);
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('invalid');
    }
}

function focusOnInvalidField(field) {
    const inputElement = document.getElementById(`register${capitalizeFirstLetter(field)}`);
    if (inputElement) {
        inputElement.focus();
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.addEventListener('load', function() {
    const successMessage = sessionStorage.getItem('successMessage');
    if (successMessage) {
        const successMessageContainer = document.getElementById('successMessageContainer');
        const successMessageElement = document.getElementById('successMessage');
        successMessageElement.textContent = successMessage;
        successMessageContainer.style.display = 'block';
        sessionStorage.removeItem('successMessage');
    }

    document.getElementById('closeSuccess')?.addEventListener('click', () => {
        document.getElementById('successMessageContainer').style.display = 'none';
        window.location.href = 'login.html';
    });
});

  


