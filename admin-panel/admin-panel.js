import '../src/styles/baseStyle.css';
import '../src/styles/style.css';
import 'xp.css/dist/XP.css';

import '../src/checkAdmin.js';
import '../src/api/firebase.js';
import {getMessages, logoutUser} from "../src/api/firebase.js";
import {getAllVideos} from "../src/api/youtube.js";
import {AlertLevel, displayAlert} from "../src/alerts.js";
import {doc} from "firebase/firestore";

let stagedMessages = [];
let productionMode = false;
let currentQuestion = -1;
let noPress = false;

const Buttons = {
   ADD: '../icons/add.png',
   GOOD: '../icons/goods.png',
   REMOVE: '../icons/remove.png',
   NONE: ''
}

document.querySelector('#app').innerHTML = `
    <div id="main-window" class="window" style="width: 100%; height: 100%; display: none">
        <div class="title-bar" style="position: relative; z-index: 10">
            <div class="title-bar-text">mmmungh</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Restore"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
        <div class="window-body">
            <div class="center-fill" id="logo-box">
                <img id="logo" class="img-border" style="z-index: 20" src="../jake_time_banner.png" alt="Log In Banner!">
            </div>
            
            <div style="margin-top: 20px; align-items: center; width: 100%; justify-content: center; display: flex">
                <section class="tabs" style="width: 50%; height: auto; z-index: 1050" id="tab-panel">
                    <menu role="tablist" aria-label="Sample Tabs">
                       <button role="tab" aria-selected="true" aria-controls="questions"><strong>New Questions</strong></button>
                       <button role="tab" aria-controls="questions-archive"><strong>Questions Archive</strong></button>
                       <button role="tab" aria-controls="production-studio"><strong>Production Studio (0)</strong></button>
                       <button role="tab" aria-controls="production-mode" style="display: none; margin-left: auto" title="Production Mode">
                          <img src="../icons/play.png" alt="Production Mode" style="width: 20px; height: 20px; padding-top: 3px">
                       </button>
                    </menu>
                    
                    <!-- Questions Panel -->
                    <article role="tabpanel" id="questions" style="max-height: 67vh; overflow-y: scroll"></article>
                    
                    <!-- Questions archive -->
                    <article role="tabpanel" hidden id="questions-archive" style="max-height: 67vh; overflow-y: scroll"></article>
                    
                    <!-- Production Studio -->
                    <article role="tabpanel" hidden id="production-studio" style="max-height: 67vh; overflow-y: scroll"></article>
                </section>
            </div>
            
            <div id="question-card" class="question-card" style="left: -645px">
                <p id="question-text"></p>
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
    
    <div class="center-fill" >
        <fieldset class="control-group" id="question-controls" style="bottom: 20px; width: 120px; height: 65px; display: none">
          <legend>Question Controls</legend>
          <div class="field-row">
             <button id="previous-button" class="floating-button" title="Previous Question">
                 <img src="../icons/previous.png" alt="Previous Button" style="width: 25px; height: 25px">
             </button>
             
             <strong style="margin-right: 6px; font-size: 14px" id="question-count">?/?</strong>
             
             <button id="next-button" class="floating-button" title="Next Question">
                 <img src="../icons/next.png" alt="Next Button" style="width: 25px; height: 25px">
             </button>
          </div>
        </fieldset>
    </div>
    
    <fieldset class="control-group" id="floating-controls" style="top: 40px; left: 15px; width: 100px; height: 65px">
       <legend>User Controls</legend>
       <div class="field-row">
          <button id="home-button" class="floating-button" title="Home">
              <img src="../icons/home.png" alt="Home Button" style="width: 25px; height: 25px">
          </button>
          
          <button id="logout-button" class="floating-button" title="Logout">
              <img src="../icons/logout.png" alt="Logout Button" style="width: 25px; height: 25px">
          </button>
       </div>
    </fieldset>
`

// Return to homepage
document.getElementById("home-button").addEventListener("click", () => {
   window.location = "/projects/answers-time/index.html";
})

// Logout
document.getElementById("logout-button").addEventListener("click", async () => {
   await logoutUser();
   window.location = "/projects/answers-time/index.html";
})

// Previous question
document.getElementById("previous-button").addEventListener("click", async () => {
   if (productionMode && stagedMessages.length > 0 && currentQuestion !== -1 && !noPress) {
      currentQuestion -= 1;
      document.getElementById("question-count").innerText = (currentQuestion + 1) + "/" + stagedMessages.length;
      const card = document.getElementById("question-card");
      card.style.transition = "left 1s ease-in-out";
      noPress = true;

      card.style.left = "-645px";
      setTimeout(() => {
         card.style.transition = "";
         card.style.left = "100vw";
         setTimeout(() => {
            document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value;
            card.style.transition = "left 1s ease-in-out";
            card.style.left = "calc(50% - 320px)";
            setTimeout(() => { noPress = false; }, 1000);
         }, 50);
      }, 1000);
   }
})

// Next question
document.getElementById("next-button").addEventListener("click", async () => {
   if (productionMode && stagedMessages.length > 0 && currentQuestion !== stagedMessages.length - 1 && !noPress) {
      currentQuestion += 1;
      document.getElementById("question-count").innerText = (currentQuestion + 1) + "/" + stagedMessages.length;
      const card = document.getElementById("question-card");
      card.style.transition = "left 1s ease-in-out";
      noPress = true;

      if (card.style.left === "-645px") {
         document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value;
         card.style.left = "calc(50% - 320px)";
         setTimeout(() => { noPress = false; }, 1000);
      } else {
         card.style.left = "100vw";
         setTimeout(() => {
            card.style.transition = "";
            card.style.left = "-645px";
            setTimeout(() => {
               document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value;
               card.style.transition = "left 1s ease-in-out";
               card.style.left = "calc(50% - 320px)";
               setTimeout(() => { noPress = false; }, 1000);
            }, 50);
         }, 1000);
      }
   }
})

