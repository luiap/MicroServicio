// Importar los módulos necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, push, remove, update, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";  // Añadir 'update'

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDXmxA2YsiXzpL9zbBkqO_A_VRJjEF_qLs",
    authDomain: "miniproyecto-53d5d.firebaseapp.com",
    databaseURL: "https://miniproyecto-53d5d-default-rtdb.firebaseio.com",
    projectId: "miniproyecto-53d5d",
    storageBucket: "miniproyecto-53d5d.firebasestorage.app",
    messagingSenderId: "1007638190701",
    appId: "1:1007638190701:web:f1e0222efa8452afcabd64",
    measurementId: "G-JT7BJHJ9JM"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth y Database
const auth = getAuth(app);
const db = getDatabase(app);

// Exporta para usar en otros archivos
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, set, ref, push, remove, update, get };  // Exporta 'update'
