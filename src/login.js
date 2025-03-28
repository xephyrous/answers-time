import './styles/baseStyle.css'
import './styles/style.css'
import 'xp.css/dist/XP.css'

import { loginAdmin, blockSignOut } from "./api/firebase.js";

document.querySelector('#app').innerHTML = `
    <div id="main-window" class="window" style="width: 100%; height: 100%">
        <div class="title-bar" style="position: relative; z-index: 10">
            <div class="title-bar-text">Login!</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Restore"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body">
            <div class="center-fill">
                <img id="logo" style="z-index: 20" src="log_in.gif" alt="Log In Banner!">
            </div>
            
            <div class="center-fill">
                <div class="window" style="z-index: 1050">
                    <div class="title-bar" style="position: relative; z-index: 10">
                        <div class="title-bar-text" style="width: 100%; text-align: center">ᓚᘏᗢ</div>
                    </div>
                    <div class="window-body">
                        <div class="field-row-stacked" style="width: 30vw">
                          <label for="username_field" style="font-weight: bold">Email</label>
                          <input id="username_field" type="text" style="color: black; font-weight: bold"/>
                        </div>
                        <div class="field-row-stacked" style="width: 30vw">
                          <label for="password_field" style="font-weight: bold">Password</label>
                          <input id="password_field" type="password" style="color: black; font-weight: bold"/>
                        </div>
                        <div class="field-row-stacked" style="width: 30vw">
                            <button id="login-button" style="color: black; font-weight: bold">Steal My Information!</button>
                        </div>
                    </div>
                </div>
            </div>
            
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
        </div>
    </div>
`

document.getElementById("login-button").addEventListener("click", () => {
    loginAdmin(document.getElementById("username_field").value, document.getElementById("password_field").value)
        .then((user) => {
            if (user) {
                setTimeout(() => {
                    window.location = "index.html";
                }, 100);
            }
        });
});