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
  let result = response.json();
  if (response.status === 200) {
    return result;
  } else {
    throw new Error((await result).message);
  }
}
