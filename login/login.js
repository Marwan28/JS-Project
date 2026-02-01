import { supabase } from "../supabase/supabase_client.js";

var emailInput = document.getElementById("log_in_email");
var passwordInput = document.getElementById("log_in_password");
var loginBtn = document.getElementById("loginBtn");
var error_email = document.getElementById("error_email");
var error_password = document.getElementById("error_password");
var registerLink = document.getElementById("register_link");
registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.replace("../sign_up/sign_up.html");
});

emailInput.addEventListener("input", () => {
  error_email.innerHTML = "";
});
passwordInput.addEventListener("input", () => {
  error_password.innerHTML = "";
});
function validateEmail() {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (regex.test(emailInput.value.trim())) {
    error_email.innerHTML = "";
    return true;
  } else {
    error_email.innerHTML = "please enter a valid email";
    return false;
  }
}
function validatePassword() {
  if (passwordInput.value.trim().length >= 8) {
    error_password.innerHTML = "";
    return true;
  } else {
    error_password.innerHTML = "password must be at least 8 characters";
    return false;
  }
}

async function getUserProfile(userId) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/profiles?id=eq." +
        userId,
    );
    xhr.setRequestHeader(
      "apikey",
      "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
    );
    xhr.setRequestHeader(
      "Authorization",
      "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
    );
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.setRequestHeader("Prefer", "return=representation");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        console.log("Status:", xhr.status);
        console.log("Response:", xhr.responseText);
        const responseData = JSON.parse(xhr.responseText);
        if (responseData.length > 0) {
          const userProfile = responseData[0];
          console.log("User Profile Data:", userProfile);
          console.log("id", userProfile.id);
          console.log("address", userProfile.address);
          console.log("phone_number", userProfile.phone);
          console.log("role", userProfile.role);
          localStorage.setItem("currentUserId", userProfile.id);
          localStorage.setItem("currentUserRole", userProfile.role);
          if (userProfile.role === "Admin") {
            console.log("Admin user logged in");
            window.location.replace("../admin/home/home.html");
          } else {
            console.log("Regular user logged in");
            window.location.replace("../users/home/home.html");
          }
        } else {
          console.log("No profile data found for this user.");
        }
      }
    };
    xhr.send();
    console.log(xhr.responseText);
    console.log(xhr.data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

async function login(loginEmail, loginPassword) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      console.log("Login error:", error.message);
      loginBtn.innerHTML = "Login";
      alert("Login error: " + error.message);
      return;
    }
    if (data.user) {
      console.log("Login successful:", "email:", data.user.email);
      console.log("Login successful:", "id:", data.user.id);
      getUserProfile(data.user.id);
      //window.location.href = "../home/home.html";
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

loginBtn.addEventListener("click", function (e) {
  this.innerHTML = "Loading...";
  e.preventDefault();
  var isEmailValid = validateEmail();
  var isPasswordValid = validatePassword();
  if (isEmailValid && isPasswordValid) {
    console.log("All inputs are valid. Proceeding with login...");
  } else {
    console.log("Some inputs are invalid. Please correct the errors.");
    this.innerHTML = "Login";
    return;
  }
  console.log("Inputs validated successfully.");
  login(emailInput.value.trim(), passwordInput.value.trim());
});
