import { supabase } from '../supabase/supabase_client.js';
var registerNewUserData = {
  fullName: "",
  email: "",
  role: "user",
  address: "",
  phoneNumber: "",
};


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
});
