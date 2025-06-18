import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { renderMetricsScreen, renderStatusScreen } from './ui.js';

let currentUser = null;

// Prologue sequence handler
document.getElementById('prologue-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const input = e.target.value.toLowerCase().trim();
        if (input === "i'm ready") {
            renderMetricsScreen();
        }
    }
});

// Sign up new users
async function signUp(email, password, userData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        return userCredential.user;
    } catch (error) {
        console.error("Sign up error:", error);
        alert(`Sign up failed: ${error.message}`);
    }
}

// Sign in existing users
async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Sign in error:", error);
        alert(`Sign in failed: ${error.message}`);
    }
}

// Handle auth state changes
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        loadUserData(user.uid);
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
});

// Load user data from Firestore
async function loadUserData(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.performance) {
            renderStatusScreen(userData);
        } else {
            renderMetricsScreen(userData);
        }
    }
}

export { signUp, signIn, currentUser };
