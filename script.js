// Importar las funciones necesarias desde firebase-config.js
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, set, ref, push, remove, update, get } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
    // Agregar los event listeners
    document.getElementById("loginBtn")?.addEventListener("click", login);
    document.getElementById("registerBtn")?.addEventListener("click", register);
    document.getElementById("registerLink")?.addEventListener("click", () => {
        document.querySelector(".container").style.display = "none";
        document.getElementById("registerContainer").style.display = "block";
    });
    document.getElementById("loginLink")?.addEventListener("click", () => {
        document.getElementById("registerContainer").style.display = "none";
        document.querySelector(".container").style.display = "block";
    });

    // Cargar tareas cuando el usuario está logueado
    if (auth.currentUser) {
        loadUserTasks();
    }
});

// Función para agregar tarea
function addTask() {
    const taskText = document.getElementById("taskInput").value;
    if (taskText.trim() !== "") {
        const userId = auth.currentUser.uid;
        const timestamp = new Date().toLocaleString(); // Obtener la fecha y hora actual

        // Guardar tarea en la base de datos de Firebase bajo el usuario logueado
        const newTaskRef = push(ref(db, "users/" + userId + "/tasks"));
        set(newTaskRef, {
            task: taskText,
            timestamp: timestamp,
            status: "incomplete"
        })
        .then(() => {
            alert("✅ Tarea añadida con éxito!");
            document.getElementById("taskInput").value = ""; // Limpiar campo de entrada
            loadUserTasks(); // Cargar las tareas de nuevo
        })
        .catch(error => {
            alert("❌ Error al agregar tarea: " + error.message);
        });
    } else {
        alert("⚠️ La tarea no puede estar vacía.");
    }
}

// Función para cargar las tareas del usuario
function loadUserTasks() {
    const userId = auth.currentUser.uid;
    const tasksContainer = document.getElementById("tasksContainer");
    tasksContainer.innerHTML = ""; // Limpiar contenedor antes de cargar nuevas tareas

    // Obtener tareas del usuario desde Firebase
    const tasksRef = ref(db, "users/" + userId + "/tasks");
    get(tasksRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const tasks = snapshot.val();
                Object.keys(tasks).forEach(taskId => {
                    const task = tasks[taskId];
                    const taskElement = document.createElement("div");
                    taskElement.classList.add("task");

                    taskElement.innerHTML = `
                        <p><strong>📝 Tarea:</strong> ${task.task}</p>
                        <p><strong>⏰ Fecha y Hora:</strong> ${task.timestamp}</p>
                        <p><strong>Status:</strong> ${task.status}</p>
                        <button class="editBtn" onclick="editTask('${taskId}')">✏️ Editar</button>
                        <button class="deleteBtn" onclick="deleteTask('${taskId}')">🗑️ Borrar</button>
                        <button class="markDoneBtn" onclick="markTaskDone('${taskId}')">✅ Marcar como Hecho</button>
                    `;
                    tasksContainer.appendChild(taskElement);
                });
            } else {
                tasksContainer.innerHTML = "<p>No tienes tareas aún.</p>";
            }
        })
        .catch(error => {
            alert("❌ Error al cargar las tareas: " + error.message);
        });
}

// Función para editar tarea
function editTask(taskId) {
    const newTaskText = prompt("Edita tu tarea:");
    if (newTaskText) {
        const userId = auth.currentUser.uid;
        const taskRef = ref(db, "users/" + userId + "/tasks/" + taskId);
        update(taskRef, {
            task: newTaskText
        })
        .then(() => {
            alert("✅ Tarea actualizada!");
            loadUserTasks(); // Cargar las tareas de nuevo
        })
        .catch(error => {
            alert("❌ Error al editar tarea: " + error.message);
        });
    }
}

// Función para borrar tarea
function deleteTask(taskId) {
    const userId = auth.currentUser.uid;
    const taskRef = ref(db, "users/" + userId + "/tasks/" + taskId);
    remove(taskRef)
        .then(() => {
            alert("🗑️ Tarea borrada.");
            loadUserTasks(); // Cargar las tareas de nuevo
        })
        .catch(error => {
            alert("❌ Error al borrar tarea: " + error.message);
        });
}

// Función para marcar tarea como completada
function markTaskDone(taskId) {
    const userId = auth.currentUser.uid;
    const taskRef = ref(db, "users/" + userId + "/tasks/" + taskId);
    update(taskRef, {
        status: "completed"
    })
    .then(() => {
        alert("✅ Tarea marcada como completada!");
        loadUserTasks(); // Cargar las tareas de nuevo
    })
    .catch(error => {
        alert("❌ Error al actualizar estado de tarea: " + error.message);
    });
}

// Función para cerrar sesión
function logout() {
    auth.signOut().then(() => {
        alert("👋 Has cerrado sesión exitosamente!");
        window.location.href = "index.html";
    });
}

// Función para registrar el usuario
function register() {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (password.length < 6) {
        alert("⚠️ La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            set(ref(db, "users/" + user.uid), {
                email: email,
                role: email === "Luisgenial2004@gmail.com" ? "admin" : "user"
            })
            .then(() => {
                alert("🎉 ¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
                window.location.href = "index.html"; // Redirigir a la página de inicio de sesión
            })
            .catch(error => {
                alert("❌ Error al guardar datos en la base de datos: " + error.message);
            });
        })
        .catch(error => {
            alert("🚫 No se pudo crear la cuenta. Error: " + error.message);
        });
}

// Función para iniciar sesión
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            alert("🔑 ¡Inicio de sesión exitoso!");
            window.location.href = "tasks.html"; // Redirigir a la página de tareas
        })
        .catch(error => {
            alert("⚠️ Error al iniciar sesión: " + error.message);
        });
} 