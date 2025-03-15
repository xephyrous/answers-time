import './styles/baseStyle.css'
import './styles/style.css'
import 'xp.css/dist/XP.css'

import './askJakeButton.js'
import './elevenlabsWidget.js'
import { restyle } from "./elevenlabsWidget.js";
import {checkAdmin} from "./api/firebase.js";

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
            
            <div class="window" id="ask-jake-window">
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
            
            <img src="icons/msagent.png" alt="Login Gentleman" id="login-gentleman">
            
            <elevenlabs-convai agent-id="5pnMP6M3rGgecFTd8oIJ"></elevenlabs-convai><script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>
        </div>
    </div>
`

document.addEventListener("DOMContentLoaded", () => {
    restyle();
});

document.getElementById("login-gentleman").addEventListener("click", async () => {
    if (document.getElementById("login-gentleman").getBoundingClientRect().left < 229) {
        console.log(document.getElementById("login-gentleman").getBoundingClientRect().left);
        return;
    }

    setTimeout(() => {
        window.location.href = "/projects/answers-time/login/index.html";
    }, 500);
});