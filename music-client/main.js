const SERVER_ROOT = "http://localhost:3000";
var PLAYLIST = [];
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
      })
      .catch((err) => {
        console.log(new Error(err));
      });
  };
}

// logout function
const logout = () => {
  document.getElementById("logoutBtn").onclick = function () {
    localStorage.removeItem("userToken");
    localStorage.removeItem("playType");
    notLogin();
    showToast("Logged Out!!", "red");
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
  if (data.status) {
    showToast("Invalid Credentials!!", "red");
  } else {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    localStorage.setItem("userToken", data.accessToken);
    localStorage.setItem("playType", data.playType);
    showToast("Logged In Successfully!!", "blue");
    afterLogin();
  }
}

// search the music
function searchMusic() {
  document.getElementById("search-input").onkeyup = function (event) {
    event.preventDefault();
    const songTitle = document.getElementById("search-input").value;
    fetch(`${SERVER_ROOT}/api/music?search=${songTitle}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    })
      .then((data) => data.json())
      .then((songs) => {
        loadMusic(songs);
      })
      .catch((err) => console.log(err));
  };
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
      loadMusic(songs);
    })
    .catch((err) => {
      console.log(err);
    });
}

// displaying the updated music
function loadMusic(songs) {
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
            onclick="addToPlaylist('${song.id}');">
            <i class="fa fa-plus"></i> Add to Playlist
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
}

// add to playlist
function addToPlaylist(id) {
  const songId = id;
  for (song of PLAYLIST) {
    if (song.songId === songId) {
      return showToast("Song already added in Playlist", "orange");
    }
  }
  fetch(`${SERVER_ROOT}/api/playlist/add`, {
    method: "POST",
    body: JSON.stringify({
      songId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  })
    .then((data) => data.json())
    .then((songs) => {
      loadPlaylist(songs);
      PLAYLIST = songs;
      showToast("Added to the Playlist", "blue");
    })
    .catch((err) => {
      console.log(err);
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
      loadPlaylist(playlists);
    })
    .catch((err) => {
      console.log(err);
    });
}

// display the updated playlist
function loadPlaylist(playlists) {
  let html = `
  <tr>
  <th>#</th>
  <th>Title</th>
  <th>Actions</th>
  </tr>
  `;
  if (playlists.length !== 0) {
    playlists.forEach((playlist) => {
      html += `
      <tr id="tr${playlist.id}" data-id="${`${playlist.id}`}">
          <td>${playlist.orderId}</td>
          <td>${playlist.title}</td>
          <td>
          <button title="Play Song"  onclick="playThis('${playlist.id}');">
          <i class="fa fa-play" id="playThisSong" style="color:red;"></i>
          </button>
          <button title="Remove from Playlist" onclick="removeFromPlaylist('${
            playlist.songId
          }');">
          <i class="fa fa-trash" style="color:red;"></i>
          </button>
          </td>
      </tr>
    `;
    });
    document.getElementById("playSongs").style.visibility = "visible";
  } else {
    html += `<tr>
    <td colspan="3" >Nothing is added in your playlist</td>
    </tr>`;
    document.getElementById("playSongs").style.visibility = "hidden";
  }
  if (localStorage.getItem("playType") === "ORDER") {
    playTypeButtonIcon.classList.remove("fa", "fa-repeat");
    playTypeButtonIcon.classList.remove("fa", "fa-random");
    playTypeButtonIcon.classList.add("fa", "fa-arrow-right");
    playTypeButton.title = "Order Play";
  } else if (localStorage.getItem("playType") === "SHUFFLE") {
    playTypeButtonIcon.classList.remove("fa", "fa-arrow-right");
    playTypeButtonIcon.classList.remove("fa", "fa-repeat");
    playTypeButtonIcon.classList.add("fa", "fa-random");
    playTypeButton.title = "Shuffle Play";
  } else if (localStorage.getItem("playType") === "REPEAT") {
    playTypeButtonIcon.classList.remove("fa", "fa-arrow-right");
    playTypeButtonIcon.classList.remove("fa", "fa-random");
    playTypeButtonIcon.classList.add("fa", "fa-repeat");
    playTypeButton.title = "Repeat Play";
  }
  document.getElementById("playlist").innerHTML = html;
  PLAYLIST = playlists;
  setSong(0);
}

//remove from playlist
function removeFromPlaylist(id) {
  const songId = id;
  fetch(`${SERVER_ROOT}/api/playlist/remove`, {
    method: "POST",
    body: JSON.stringify({
      songId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  })
    .then((data) => data.json())
    .then((songs) => {
      loadPlaylist(songs);
      PLAYLIST = songs;
      showToast("Song removed from Playlist", "red");
    })
    .catch((err) => {
      console.log(err);
    });
}

function afterLogin() {
  document.getElementById("search").style.display = "block";
  document.getElementById("logout-div").style.display = "block";
  document.getElementById("login-div").style.display = "none";
  searchMusic();
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

const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const playTypeButton = document.getElementById("playTypeButton");
const playTypeButtonIcon = document.getElementById("playTypeButtonIcon");
const audio = document.getElementById("audio");
const pauseButton = document.getElementById("pause");
const playButton = document.getElementById("play");
const songTitle = document.getElementById("songTitle");
const maxDuration = document.getElementById("max-duration");
const currentTimeRef = document.getElementById("current-time");
const progressBar = document.getElementById("progress-bar");
const currentProgress = document.getElementById("current-progress");

let index = 0;

// formatting time
const timeFormatter = (timeInput) => {
  let minute = Math.floor(timeInput / 60);
  minute = minute < 10 ? "0" + minute : minute;
  let second = Math.floor(timeInput % 60);
  second = second < 10 ? "0" + second : second;
  return `${minute}:${second}`;
};

// setting Song
const setSong = (arrayIndex) => {
  let { title, urlPath } = PLAYLIST[arrayIndex];
  audio.src = SERVER_ROOT + "/" + urlPath;
  songTitle.innerHTML = title;
  audio.onloadedmetadata = () => {
    maxDuration.innerText = timeFormatter(audio.duration);
  };
};

//play song
const playAudio = () => {
  audio.play();
  pauseButton.classList.remove("hide");
  playButton.classList.add("hide");
};

//play this song
const playThis = (id) => {
  const songId = PLAYLIST.findIndex((p) => p.id === id);
  setSong(songId);
  playAudio();
};

playTypeButton.addEventListener("click", () => {
  if (localStorage.getItem("playType") === "ORDER") {
    localStorage.setItem("playType", "SHUFFLE");
    playTypeButtonIcon.classList.remove("fa", "fa-arrow-right");
    playTypeButtonIcon.classList.add("fa", "fa-random");
    playTypeButton.title = "Shuffle Play";
    showToast("Shuffle On", "green");
    playAudio();
  } else if (localStorage.getItem("playType") === "SHUFFLE") {
    localStorage.setItem("playType", "REPEAT");
    playTypeButtonIcon.classList.remove("fa", "fa-random");
    playTypeButtonIcon.classList.add("fa", "fa-repeat");
    playTypeButton.title = "Repeat Play";
    showToast("Repeat On", "green");
    playAudio();
  } else if (localStorage.getItem("playType") === "REPEAT") {
    localStorage.setItem("playType", "ORDER");
    playTypeButtonIcon.classList.remove("fa", "fa-repeat");
    playTypeButtonIcon.classList.add("fa", "fa-arrow-right");
    playTypeButton.title = "Order Play";
    showToast("Order play On", "green");
    playAudio();
  }
});

//next song
const nextSong = () => {
  if (localStorage.getItem("playType") === "ORDER") {
    index++;
    if (index > PLAYLIST.length - 1) {
      index = 0;
    }
  } else if (localStorage.getItem("playType") === "SHUFFLE") {
    const random = Math.floor(Math.random() * PLAYLIST.length);
    index = random;
  }
  setSong(index);
  playAudio();
};

//pause song
const pauseAudio = () => {
  audio.pause();
  pauseButton.classList.add("hide");
  playButton.classList.remove("hide");
};

//previous song
const previousSong = () => {
  if (localStorage.getItem("playType") === "ORDER") {
    index--;
    if (index < 0) {
      index = PLAYLIST.length - 1;
    }
  } else if (localStorage.getItem("playType") === "SHUFFLE") {
    const random = Math.floor(Math.random() * PLAYLIST.length);
    index = random;
  }
  setSong(index);
  playAudio();
};

//next song when current song ends
audio.onended = () => {
  nextSong();
};

//play button
playButton.addEventListener("click", playAudio);
//next button
nextButton.addEventListener("click", nextSong);
//pause button
pauseButton.addEventListener("click", pauseAudio);
//prev button
previousButton.addEventListener("click", previousSong);

progressBar.addEventListener("click", (event) => {
  //start of progressBar
  let coordStart = progressBar.getBoundingClientRect().left;
  //mouse click position
  let coordEnd = event.clientX;
  let progress = (coordEnd - coordStart) / progressBar.offsetWidth;
  //set width to progress
  currentProgress.style.width = progress * 100 + "%";
  //set time
  audio.currentTime = progress * audio.duration;
  //play
  audio.play();
  pauseButton.classList.remove("hide");
  playButton.classList.add("hide");
});

//update progress every second
setInterval(() => {
  currentTimeRef.innerHTML = timeFormatter(audio.currentTime);
  currentProgress.style.width =
    (audio.currentTime / audio.duration.toFixed(3)) * 100 + "%";
});

//update time
audio.addEventListener("timeupdate", () => {
  currentTimeRef.innerText = timeFormatter(audio.currentTime);
});

// show toast
function showToast(message, color) {
  var x = document.getElementById("snackbar");
  x.className = "show";
  x.style.background = color;
  x.textContent = message;
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 1000);
}
