import './styles/baseStyle.css'
import './styles/style.css'
import 'xp.css/dist/XP.css'

import './askJakeButton.js'
import './elevenlabsWidget.js'
import { restyle } from "./elevenlabsWidget.js";
import {getMostRecentVideo, getUploadsPlaylist} from "./api/youtube.js";
import {AlertLevel, displayAlert} from "./alerts.js";

// Main page layout
document.querySelector('#app').innerHTML = `
    <div id="main-window" class="window-full" style="width: 100%; height: 100%">
        <div class="title-bar" style="position: relative; z-index: 10">
            <div class="title-bar-text">Answers Time!</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Restore"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body">
            <div class="center-fill">
                <img id="logo" class="img-border" style="z-index: 20" src="answers_time_banner.png" alt="Answers Time Banner!">
            </div>
            
            <div style="margin-top: 20px; align-items: center; width: 100%; justify-content: center; display: flex">
                <div class="window" style="width: 50%; max-height: 70vh; height: auto">
                    <div class="title-bar" style="position: relative; z-index: 10">
                        <div class="title-bar-text" id="video-title"></div>
                    </div>
                    <div class="window-body" id="message-window" style="max-height: 65vh; height: auto; overflow-y: hidden">
                        <img id="video-thumbnail" src="" alt="Video Thumbnail">
                    </div>
                </div>
            </div>
            
            <div class="window" id="ask-jake-window" style="z-index: 1050">
                <div class="title-bar">
                    <div class="title-bar-text">Ask Jake</div>
                    <div class="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Restore"></button>
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body" style="display: flex; flex-direction: row">
                    <img id="ask-jake-button" src="button_n.png" alt="Ask Jake Button">
                    <textarea id="jake-text" style="margin: 10px; color: black"></textarea>
                </div>
            </div>
            
            <img src="icons/msagent.png" alt="Login Gentleman" style="z-index: 1025" id="login-gentleman">
            
            <div class="center-fill alert-container" style="height: 100%">
                <div class="window alert-modal" id="alert-window" style="max-width: 30vw; max-height: 30vh; display: none">
                    <div class="title-bar">
                        <div class="title-bar-text" id="alert-title"></div>
                        <div class="title-bar-controls">
                            <button aria-label="Minimize"></button>
                            <button aria-label="Restore"></button>
                            <button aria-label="Close" onclick="document.getElementById('alert-window').style.display = 'none'"></bu tton>
                        </div>
                    </div>
                    <div class="window-body" style="display: flex; flex-direction: row; overflow-y: auto; max-height: 23vh">
                        <img src="" alt="Alert Icon" id="alert-icon" style="width: 25px; height: 25px; margin-left: 5px; position: fixed">
                        <p id="alert-text" style="margin-left: 35px; font-weight: bold"></p>
                    </div>
                </div>
            </div>
            
            <elevenlabs-convai agent-id="5pnMP6M3rGgecFTd8oIJ"></elevenlabs-convai><script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
        </div>
    </div>
`

document.addEventListener("DOMContentLoaded", async () => {
    restyle();

    // Load most recent video
    const mostRecent = await getMostRecentVideo();
    document.getElementById("video-title").innerText = mostRecent.title;
    document.getElementById("video-thumbnail").src = mostRecent.thumbnail;
    document.getElementById("video-thumbnail").setAttribute("data-video-id", mostRecent.videoId);
});

document.getElementById("video-thumbnail").addEventListener("click", () => {
    const id = document.getElementById("video-thumbnail").getAttribute("data-video-id");
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
})

document.getElementById("login-gentleman").addEventListener("click", async () => {
    if (document.getElementById("login-gentleman").getBoundingClientRect().left < 229) {
        console.log(document.getElementById("login-gentleman").getBoundingClientRect().left);
        return;
    }

    setTimeout(() => {
        window.location.href = "login/index.html";
    }, 500);
});