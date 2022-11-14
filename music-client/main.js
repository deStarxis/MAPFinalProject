const SERVER_ROOT = "http://localhost:3000";
window.onload = function () {
  accessibility();
  login();
  logout();
};

// login function
function login() {
  document.getElementById("loginBtn").onclick = function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${SERVER_ROOT}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        loggedInFeatures(data);
      });
  };
}

// logout function
const logout = () => {
  document.getElementById("logoutBtn").onclick = function () {
    localStorage.removeItem("userToken");
    notLogin();
  };
};

// accessibility
const accessibility = () => {
  if (localStorage.getItem("userToken")) {
    afterLogin();
  } else {
    notLogin();
  }
};

function loggedInFeatures(data) {
  console.log(data);
  if (data.status) {
    document.getElementById("errormessage").innerHTML = data.message;
  } else {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("errormessage").innerHTML = "";
    localStorage.setItem("userToken", data.accessToken);
    afterLogin();
  }
}

function afterLogin() {
  document.getElementById("search").style.display = "block";
  document.getElementById("logout-div").style.display = "block";
  document.getElementById("login-div").style.display = "none";
  document.getElementById("content").innerHTML = "Content";
}

function notLogin() {
  document.getElementById("search").style.display = "none";
  document.getElementById("logout-div").style.display = "none";
  document.getElementById("login-div").style.display = "block";
  document.getElementById("content").innerHTML = "Welcome to MIU Station";
}
