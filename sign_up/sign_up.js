<<<<<<< HEAD
import { supabase } from "../supabase/supabase_client.js";
var registerNewUserData = {
  fullName: "",
  email: "",
  role: "Customer",
=======
import { supabase } from '../supabase/supabase_client.js';
var registerNewUserData = {
  fullName: "",
  email: "",
  role: "user",
>>>>>>> 72f6d5fada5db3afbb6123af9a7b2e09e7fea051
  address: "",
  phoneNumber: "",
};

<<<<<<< HEAD
var fullName;
var email;
var address;
var phoneNumber;
var password;
var confirmPassword;

var form = document.getElementById("form");
var registerBtn = document.getElementById("registerBtn");
var fullNameInput = document.getElementById("sign_up_full_name");
var emailInput = document.getElementById("sign_up_email");
var addressInput = document.getElementById("sign_up_address");
var phoneNumberInput = document.getElementById("sign_up_phone_number");
var passwordInput = document.getElementById("sign_up_password");
var confirmPasswordInput = document.getElementById("sign_up_confirm_password");

var error_fullname = document.getElementById("error_full_name");
var error_email = document.getElementById("error_email");
var error_address = document.getElementById("error_address");
var error_phone_number = document.getElementById("error_phone_number");
var error_password = document.getElementById("error_password");
var error_confirm_password = document.getElementById("error_confirm_password");

fullNameInput.addEventListener("input", () => {
  error_fullname.innerHTML = "";
});
emailInput.addEventListener("input", () => {
  error_email.innerHTML = "";
});
addressInput.addEventListener("input", () => {
  error_address.innerHTML = "";
});
phoneNumberInput.addEventListener("input", () => {
  error_phone_number.innerHTML = "";
});
passwordInput.addEventListener("input", () => {
  error_password.innerHTML = "";
});
confirmPasswordInput.addEventListener("input", () => {
  error_confirm_password.innerHTML = "";
});
function validateFullname() {
  const regex = /^[a-zA-Z0-9\s]{6,}$/;
  if (regex.test(fullNameInput.value.trim())) {
    error_fullname.innerHTML = "";
    return true;
  } else {
    error_fullname.innerHTML = "name must be at least 6 characters";
    return false;
  }
}
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
function validateAddress() {
  if (addressInput.value.trim().length > 0) {
    error_address.innerHTML = "";
    return true;
  } else {
    error_address.innerHTML = "address cannot be empty";
    return false;
  }
}
function validatePhoneNumber() {
  const regex = /^01[0125][0-9]{8}$/;
  if (regex.test(phoneNumberInput.value.trim())) {
    error_phone_number.innerHTML = "";
    return true;
  } else {
    error_phone_number.innerHTML = "invalid phone number";
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
function validateConfirmPassword() {
  if (confirmPasswordInput.value.trim() === "") {
    error_confirm_password.innerHTML = "please confirm your password";
    return false;
  } else if (confirmPasswordInput.value.trim() === passwordInput.value.trim()) {
    error_confirm_password.innerHTML = "";
    return true;
  } else {
    error_confirm_password.innerHTML = "passwords do not match";
    return false;
  }
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/profiles");
xhr.setRequestHeader(
  "apikey",
  "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
);
xhr.setRequestHeader(
  "Authorization",
  "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
);
xhr.send();
xhr.addEventListener("readystatechange", function () {
  console.log(this.readyState);
  if (this.readyState == 4) {
    console.log("response received");
    for (let i = 0; i < JSON.parse(this.response).length; i++) {
      console.log(JSON.parse(this.response)[i].id);
    }
  }
});
async function getData(tableName) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) return null;
  return data;
}
getData("profiles").then((data) => {
  console.log("data");

  console.log(data);
});

async function signUp(email, password, fullName, phone, address) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error.message);
      alert("Signup error: " + error.message);
      return null;
    }

    if (!data.user) {
      console.warn(
        "User created but not confirmed yet. Check Email confirmation settings!",
      );
      return null;
    }

    const userId = data.user.id;

    createProfile(userId, fullName, phone, address);
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Unexpected error: " + err.message);
    return null;
  }
}
async function createProfile(id, fullName, phone, address) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/profiles");
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
    }
  };

  var body = JSON.stringify({
    id: id,
    name: fullName,
    phone: phone,
    address: address,
    role: "Customer",
  });

  xhr.send(body);
  console.log("User created successfully with ID:", id);
  alert("Registration successful! Please log in.");
  location.replace("../login/login.html");
  // location.href = "../login/login.html";
}

registerBtn.addEventListener("click", function (e) {
  this.innerHTML = "Loading...";
  e.preventDefault();
  var isFullNameValid = validateFullname();
  var isEmailValid = validateEmail();
  var isAddressValid = validateAddress();
  var isPhoneNumberValid = validatePhoneNumber();
  var isPasswordValid = validatePassword();
  var isConfirmPasswordValid = validateConfirmPassword();
  if (
    validateFullname() &&
    validateEmail() &&
    validateAddress() &&
    validatePhoneNumber() &&
    validatePassword() &&
    validateConfirmPassword()
  ) {
    console.log("All inputs are valid. Proceeding with registration...");
  } else {
    console.log("Some inputs are invalid. Please correct the errors.");
    this.innerHTML = "Register";
    return;
  }
  console.log("Inputs validated successfully.");
  signUp(
    emailInput.value.trim(),
    passwordInput.value.trim(),
    fullNameInput.value.trim(),
    phoneNumberInput.value.trim(),
    addressInput.value.trim(),
  );
=======

async function getData(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) return null;
  return data;
}
getData('profiles').then((data) => {
  console.log(data);
});






document.getElementById("registerBtn").addEventListener("click", function () {
    document.getElementById("errorSpan").innerHTML = "Invalid email or password";
  // console.log(registerNewUserData.fullName);
  // console.log(registerNewUserData.email);
  // console.log(registerNewUserData.address);
  // console.log(registerNewUserData.phoneNumber);
  registerNewUserData.fullName =
    document.getElementById("sign_up_full_name").value;
  registerNewUserData.email = document.getElementById("sign_up_email").value;
  registerNewUserData.address =
    document.getElementById("sign_up_address").value;
  registerNewUserData.phoneNumber = document.getElementById(
    "sign_up_phone_number",
  ).value;
  console.log(registerNewUserData.fullName);
  console.log(registerNewUserData.email);
  console.log(registerNewUserData.address);
  console.log(registerNewUserData.phoneNumber);
>>>>>>> 72f6d5fada5db3afbb6123af9a7b2e09e7fea051
});
