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
    iconPath = alertIcons[alertLevel] || "icons/question.png"
) {
    const window = document.getElementById("alert-window");
    const title = document.getElementById("alert-title");
    const text = document.getElementById("alert-text");
    const icon = document.getElementById("alert-icon");

    title.innerText = titleText;
    text.innerText = message;
    icon.src = iconPath;
    window.style.display = "block";
}