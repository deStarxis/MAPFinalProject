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

// saving the token in local storage
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

// display the music
function fetchMusic() {
  fetch(`${SERVER_ROOT}/api/music`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => {
      let html = `
      <tr>
      <th>Id</th>
      <th>Title</th>
      <th>Release Date</th>
      <th>Actions</th>
      </tr>
      `;
      let counter = 0;
      if (songs.length !== 0) {
        songs.forEach((song) => {
          html += `
        <tr id="tr${song.id}" data-id="${song.id}">
            <td>${(counter += 1)}</td>
            <td>${song.title}</td>
            <td>${song.releaseDate}</td>
            <td>
              <button title="Add to Playlist" 
                onclick="addToPlaylist(${song.id});">
                Add to Playlist
              </button>
            </td>
        </tr>
        `;
        });
      } else {
        html += `<tr>
          <td colspan="4">No data to show</td>
        </tr>`;
      }
      document.getElementById("songs").innerHTML = html;
    });
}

// display the playlist
function fetchPlayList() {
  fetch(`${SERVER_ROOT}/api/playlist`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  })
    .then((response) => response.json())
    .then((playlists) => {
      let html = `
      <tr>
      <th>Id</th>
      <th>Title</th>
      <th>Actions</th>
      </tr>
      `;
      if (playlists.length !== 0) {
        console.log(playlists);

        playlists.forEach((playlist) => {
          html += `
        <tr id="tr${playlist.id}" data-id="${playlist.id}">
            <td>${playlist.orderId}</td>
            <td>${playlist.title}</td>
            <td>
            <button title="Remove from Playlist" onclick="removeFromPlaylist(${playlist.id});">Remove from Playlist</button>
            <button title="Play Song" onclick="playSong(${playlist.id});">Play</button>
            </td>
        </tr>
        `;
        });
      } else {
        html += `<tr>
        <td colspan="3" >Nothing is added in your playlist</td>
        </tr>`;
      }

      document.getElementById("playlist").innerHTML = html;
    });
}
function afterLogin() {
  document.getElementById("search").style.display = "block";
  document.getElementById("logout-div").style.display = "block";
  document.getElementById("login-div").style.display = "none";
  fetchMusic();
  fetchPlayList();
  document.getElementById("notLogin").style.display = "none";
  document.getElementById("afterLogin").style.display = "block";
}

function notLogin() {
  document.getElementById("search").style.display = "none";
  document.getElementById("logout-div").style.display = "none";
  document.getElementById("login-div").style.display = "block";
  document.getElementById("notLogin").classList.add("text-center");
  document.getElementById("notLogin").style.display = "block";
  document.getElementById("afterLogin").style.display = "none";
}
