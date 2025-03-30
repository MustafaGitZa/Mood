document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
  
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();

      
      console.log("Login Response:", data); // Log the full response
  
        if (response.ok) {
          console.log("Storing userId in localStorage:", data.userId); // Log userId before storing
          console.log("Storing username in localStorage:", data.username); // Log username before storing
          localStorage.setItem("userId", data.userId); // Store user ID
          localStorage.setItem("username", data.username); // Store username
          alert(data.message); // Show success message
          window.location.href = "/home.html"; // Redirect to home page
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
  