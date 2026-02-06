export function logout() {
  localStorage.clear();
  window.location.replace("../../../index.html");
  console.log("log out function");
}
