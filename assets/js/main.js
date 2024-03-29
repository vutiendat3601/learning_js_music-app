// DOM
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const originLocation = location.origin;
const contextPath = originLocation.includes("github.io") ?
    `${originLocation}/music-app/` : `${originLocation}/`;

const songsList = $(".songs__list");
const audio = $("#audio");
const cd = $(".header__cd");
const cdThumb = $(".header__cd-thumb");
const headingSong = $(".header__heading-song");
const headingSinger = $(".header__heading-singer");

const btnShuffle = $(".btn-shuffle");
const btnRepeat = $(".btn-repeat");
const btnPlay = $(".btn-play");
const btnNext = $(".btn-next");
const btnPrevious = $(".btn-previous");
const audioProgress = $(".player__progress-seek");
const btnYoutube = $(".btn-youtube");
const btnUpload = $(".btn-upload");
const btnDownload = $(".btn-download");
const inpSearch = $(".songs__searchbar");
let timer = {};
const timerCurrent = $(".player__progress-time-curent");
const timerEnd = $(".player__progress-time-end");
const songs = $(".songs");
const btnShowCd = $(".header__cd-show");
const uploadForm = $("#upload");
const inpMp3 = $("#inp-mp3");
const btnMp3Chooser = $(".btn-mp3-chooser");
const btnThumbChooser = $(".btn-thumb-chooser");
const uploadMp3Path = $(".upload-form__mp3-path");
const uploadThumbPath = $(".upload-form__thumb-path");
const modalOverlay = $(".modal__overlay");
const inpThumb = $("#inp-thumb");
const inpSongName = $("#upload-form__name");
const inpSinger = $("#upload-form__singer");
const inpYoutube = $("#upload-form__youtube");
// Database
let audiosDb = [];
let settingsDb = {};
let settingsURL = "https://api.github.com/repos/vutiendat3601/music-app/contents/db/settings.json";




fetch(`${contextPath}db/audios.json`)
    .then((resp) => resp.json())
    .then((json) => {
        audiosDb = json;
        return fetch(`${contextPath}db/settings.json`)
    }).then((resp) => resp.json())
    .then((json) => { settingsDb = json; app.start(); });

