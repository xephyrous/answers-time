import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {doc, getDoc, getFirestore, updateDoc} from "firebase/firestore";
import {AlertLevel, displayAlert} from "../alerts.js";

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
                console.error("User not found");
                return;
            }

            const userData = userDoc.data();

            if (userData.password !== password) {
                console.error("Incorrect password");
                return;
            }

            if (user) {
                if (userData.role !== "admin") {
                    console.error("User is not an admin");
                    return;
                }

                window.location = "/projects/answers-time/admin-panel/index.html";
            } else {
                console.error("Error: User authentication failed.");
            }
        });

    } catch (error) {
        console.error("Error during admin login:", error);
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
                console.error("Error checking admin role:", error);
                window.location.href = "/projects/answers-time/admin-panel/index.html";
                reject(error);
            }
        });
    });
}

export async function addMessage(message) {
    try {
        const messageDocRef = doc(db, "data", "messages");
        const timestampKey = Date.now();

        await updateDoc(messageDocRef, {
            [timestampKey]: message
        });

        displayAlert("The wise one hears you.", AlertLevel.INFO, "The Jake Button", "icons/utopia_smiley.png");
    } catch (error) {
        displayAlert("Couldn't ask jake!", AlertLevel.ERROR);
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
            console.log("No messages document!");
            return [];
        }
    } catch (error) {
        console.error("Error retrieving messages:", error);
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