import './elevenlabsWidget.js'
import { addMessage } from "./api/firebase.js";
import {displayAlert} from "./alerts.js";

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
        return;
    }

    addMessage(text);
}