// Load production messages and display production button
document.querySelector('[aria-controls="production-studio"]').addEventListener("click", () => {
   document.querySelector("[aria-controls='production-mode']").style.display = "block";
   const container = document.getElementById('production-studio');
   container.innerHTML = '';
   generateMessages(container, stagedMessages, Buttons.REMOVE);
});

// Enter production mode
document.querySelector('[aria-controls="production-mode"]').addEventListener("click", () => {
   productionMode = true;
   currentQuestion = -1;
   noPress = false;
   document.getElementById("question-count").innerText = (currentQuestion + 1) + "/" + stagedMessages.length;
   displayAlert(
       "Press [Escape] to exit production mode!", AlertLevel.INFO,
       "Production Mode Activated!", "../icons/information.png", 1000
   );
   document.getElementById("question-card").style.display = "flex";
   document.getElementById("floating-controls").style.display = "none";
   document.getElementById("tab-panel").style.display = "none";
   document.getElementById("logo-box").style.display = "none";
   document.getElementById("question-controls").style.display = "flex";
});

// Exit production mode
document.addEventListener("keydown", (key) => {
   if (key.key === "Escape" && productionMode) {
      productionMode = false;
      document.getElementById("question-card").style.transition = "";
      document.getElementById("question-card").style.left = "-645px";
      document.getElementById("question-card").style.display = "none";
      document.getElementById("floating-controls").style.display = "flex";
      document.getElementById("tab-panel").style.display = "block";
      document.getElementById("logo-box").style.display = "block";
      document.querySelector("[aria-controls='production-studio']").click();
      document.getElementById("question-controls").style.display = "none";
   }
});

// Load messages, handle tab panel interactions
document.addEventListener("DOMContentLoaded", async () => {
   document.getElementById("main-window").style.display = "block";

   // Get current messages
   const videos = await getAllVideos();
   const regex = /answering\syour\squestions\s\d/i;
   const filteredVideos = videos.filter(item => regex.test(item.title));
   const latestVideo = filteredVideos.reduce((maxVideo, currentVideo) => {
      const num1 = parseInt(maxVideo.title.trim().slice(-1), 10) || 0;
      const num2 = parseInt(currentVideo.title.trim().slice(-1), 10) || 0;

      return num2 > num1 ? currentVideo : maxVideo;
   }, videos[0]);

   // Generate messages
   const messages = await getMessages();
   const sortedMessages = messages.filter(msg => new Date(msg.date) > new Date(latestVideo.publishedAt))
                                       .sort((a, b) => new Date(b.date) - new Date(a.date));
   const oldMessages = messages.filter(msg => !sortedMessages.some(sortedMsg => sortedMsg.date === msg.date))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date));

   // Generate messages
   generateMessages(document.getElementById("questions"), sortedMessages, Buttons.ADD);
   document.querySelector("[aria-controls='questions']").children[0].innerText = "Questions (" + sortedMessages.length + ")";
   generateMessages(document.getElementById("questions-archive"), oldMessages, Buttons.ADD);
   document.querySelector("[aria-controls='questions-archive']").children[0].innerText = "Questions Archive (" + oldMessages.length + ")";

   // Tab panel interactions
   const tabButtons = document.querySelectorAll('[role="tab"]');
   const tabPanels = document.querySelectorAll('[role="tabpanel"]');

   tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
         if (!button.innerText.includes("Production Studio")) {
            document.querySelector("[aria-controls='production-mode']").style.display = "none";
         }
         tabButtons.forEach((btn) => btn.setAttribute("aria-selected", "false"));
         tabPanels.forEach((panel) => panel.hidden = true);

         button.setAttribute("aria-selected", "true");
         const panelId = button.getAttribute("aria-controls");
         try { document.getElementById(panelId).hidden = false; } catch (_) {}
      });
   });
});

function generateMessages(container, messages, buttonType) {
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
      messageBox.innerText = typeof message.value === "Object" ? message.value : message.value["message"];
      messageBox.style.textAlign = "left";
      messageBox.style.fontSize = "12px";

      let button;
      if (buttonType !== Buttons.NONE) {
         const addImage = document.createElement("img");
         addImage.src = buttonType;
         addImage.style.width = "20px";
         addImage.style.height = "20px";

         button = document.createElement("button");
         button.classList.add("small-button");

         switch (buttonType) {
            case Buttons.ADD:
               button.onclick = () => {
                  stagedMessages.push(message);
                  document.querySelector("[aria-controls='production-studio']").children[0].innerText = "Production Studio (" + stagedMessages.length + ")";
                  addImage.src = "../icons/good.png";
                  setTimeout(() => {
                     addImage.src = "../icons/add.png";
                  }, 500);
               };
               break;
            case Buttons.REMOVE:
               button.onclick = () => {
                  const pos = stagedMessages.findIndex(obj => obj === message);
                  stagedMessages.splice(pos, 1);
                  document.querySelector("[aria-controls='production-studio']").children[0].innerText = "Production Studio (" + stagedMessages.length + ")";
                  textArea.remove();
               };
               break;
         }

         button.appendChild(addImage);
      }

      wrapper.appendChild(dateBox);
      wrapper.appendChild(messageBox);
      if (buttonType !== Buttons.NONE) { wrapper.appendChild(button); }
      content.appendChild(wrapper);
      textArea.appendChild(content);
      container.appendChild(textArea);
   }
}