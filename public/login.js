const loginForm = document.getElementById('loginForm');
const loginSuccessModal = document.getElementById('loginSuccessModal');
const okButton = document.querySelector('.ok-button');
const loginFailedModal = document.getElementById('loginFailedModal');
const clientTab = document.getElementById('clientTab');
const adminTab = document.getElementById('adminTab');
const loginRole = document.getElementById('loginRole');

// Toggle tabs
clientTab.addEventListener('click', () => {
  loginRole.value = "user";
  clientTab.classList.add("active");
  adminTab.classList.remove("active");
});

adminTab.addEventListener('click', () => {
  loginRole.value = "admin";
  adminTab.classList.add("active");
  clientTab.classList.remove("active");
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const role = loginRole.value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    const data = await response.json();
    console.log("Login Response:", data);

    if (response.ok) {
      console.log("Storing userId & username in localStorage:", data.userId, data.username);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
      loginSuccessModal.style.display = "flex";

      // Redirect immediately to the server-specified URL
      window.location.href = data.redirectUrl;
    } else {
      loginFailedModal.style.display = "flex";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});

// Success modal OK button
okButton.addEventListener('click', () => {
  loginSuccessModal.style.display = 'none';
  window.location.href = '/home.html';
});

// Error modal OK button
const errorOkButton = document.querySelector('.error-ok-button');
if (errorOkButton) {
  errorOkButton.addEventListener('click', () => {
    loginFailedModal.style.display = 'none';
    window.location.href = '/login.html';
  });
}
