const API = "https://web1-api.vercel.app/api";
const AUTHENTICATE_API = "https://web1-api.vercel.app/users";

async function loadData(request, templateId, viewId) {
  const response = await fetch(`${API}/${request}`);
  const data = await response.json();

  var source = document.querySelector(templateId).innerHTML;
  var template = Handlebars.compile(source);
  var context = { data: data };

  var view = document.getElementById(viewId);
  view.innerHTML = template(context);
}

async function getAuthenticateToken(username, password) {
  const response = await fetch(`${AUTHENTICATE_API}/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  const result = await response.json();

  if (response.status === 200) {
    return result;
  } else {
    throw new Error(result.message || "Authentication failed");
  }
}

async function login(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const token = await getAuthenticateToken(username, password);

    if (token && token.token) {
      // lưu token
      localStorage.setItem("authToken", token.token);
      localStorage.setItem("isLogin", "true");

      // đóng modal bằng Bootstrap API
      const modalEl = document.getElementById("modalLogin");
      const modal = bootstrap.Modal.getInstance(modalEl);
      document.activeElement.blur();
      if (modal) modal.hide();

      // cập nhật hiển thị login/logout
      displayControls(true);
    }
  } catch (error) {
    document.getElementById("errorMessage").innerHTML =
      error.message || "Login failed";
    displayControls(false);
  }
}

function displayControls(isLoggedIn = false) {
  const linkLogins = document.getElementsByClassName("linkLogin");
  const linkLogouts = document.getElementsByClassName("linkLogout");

  const displayLogin = isLoggedIn ? "none" : "block";
  const displayLogout = isLoggedIn ? "block" : "none";

  for (let i = 0; i < linkLogins.length; i++) {
    linkLogins[i].style.display = displayLogin;
  }
  for (let i = 0; i < linkLogouts.length; i++) {
    linkLogouts[i].style.display = displayLogout;
  }

  const leaveComment = document.getElementById("leave-comment");
  if (leaveComment) {
    leaveComment.style.display = displayLogout;
  }
}

async function checkLogin() {
  let isLogin = await verifyToken();
  displayControls(isLogin);
}

async function verifyToken() {
  let token = localStorage.getItem("authToken");
  if (token) {
    let response = await fetch(`${AUTHENTICATE_API}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (response.status === 200) {
      return true;
    }
  }
  return false;
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isLogin");
  displayControls(false);
}

function updateLoginStatus() {
  const token = localStorage.getItem("token");
  const linkLogin = document.querySelectorAll(".linkLogin");
  const linkLogout = document.querySelectorAll(".linkLogout");

  if (token) {
    linkLogin.forEach((el) => (el.style.display = "none"));
    linkLogout.forEach((el) => (el.style.display = "block"));
  } else {
    linkLogin.forEach((el) => (el.style.display = "block"));
    linkLogout.forEach((el) => (el.style.display = "none"));
  }
}

async function initLoginState() {
  const isLogin = localStorage.getItem("isLogin") === "true";
  displayControls(isLogin);

  const valid = await verifyToken();
  if (!valid) logout();
}
