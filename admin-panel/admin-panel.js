import '../src/styles/baseStyle.css';
import '../src/styles/style.css';
import 'xp.css/dist/XP.css';

import '../src/checkAdmin.js';
import '../src/api/firebase.js';
import { getMessages } from "../src/api/firebase.js";

document.querySelector('#app').innerHTML = `
    <div id="main-window" class="window" style="width: 100%; height: 100%; display: none">
        <div class="title-bar" style="position: relative; z-index: 10">
            <div class="title-bar-text">Mr Answers Himself!</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Restore"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body">
            <div class="center-fill">
                <img id="logo" style="z-index: 20" src="../public/jake_time_banner.png" alt="Log In Banner!">
            </div>
            
            <div style="margin-top: 20px; align-items: center; width: 100%; justify-content: center; display: flex">
                <div class="window" style="width: 50%; max-height: 70vh; height: auto">
                    <div class="title-bar" style="position: relative; z-index: 10">
                        <div class="title-bar-text">Questions for you!</div>
                    </div>
                    <div class="window-body" id="message-window" style="max-height: 65vh; height: auto; overflow-y: scroll"></div>
                </div>
            </div>
        </div>
    </div>
    
    <button id="home-button">
        <img src="../public/icons/home.png" alt="Home Button" style="width: 25px; height: 25px">
    </button>
`

document.getElementById("home-button").addEventListener("click", () => {
   window.location = "/projects/answers-time/index.html";
})

document.addEventListener("DOMContentLoaded", async () => {
   document.getElementById("main-window").style.display = "block";

   const wind = document.getElementById("message-window");
   const messages = await getMessages();
   messages.sort((a, b) => new Date(b.date) - new Date(a.date));

   for (const message of messages) {
      const textArea = document.createElement("ul");
      textArea.classList.add("tree-view");

      const content = document.createElement("li");
      const wrapper = document.createElement("div");
      wrapper.style.width = "100%";
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "row";

      const dateBox = document.createElement("div")
      dateBox.style.width = "20%";
      dateBox.innerText = message.date;
      dateBox.style.fontWeight = "bold";
      dateBox.style.fontSize = "12px";

      const messageBox = document.createElement("div")
      messageBox.style.width = "80%";
      messageBox.innerText = message.value;
      messageBox.style.textAlign = "left";
      messageBox.style.fontSize = "12px";

      wrapper.appendChild(dateBox);
      wrapper.appendChild(messageBox)
      content.appendChild(wrapper);
      textArea.appendChild(content);
      wind.appendChild(textArea);
   }
});