import './elevenlabsWidget.js'
import { addMessage } from "./api/firebase.js";
import {displayAlert, displayNotification} from "./alerts.js";

let askButtonState = 0;

document.addEventListener("DOMContentLoaded", () => {
    const askJakeButton = document.getElementById("ask-jake-button");

    askJakeButton.addEventListener("mouseover", () => {
        if (askButtonState === 0) {
            askJakeButton.src = "button_hover.png";
            askButtonState = 1;
        }
    });

    askJakeButton.addEventListener("mousedown", () => {
        if (askButtonState === 1) {
            askJakeButton.src = "button_press.png";
            askButtonState = 2;
            askJake();

            setTimeout(() => {
                if (askButtonState === 2) {
                    askJakeButton.src = "button_hover.png";
                    askButtonState = 1;
                }
            }, 500);
        }
    });

    askJakeButton.addEventListener("mouseout", () => {
        if (askButtonState === 2) {
            setTimeout(() => {
                askJakeButton.src = "button_n.png";
                askButtonState = 0;
            }, 500);
        } else if (askButtonState === 1) {
            askJakeButton.src = "button_n.png";
            askButtonState = 0;
        }
    });
});

function askJake() {
    const text = document.getElementById("jake-text").value;
    document.getElementById("jake-text").innerText = '';

    if (text === "") {
        displayNotification("Why don't you start by typing something in the box first?");
        return;
    } else if (text === "undefined") {
        displayNotification("Nice try nerd 🤓");
        return;
    } else if (!text.includes("?")) {
        displayNotification("Questions only!");
        return
    } else if (text[0] !== text[0].toUpperCase()) {
        displayNotification("Remember to start with a capital letter!");
        return;
    }

    addMessage(text);
}
