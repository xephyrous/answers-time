export const AlertLevel = {
    INFO: "Notification",
    WARNING: "Warning",
    ERROR: "Error"
}

const alertIcons = {
    "Notification": "icons/information.png",
    "Warning": "icons/warning.png",
    "Error": "icons/remove.png"
}

// TODO : Add alert queue

export function displayAlert(
    message, alertLevel = AlertLevel.INFO, titleText = alertLevel,
    iconPath = alertIcons[alertLevel] || "icons/question.png",
    timeout = null
) {
    const window = document.getElementById("alert-window");
    const title = document.getElementById("alert-title");
    const text = document.getElementById("alert-text");
    const icon = document.getElementById("alert-icon");

    title.innerText = titleText;
    text.innerText = message;
    icon.src = iconPath;
    window.style.display = "block";

    if (timeout !== null) {
        setTimeout(() => {
            window.style.display = "none";
        }, timeout);
    }
}

export function displayNotification(message, titleText = AlertLevel.INFO, timeout = null) {
    displayAlert(message, AlertLevel.INFO, titleText, alertIcons[AlertLevel.INFO], timeout);
}

export function displayWarning(message, titleText = AlertLevel.WARNING, timeout = null) {
    displayAlert(message, AlertLevel.WARNING, titleText, alertIcons[AlertLevel.WARNING], timeout);
}

export function displayError(message, titleText = AlertLevel.ERROR, timeout = null) {
    displayAlert(message, AlertLevel.ERROR, titleText, alertIcons[AlertLevel.ERROR], timeout);
}