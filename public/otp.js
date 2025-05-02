document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const userId = sessionStorage.getItem("userId");
    const otp = document.getElementById("otp").value;
  
    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Verification failed");
    }
  });
  
  // Automatically request OTP on load
  window.onload = async () => {
    const userId = sessionStorage.getItem("userId");
    const email = sessionStorage.getItem("email");
  
    if (!userId || !email) {
      alert("Missing user info. Please login again.");
      window.location.href = "/login";
      return;
    }
  
    try {
      const response = await fetch("/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email })
      });
  
      const data = await response.json();
      if (!response.ok) alert("Error sending OTP");
      else console.log("OTP sent to:", email);
    } catch (error) {
      console.error("Error:", error);
      alert("Could not send OTP.");
    }
  };
  