// DOM
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const contextPath = `${location.origin}/`;

const songsList = $(".songs__list");
const audio = $("#audio");
const cdThumb = $(".header__cd-thumb");
const headingSong = $(".header__heading-song");
const headingSinger = $(".header__heading-singer");

// Database
let audiosDb = [];
let settingsDb = {};

(async (callback) => {
    await fetch(`${contextPath}db/audios.json`)
        .then((resp) => resp.json()).then((json) => {
            audiosDb = json;
            return;
        });
    await fetch(`${contextPath}db/settings.json`)
        .then((resp) => resp.json())
        .then((json) => {
            settingsDb = json;
            return;
        });
    callback();
})(start);

const app = {
    songs: [],
    settings: {},
    currenPlaylistIndex: 0,
    currentSong: {},
    init: function () {
        this.loadSongs(audiosDb);
        this.initSettings(settingsDb);
        this.initRender();
    },
    loadSongs: function (audiosDb) {
        this.songs = audiosDb.map(a => {
            a.path = `${contextPath}${a.path}`;
            a.thumb = `${contextPath}${a.thumb}`;
            return a;
        });
    }, initSettings(settingsDb) {
        this.settings = settingsDb;
        this.loadCurrentSong();
    },
    loadCurrentSong: function () {
        this.currentSong = this.songs.find(song => song.id === this.settings.currentSongId);
    },
    initRender: function () {
        this.renderSongs();
        this.renderCurrentSong();
    },
    renderSongs: function () {
        let i = 0;
        const htmls = this.songs.map(song =>
            `<li class="songs__list-item" song-id="${i++}">
                <img class="songs__list-item-thumb" 
                style="background-image: url('${song.thumb}');">
                <div class="songs__list-item-detail">
                    <h3 class="songs__list-item-detail-name">${song.name}</h3>
                    <h4 class="songs__list-item-detail-singer">${song.singer}</h4>
                </div>
            </li>`);
        songsList.innerHTML = htmls.join("");
    },
    renderCurrentSong() {
        cdThumb.style.backgroundImage = `url(${this.currentSong.thumb})`;
        headingSong.textContent = this.currentSong.name;
        headingSinger.textContent = this.currentSong.singer;
        audio.src = this.currentSong.path;
    },
    initHandler: function () {

    },
    start: function () {
        this.init();

    }
}

function start() {
    app.start();
}