// Importar las funciones necesarias desde firebase-config.js
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, set, ref, push, remove, update, get } from "./firebase-config.js";

// Escuchar el evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    // Agregar los event listeners
    document.getElementById("addTaskBtn")?.addEventListener("click", addTask);
    document.getElementById("logoutBtn")?.addEventListener("click", logout);

    // Cargar tareas cuando el usuario está logueado
    if (auth.currentUser) {
        loadUserTasks();
        checkUserRole(auth.currentUser.uid);  // Verifica si es admin
    }

    // Escuchar los cambios de autenticación
    auth.onAuthStateChanged(user => {
        if (user) {
            loadUserTasks();
            checkUserRole(user.uid);  // Verifica si es admin
        }
    });
});

// Función para agregar tarea
function addTask() {
    const taskText = document.getElementById("taskInput").value;
    
    // Validar que haya texto
    if (taskText.trim() === "") {
        alert("⚠️ Por favor, escribe una tarea antes de agregarla.");
        return;
    }

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
                // Ordenar las tareas del más reciente al más antiguo
                const taskIds = Object.keys(tasks).sort((a, b) => {
                    return new Date(tasks[b].timestamp) - new Date(tasks[a].timestamp);
                });
                taskIds.forEach(taskId => {
                    const task = tasks[taskId];
                    const taskElement = document.createElement("div");
                    taskElement.classList.add("task");
                    taskElement.setAttribute('data-task-id', taskId);  // Añadir el ID de la tarea para usarlo más tarde

                    // Si la tarea está completada, mostrar el texto y ocultar los botones
                    const taskStatus = task.status === "complete" ? `
                        <p class="completedText">Completado</p>
                    ` : `
                        <button class="editBtn">✏️ Editar</button>
                        <button class="deleteBtn">🗑️ Borrar</button>
                        <button class="markDoneBtn">✅ Marcar como Hecho</button>
                    `;

                    taskElement.innerHTML = `
                        <p><strong>📝 Tarea:</strong> ${task.task}</p>
                        <p><strong>⏰ Fecha y Hora:</strong> ${task.timestamp}</p>
                        <p><strong>Status:</strong> ${task.status}</p>
                        ${taskStatus}
                    `;

                    // Agregar los event listeners para los botones
                    if (task.status !== "complete") {
                        taskElement.querySelector('.editBtn').addEventListener('click', () => editTask(taskId));
                        taskElement.querySelector('.deleteBtn').addEventListener('click', () => deleteTask(taskId));
                        taskElement.querySelector('.markDoneBtn').addEventListener('click', () => markTaskDone(taskId));
                    }

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

// Función para verificar si el usuario es admin
function checkUserRole(userId) {
    const userRef = ref(db, "users/" + userId);
    get(userRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.role === "admin") {
                    loadAllUserTasks();  // Cargar tareas de todos los usuarios si es admin
                }
            }
        })
        .catch(error => {
            alert("❌ Error al verificar el rol del usuario: " + error.message);
        });
}

// Función para cargar tareas de todos los usuarios si el usuario es admin
function loadAllUserTasks() {
    const tasksContainer = document.getElementById("tasksContainer");
    tasksContainer.innerHTML = ""; // Limpiar contenedor antes de cargar todas las tareas

    const usersRef = ref(db, "users");
    get(usersRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                Object.keys(users).forEach(userId => {
                    if (users[userId].role !== "admin") {  // Excluir al usuario admin
                        const userTasksRef = ref(db, "users/" + userId + "/tasks");
                        get(userTasksRef)
                            .then(taskSnapshot => {
                                if (taskSnapshot.exists()) {
                                    const tasks = taskSnapshot.val();
                                    const userTasksContainer = document.createElement("div");
                                    userTasksContainer.classList.add("userTasks");

                                    userTasksContainer.innerHTML = `<h3>Tareas de ${users[userId].email}</h3>`;
                                    Object.keys(tasks).forEach(taskId => {
                                        const task = tasks[taskId];
                                        const taskElement = document.createElement("div");
                                        taskElement.classList.add("task");

                                        const taskStatus = task.status === "complete" ? `
                                            <p class="completedText">Completado</p>
                                        ` : `
                                            <button class="editBtn">✏️ Editar</button>
                                            <button class="deleteBtn">🗑️ Borrar</button>
                                            <button class="markDoneBtn">✅ Marcar como Hecho</button>
                                        `;

                                        taskElement.innerHTML = `
                                            <p><strong>📝 Tarea:</strong> ${task.task}</p>
                                            <p><strong>⏰ Fecha y Hora:</strong> ${task.timestamp}</p>
                                            <p><strong>Status:</strong> ${task.status}</p>
                                            ${taskStatus}
                                        `;

                                        userTasksContainer.appendChild(taskElement);
                                    });
                                    tasksContainer.appendChild(userTasksContainer);
                                }
                            })
                            .catch(error => {
                                alert("❌ Error al cargar las tareas de los usuarios: " + error.message);
                            });
                    }
                });
            }
        })
        .catch(error => {
            alert("❌ Error al cargar usuarios: " + error.message);
        });
}

// Función para marcar tarea como completada
function markTaskDone(taskId) {
    const userId = auth.currentUser.uid;
    const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);

    update(taskRef, {
        status: "complete"
    }).then(() => {
        loadUserTasks(); // Recargar las tareas después de marcarla
        alert("✅ Tarea marcada como completada!");
    }).catch((error) => {
        alert("❌ Error al marcar la tarea como completada: " + error.message);
    });
}

// Función para eliminar tarea
function deleteTask(taskId) {
    const userId = auth.currentUser.uid;
    const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);

    remove(taskRef).then(() => {
        loadUserTasks(); // Recargar las tareas después de eliminarla
        alert("🗑️ Tarea eliminada!");
    }).catch((error) => {
        alert("❌ Error al eliminar la tarea: " + error.message);
    });
}

// Función para editar tarea
function editTask(taskId) {
    const userId = auth.currentUser.uid;
    const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);

    const newTaskText = prompt("Edita tu tarea:");
    if (newTaskText && newTaskText.trim() !== "") {
        update(taskRef, {
            task: newTaskText
        }).then(() => {
            loadUserTasks(); // Recargar las tareas después de editar
            alert("✏️ Tarea editada con éxito!");
        }).catch((error) => {
            alert("❌ Error al editar la tarea: " + error.message);
        });
    } else {
        alert("⚠️ Por favor, ingresa un texto válido para la tarea.");
    }
}

// Función para cerrar sesión
function logout() {
    auth.signOut().then(() => {
        alert("👋 Has cerrado sesión exitosamente!");
        window.location.href = "index.html";
    });
}





