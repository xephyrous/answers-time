import './styles/baseStyle.css';
import './styles/style.css';
import 'xp.css/dist/XP.css';

import './checkAdmin.js';
import './api/firebase.js';
import {getMessages, logoutUser, updateMessages, getFavorites, updateData} from "./api/firebase.js";
import {getAllVideos} from "./api/youtube.js";
import {AlertLevel, displayAlert, displayNotification} from "./alerts.js";
import {doc} from "firebase/firestore";

let stagedMessages = [];
let productionMode = false;
let currentQuestion = -1;
let noPress = false;

const Buttons = {
   ADD: 'icons/add.png',
   GOOD: 'icons/goods.png',
   REMOVE: 'icons/remove.png',
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
                <img id="logo" class="img-border" style="z-index: 20" src="jake_time_banner.png" alt="Log In Banner!">
            </div>
            
            <div style="margin-top: 20px; align-items: center; width: 100%; justify-content: center; display: flex; flex-direction: column">
                <div style="margin-bottom: -19px; margin-right: calc(-50% + 230px); display: none">
                    <label for="archive-filter" style="font-weight: bold">Filter</label>
                    <select id="archive-filter" style="width: 200px; color: black; padding: 5px"></select>
                </div>
                <div style="margin-bottom: -19px; margin-right: calc(-50% + 230px); z-index: 1100">
                    <label for="active-filter" style="font-weight: bold">Filter</label>
                    <select id="active-filter" style="width: 200px; color: black; padding: 5px">
                        <option>Newest to Oldest</option>
                        <option>Oldest to Newest</option>
                        <option>Favorites</option>
                    </select>
                </div>
                <section class="tabs" style="width: 50%; height: auto; z-index: 1050" id="tab-panel">
                    <menu role="tablist" aria-label="Sample Tabs">
                       <button role="tab" aria-selected="true" aria-controls="questions"><strong>New Questions</strong></button>
                       <button role="tab" aria-controls="questions-archive"><strong>Questions Archive</strong></button>
                       <button role="tab" aria-controls="production-studio"><strong>Production Studio (0)</strong></button>
                       <button role="tab" aria-controls="production-mode" style="display: none; margin-left: auto" title="Production Mode">
                          <img src="icons/play.png" alt="Production Mode" style="width: 20px; height: 20px; padding-top: 3px">
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
                 <img src="icons/previous.png" alt="Previous Button" style="width: 25px; height: 25px">
             </button>
             
             <strong style="margin-right: 6px; font-size: 14px" id="question-count">?/?</strong>
             
             <button id="next-button" class="floating-button" title="Next Question">
                 <img src="icons/next.png" alt="Next Button" style="width: 25px; height: 25px">
             </button>
          </div>
        </fieldset>
    </div>
    
    <fieldset class="control-group" id="floating-controls" style="top: 40px; left: 15px; width: 100px; height: 65px">
       <legend>Admin Controls</legend>
       <div class="field-row">
          <button id="home-button" class="floating-button" title="Home">
              <img src="icons/home.png" alt="Home Button" style="width: 25px; height: 25px">
          </button>
          
          <button id="logout-button" class="floating-button" title="Logout">
              <img src="icons/logout.png" alt="Logout Button" style="width: 25px; height: 25px">
          </button>
          
          <button id="clean-button" class="floating-button" title="Clean Questions">
              <img src="icons/clean.png" alt="Clean Questions Button" style="width: 25px; height: 25px">
          </button>
       </div>
    </fieldset>
`

// Return to homepage
document.getElementById("home-button").addEventListener("click", () => {
   window.location = "index.html";
})

// Logout
document.getElementById("logout-button").addEventListener("click", async () => {
   await logoutUser();
   window.location = "index.html";
})


// Clean Questions
document.getElementById("clean-button").addEventListener("click", async () => {
   const questions = await getMessages();
   const filteredQuestions = questions
       .sort((a, b) => new Date(b.value.date) - new Date(a.value.date))
       .filter((question, index, arr) => {
          const containsQuestionMark = question.value.message.includes('?');
          return (
              (index === 0 || question.value.message !== arr[index - 1].value.message) &&
              containsQuestionMark
          );
       });

   const diff = questions.length - filteredQuestions.length;

   if (diff === 0) {
      displayNotification(`No messages to clean!`, AlertLevel.INFO, 2000);
      return;
   }

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
   const sortedMessages = messages.filter(msg => new Date(msg.value.date) > new Date(latestVideo.publishedAt))
       .sort((a, b) => new Date(b.value.date) - new Date(a.value.date));
   const oldMessages = messages.filter(msg => !sortedMessages.some(sortedMsg => sortedMsg.value.date === msg.value.date))
       .sort((a, b) => new Date(b.value.date) - new Date(a.value.date));

   // Load messages
   generateMessages(document.getElementById("questions"), sortedMessages, Buttons.ADD);
   document.querySelector("[aria-controls='questions']").children[0].innerText = "Questions (" + sortedMessages.length + ")";
   generateMessages(document.getElementById("questions-archive"), oldMessages, Buttons.ADD);
   document.querySelector("[aria-controls='questions-archive']").children[0].innerText = "Questions Archive (" + oldMessages.length + ")";

   await updateMessages(filteredQuestions);
   if (diff === 1) {
      displayNotification(`Cleaned 1 message!`, AlertLevel.INFO, 2000);
   } else {
      displayNotification(`Cleaned ${diff} messages`, AlertLevel.INFO, 2000)
   }
})

// Previous question
document.getElementById("previous-button").addEventListener("click", async () => {
   currentQuestion -= 1;
   if (productionMode && stagedMessages.length > 0 && currentQuestion !== -1 && !noPress) {
      document.getElementById("question-count").innerText = (currentQuestion + 1) + "/" + stagedMessages.length;
      const card = document.getElementById("question-card");
      card.style.transition = "left 1s ease-in-out";
      noPress = true;

      card.style.left = "-645px";
      setTimeout(() => {
         card.style.transition = "";
         card.style.left = "100vw";
         setTimeout(() => {
            document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value.message;
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
         document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value.message;
         card.style.left = "calc(50% - 320px)";
         setTimeout(() => { noPress = false; }, 1000);
      } else {
         card.style.left = "100vw";
         setTimeout(() => {
            card.style.transition = "";
            card.style.left = "-645px";
            setTimeout(() => {
               document.getElementById("question-text").innerText = stagedMessages[currentQuestion].value.message;
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
       "Production Mode Activated!", "icons/information.png", 1000
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

   // Generate archive filter options
   const archiveFilter = document.getElementById("archive-filter");
   for (let video of filteredVideos) {
      const option = document.createElement("option");
      option.text = video.title;
      archiveFilter.appendChild(option);
   }

   // Generate messages
   const messages = await getMessages();
   const sortedMessages = messages.filter(msg => new Date(msg.value.date) > new Date(latestVideo.publishedAt))
                                       .sort((a, b) => new Date(b.value.date) - new Date(a.value.date));
   const oldMessages = messages.filter(msg => !sortedMessages.some(sortedMsg => sortedMsg.value.date === msg.value.date))
                                    .sort((a, b) => new Date(b.value.date) - new Date(a.value.date));

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
      dateBox.innerText = message.value.date;
      dateBox.style.fontWeight = "bold";
      dateBox.style.fontSize = "12px";

      const messageBox = document.createElement("div")
      messageBox.style.width = "80%";
      try {
         messageBox.innerText = message.value.message;
         if (messageBox.innerText === undefined || messageBox.innerText === "undefined") { throw new Error(); }
      } catch (_) {
         messageBox.innerText = message.value;
      }
      messageBox.style.textAlign = "left";
      messageBox.style.fontSize = "12px";

      const ipBox = document.createElement("img");
      ipBox.style.width = "20px";
      ipBox.style.height = "20px";
      ipBox.style.paddingRight = "7px";
      ipBox.src = "icons/network.png";
      ipBox.title = message.value.ip;

      const star = document.createElement("img");
      star.src = "icons/star.png";
      star.style.width = "20px";
      star.style.height = "20px";

      const favButton = document.createElement("button");
      favButton.classList.add("small-button");
      favButton.title = "Favorite";
      favButton.onclick = async () => {
         const favorites = await getFavorites();
         console.log(favorites);
      };

      favButton.appendChild(star);

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
               button.title = "Add to Production Studio"
               button.onclick = () => {
                  stagedMessages.push(message);
                  document.querySelector("[aria-controls='production-studio']").children[0].innerText = "Production Studio (" + stagedMessages.length + ")";
                  addImage.src = "icons/good.png";
                  setTimeout(() => {
                     addImage.src = "icons/add.png";
                  }, 500);
               };
               break;
            case Buttons.REMOVE:
               button.title = "Remove from Production Studio";
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
      if (typeof message.value === "object") {
         wrapper.appendChild(ipBox);
      }
      wrapper.appendChild(messageBox);
      wrapper.appendChild(favButton);
      if (buttonType !== Buttons.NONE) { wrapper.appendChild(button); }
      content.appendChild(wrapper);
      textArea.appendChild(content);
      container.appendChild(textArea);
   }
}