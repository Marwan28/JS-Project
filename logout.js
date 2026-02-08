export function logout() {
  const BASE_URL = location.hostname.includes("github.io")
    ? "/JS-Project/"
    : "/";
  localStorage.clear();
  window.location.replace(BASE_URL + "index.html");
  console.log("log out function");
}
