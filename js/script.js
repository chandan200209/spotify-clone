'use strict';
console.log('Let\'s write Javascript');
// let songs;
let songs;
let currentSong = new Audio();
let currFolder;
// play.src = 'img/pause.svg';

function formatTime(seconds) {
    // Ensure the input is an integer
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Pad single digits with a leading zero
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1].replaceAll('%20', ' '));
        }
    }

    let songUl = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                  <div class="songListDiv flex">
                    <img class="invert" src="img/music.svg" alt="music-logo" />
                    <div class="info">
                      <div>${song}</div>
                      <div style="color: beige;"> ChandanVEVO </div>
                    </div>
                  </div>
                  <img
                    src="img/play-circle.svg"
                    class="invert"
                    alt="play-button-icon"
                  />
                </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML);
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        })
    })
    return songs;
}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    // audio.play();
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = 'img/play-button.svg';
    }
    play.src = 'img/pause.svg';
    document.querySelector('.song-name').innerHTML = `${decodeURI(track)}`;
    document.querySelector('.song-time').innerHTML = `00:00 / 00:00`;
}
async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.card-container');
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes('/songs') && !e.href.includes('.htaccess')) {
            let folder = e.href.split('/').slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card p-1" data-folder="${folder}">
              <div class="play">
                <img src="img/play-button.svg" alt="play-button" />
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt="card-image"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
    console.log(div);

}
async function main() {
    // get the list of all the songs
    await getSongs(`songs/cs`);
    playMusic(songs[0], true);
    console.log(songs);

    // Display all the albums on the page
    await displayAlbums();

    // // play the audio of the first song
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     // let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime);

    // })

    // Attach an event listener to previous, play and next
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = 'img/pause.svg';
        }
        else {
            currentSong.pause();
            play.src = 'img/play-button.svg';
        }
    })

    // Listen for timeupdate function
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/ ${formatTime(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to the seekbar
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);
        document.querySelector('.circle').style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = "0%";
    })

    // Add an event listener for close button
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-120%";
    })

    // Add an event listener to previous
    document.querySelector("#previous").addEventListener('click', () => {
        currentSong.pause();
        console.log('Previous Clicked');
        console.log(currentSong);

        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].replaceAll('%20', ' '));
        console.log(songs, index);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    // Add an event listener to next
    document.querySelector("#next").addEventListener('click', () => {
        currentSong.pause();
        console.log('Next Clicked');
        console.log(currentSong);

        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].replaceAll('%20', ' '));
        console.log(songs, index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
        else if ((index + 1) === songs.length) {
            playMusic(songs[index]);
        }
    })

    // Add an event listener to the volume element
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        console.log("setting volume to ", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector('.volume-img>img').src = document.querySelector('.volume-img>img').src.replace('mute.svg', 'volume.svg');
        }
    })

    // Add event listener to mute the track
    document.querySelector('.volume-img > img').addEventListener('click', e => {
        console.log(e.target);
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
            currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            document.querySelector('.range').getElementsByTagName('input')[0].value = 10;
            currentSong.volume = 0.1;
        }

    })
}
main();
