import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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

export async function checkAdmin() {
    console.log(auth);
    const user = auth.currentUser;
    if (!user) {
        window.location.href = "/projects/answers-time/index.html";
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.email); // Assuming the document ID is email
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            window.location.href = "/projects/answers-time/index.html";
            return;
        }

        const userData = userDoc.data();
        if (userData.role !== "admin") {
            window.location.href = "/projects/answers-time/index.html";
            // TODO : Make jail page
            return;
        }

        window.location.href = "/projects/answers-time/index.html";
    } catch (error) {

        console.log(error);
        window.location.href = "/projects/answers-time/admin-panel/index.html";
    }
}

export async function addMessage(message) {
    try {
        const messageDocRef = doc(db, "data", "messages");
        const timestampKey = Date.now();

        await updateDoc(messageDocRef, {
            [timestampKey]: message
        });

        alert("The wise one hears you.")
    } catch (error) {
        alert("Couldn't ask jake!");
    }
}

// Logout after leaving site
window.addEventListener("beforeunload", () => { signOut(auth) });

// 1 hour timeout
const logoutTime = 3600000;
setTimeout(() => {
    signOut(auth)
}, logoutTime);