const app = {
    songs: [],
    currentPlaylist: [],
    settings: {},
    currenPlaylistIndex: 0,
    currentSong: {},
    isShuffle: false,
    playedSongs: new Set(),
    init: function () {
        this.loadSongs(audiosDb);
        this.initSettings(settingsDb);
        this.initRender();
        this.initHandler();
    },
    loadSongs: function (audiosDb) {
        this.songs = audiosDb.map(a => {
            a.path = `${contextPath}${a.path}`;
            a.thumb = `${contextPath}${a.thumb}`;
            return a;
        });
        this.currentPlaylist = [...this.songs];
    }, initSettings(settingsDb) {
        this.settings = settingsDb;
        this.loadCurrentSong();
    },
    loadCurrentSong: function () {
        this.currentSong = this.currentPlaylist.find(song => song.id === this.settings.currentSongId);
    },
    initRender: function () {
        this.renderSongs();
        this.renderCurrentSong();
    },
    renderSongs: function () {
        let i = 0;
        const htmls = this.currentPlaylist.map(song =>
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
        btnYoutube.href = this.currentSong.youtube;
        $(`.songs__list-item.active`)?.classList.remove("active");
        $(`.songs__list-item[song-id='${this.currenPlaylistIndex}']`)?.classList.add("active");
        timerCurrent.textContent = secondsToMinutesAndSeconds(0);
        timerEnd.textContent = secondsToMinutesAndSeconds(audio.duration);
    },
    initHandler: function () {
        let _this = this;

        // Play button event
        btnPlay.onclick = () => {
            if (_this.settings.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        btnPrevious.onclick = () => {
            if (audio.currentTime > 3) {
                audio.currentTime = 0;
            } else {
                _this.currenPlaylistIndex--;
                _this.currenPlaylistIndex = _this.currenPlaylistIndex > -1 ?
                    _this.currenPlaylistIndex : 0;
                _this.settings.currentSongId = _this.currentPlaylist[_this.currenPlaylistIndex].id;
                _this.loadCurrentSong();
                _this.renderCurrentSong();
            }
            audio.play();
        }
        btnNext.onclick = () => {
            _this.currenPlaylistIndex++;
            _this.currenPlaylistIndex = _this.currenPlaylistIndex < this.currentPlaylist.length ?
                _this.currenPlaylistIndex : 0;
            _this.settings.currentSongId = _this.currentPlaylist[_this.currenPlaylistIndex].id;
            _this.loadCurrentSong();
            _this.renderCurrentSong();
            audio.play();
        }

        btnShuffle.onclick = () => {
            if (_this.isShuffle) {
                _this.playedSongs.clear();
            }
            $(".btn-shuffle .btn-icon").classList.toggle("active");
            _this.isShuffle = !_this.isShuffle;
        }

        // Upload button event
        btnUpload.onclick = () => {
            uploadForm.style.display = "flex";
        }

        // Download button event
        btnDownload.onclick = () => {
            fetch(_this.currentSong.path)
                .then(resp => resp.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // the filename you want
                    a.download = `${_this.currentSong.name} - ${_this.currentSong.singer}`;
                    // document.body.appendChild(a);
                    a.click();
                    // window.URL.revokeObjectURL(url);
                })
                .catch(() => alert('oh no!'));
        }

        // Song items event
        let songItems = $$(".songs__list-item");
        songItems.forEach(songItem => {
            songItem.onclick = () => {
                _this.currenPlaylistIndex = songItem.getAttribute("song-id");
                _this.settings.currentSongId = _this.currentPlaylist[_this.currenPlaylistIndex].id;
                _this.loadCurrentSong();
                _this.renderCurrentSong();
                audioProgress.value = 0;
                audio.play();
            }
        });
        const cdThumbAnimation = cdThumb.animate([{ transform: "rotate(360deg)" }],
            { duration: 16000, iterations: Infinity });
        cdThumbAnimation.pause();
        // inpSearch
        btnShowCd.onclick = (e) => {
            cd.style.height = "160px";
            cd.style.width = "160px";
            btnShowCd.style.width = "0";
            btnShowCd.style.height = "0";
            btnShowCd.style.fontSize = "0";
        }

        inpSearch.onfocus = () => {
            let height = songsList.offsetHeight;
            songsList.style.height = `${height + cd.offsetHeight}px`;
            cd.style.height = "0";
            cd.style.width = "0";
            btnShowCd.style.height = "16px";
            btnShowCd.style.width = "100px";
            btnShowCd.style.fontSize = "16px";
        }

        inpSearch.oninput = (e) => {
            let keyword = e.target.value;
            keyword = keyword.toLowerCase();
            let result = this.currentPlaylist.filter(song => toNonAccentVietnamese(song.name.concat(song.singer).toLowerCase())
                .includes(toNonAccentVietnamese(keyword.trim())));
            this.currentPlaylist.forEach((s, i) => {
                let item = $(`.songs__list-item[song-id='${i}']`);
                if (!result.includes(s)) {
                    item.style.display = "none";
                } else {
                    item.style.display = "flex";
                }
            });
        }

        // Audio progress event
        audioProgress.onchange = (e) => {
            audio.currentTime = e.target.value / 1000 * audio.duration;
            timerCurrent.textContent = secondsToMinutesAndSeconds(audio.currentTime);
        }

        // Audio event
        audio.onloadedmetadata = () => {
            timerEnd.textContent = secondsToMinutesAndSeconds(audio.duration);
        }
        audio.onplay = () => {
            _this.settings.isPlaying = true;
            btnPlay.classList.add("playing");
            cdThumbAnimation.play();
            timer = setInterval(() => {
                timerCurrent.textContent = secondsToMinutesAndSeconds(audio.currentTime)
            }, 1000);
        }
        audio.onpause = () => {
            _this.settings.isPlaying = false;
            btnPlay.classList.remove("playing");
            cdThumbAnimation.pause();
            if (timer) {
                clearInterval(timer);
            }
        }
        audio.ontimeupdate = () => {
            audioProgress.value = audio.currentTime / audio.duration * 1000;
        }
        audio.onended = () => {
            if (_this.isShuffle) {
                _this.playedSongs.add(_this.currentSong);
                let r = 0;
                if (_this.playedSongs.length != _this.currentPlaylist.length) {
                    do {
                        r = Math.floor(Math.random() * _this.currentPlaylist.length);
                    } while (_this.playedSongs.has(_this.currentPlaylist[r]));
                }
                _this.settings.currentSongId = _this.currentSong.id;
                _this.currentSong = _this.currentPlaylist[r];
                _this.renderCurrentSong();
                audio.play();
            } else {
                btnNext.click();
            }
        }
        inpMp3.onchange = () => {
            uploadMp3Path.value = inpMp3.files[0].name;
        }
        inpThumb.onchange = () => {
            uploadThumbPath.value = inpThumb.files[0].name;
        }
        btnMp3Chooser.onclick = () => {
            inpMp3.click();
        }
        btnThumbChooser.onclick = () => {
            inpThumb.click();
        }
        // event
        uploadForm.onsubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            let mp3File = inpMp3.files[0];
            alert(mp3File.name);
            modalOverlay.click();
        }
        modalOverlay.onclick = () => {
            uploadForm.style.display = "none";
        }
    },
    start: function () {
        this.init();
    }
}


function secondsToMinutesAndSeconds(seconds) {
    seconds = !seconds ? 0 : seconds;
    let minutes = Number.parseInt(seconds / 60);
    seconds = Number.parseInt(seconds % 60);
    seconds = seconds >= 10 ? `${seconds}` : `0${seconds}`;
    minutes = minutes >= 10 ? `${minutes}` : `0${minutes}`;
    return `${minutes}:${seconds}`
}

function toNonAccentVietnamese(str) {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}