import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {doc, getDoc, getFirestore, updateDoc, setDoc} from "firebase/firestore";
import {AlertLevel, displayAlert, displayError} from "../alerts.js";

export var blockSignOut = false;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export async function loginAdmin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);

        onAuthStateChanged(auth, async (user) => {
            const userDocRef = doc(db, "users", email);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                displayError("Invalid username or password!");
                return;
            }

            const userData = userDoc.data();

            if (userData.password !== password) {
                displayError("Invalid username or password!");
                return;
            }

            if (user) {
                if (userData.role !== "admin") {
                    displayError("User is not an admin");
                    return;
                }

                window.location = "admin-panel.html";
            } else {
                displayError("User authentication failed!");
            }
        });

    } catch (error) {
        displayError("Invalid username or password!");
    }
}

export function checkAdmin() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "/projects/answers-time/index.html";
                resolve(false);
                return;
            }

            try {
                const userDocRef = doc(db, "users", user.email);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    window.location.href = "/projects/answers-time/index.html";
                    resolve(false);
                    return;
                }

                const userData = userDoc.data();
                if (userData.role !== "admin") {
                    window.location.href = "/projects/answers-time/index.html";
                    resolve(false);
                    return;
                }

                resolve(true);
            } catch (error) {
                displayError("Database error, failed authentication check!")
                window.location.href = "../admin-panel/index.html";
                reject(error);
            }
        });
    });
}

export async function addMessage(message) {
    try {
        const ip = await getIP();
        const messageDocRef = doc(db, "data", "messages");
        const timestampKey = Date.now();

        await updateDoc(messageDocRef, {
            [timestampKey]: { "message": message, "ip": ip }
        });

        displayAlert("The wise one hears you.", AlertLevel.INFO, "The Jake Button", "icons/utopia_smiley.png");
    } catch (error) {
        displayError("Couldn't ask jake!");
    }
}

export async function getMessages() {
    try {
        const docRef = doc(db, "data", "messages");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return Object.entries(data).map(([timestamp, value]) => {
                const date = new Date(Number(timestamp));
                const formattedDate = date.toLocaleString();
                return {date: formattedDate, value: value};
            });
        } else {
            displayError("Database error, messages not found!")
            return [];
        }
    } catch (error) {
        displayError(`Error retrieving messages!\n ${error}`)
        return [];
    }
}

export function logoutUser() {
    signOut(auth);
}

// 1 hour timeout
const logoutTime = 3600000;
setTimeout(() => {
    signOut(auth)
}, logoutTime);

async function getIP() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip || "unknown";
    } catch (error) {
        return "unknown";
    }
}

async function getFavorites() {
    const user = auth.currentUser.email;

    try {
        const docRef = doc(db, "data", "messages");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return Object.entries(data).map(([timestamp, value]) => {
                const date = new Date(Number(timestamp));
                const formattedDate = date.toLocaleString();
                return {date: formattedDate, value: value};
            });
        } else {
            displayError("Database error, messages not found!")
            return [];
        }
    } catch (error) {
        displayError(`Error retrieving messages!\n${error}`)
        return [];
    }
}

export async function updateMessages(newMessages) {
    const objectData = newMessages.reduce((acc, entry) => {
        const timestamp = new Date(entry.date).getTime();
        acc[timestamp] = entry.value;
        return acc;
    }, {});

    try {
        const messageDocRef = doc(db, "data", "messages");
        await setDoc(messageDocRef, objectData);
    } catch (error) {
        console.log(error);
        displayError("Database error, failed to update messages!");
    }
}