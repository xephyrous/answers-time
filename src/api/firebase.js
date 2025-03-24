import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {doc, getDoc, getFirestore, setDoc, updateDoc} from "firebase/firestore";
import {AlertLevel, displayAlert, displayError} from "../alerts.js";
import hash from "object-hash";

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

export async function addMessage(message, silent = false) {
    try {
        const ip = await getIP();
        const messageDocRef = doc(db, "data", "messages");
        const jsonObj = { "message": message, "ip": ip, "timestamp": Date.now() }

        await updateDoc(messageDocRef, {
            [hash(jsonObj)]: jsonObj
        });

        if (!silent) {
            displayAlert("The wise one hears you.", AlertLevel.INFO, "The Jake Button", "icons/utopia_smiley.png");
        }
    } catch (error) {
        if (!silent) {
            displayError("Couldn't ask jake!");
            return;
        }

        console.log(error);
    }
}

export async function getMessages() {
    try {
        const docRef = doc(db, "data", "messages");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return Object.entries(data).map(([hash, value]) => {
                const date = new Date(Number(value.timestamp));
                value.date = date.toLocaleString();
                return { hash: hash, value: value };
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

export async function updateMessages(newMessages) {
    const objectData = newMessages.reduce((acc, entry) => {
        acc[entry.hash] = {
            timestamp: entry.value.timestamp,
            ip: entry.value.ip,
            message: entry.value.message
        };
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

export function logoutUser() {
    signOut(auth);
}

async function getIP() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip || "unknown";
    } catch (error) {
        return "unknown";
    }
}

export async function getFavorites() {
    try {
        const userEmail = auth.currentUser.email;
        const docRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().favorites;
        } else {
            displayError("Database error, favorites not found!")
            return [];
        }
    } catch (error) {
        displayError(`Error retrieving favorites!\n${error}`)
        return [];
    }
}

export async function addFavorite(message) {
    try {
        const userEmail = auth.currentUser.email;
        const userDocRef = doc(db, "users", userEmail);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const currentFavorites = userData.favorites || [];

            await updateDoc(userDocRef, {
                favorites: [...currentFavorites, message.hash] // Append new item
            });
        } else {
            displayError("Database error, failed to add favorite!");
        }
    } catch (error) {
        displayError(`Database error, failed to add favorite!\n${error}`);
    }
}

export async function removeFavorite(message) {
    try {
        const userEmail = auth.currentUser.email;
        const userDocRef = doc(db, "users", userEmail);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const currentFavorites = userData.favorites || [];

            // Remove the given item (filter it out)
            const updatedFavorites = currentFavorites.filter(hash => hash !== message.hash);

            await updateDoc(userDocRef, {
                favorites: updatedFavorites
            });
        } else {
            displayError("Database error, failed to remove favorite!");
        }
    } catch (error) {
        displayError(`Database error, failed to remove favorite!\n${error}`);
    }
}

// 1 hour timeout
const logoutTime = 3600000;
setTimeout(() => {
    signOut(auth)
}, logoutTime);