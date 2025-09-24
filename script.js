const inputBox = document.getElementById("input-box");
const taskDate = document.getElementById("task-date");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

//New user sign up function
function signUp() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  // checking if username already exists in our localStorage
  if (localStorage.getItem("user_" + username)) {
    alert("Username already exists");
    return;
  }

  // saving the new user with empty task list 
  localStorage.setItem(
    "user_" + username,
    JSON.stringify({ password, tasks: [] })
  );

  //storing the new user globally
  //helps us with the auto-login(no need to sign in again)
  window.currentUser = username;

  //hiding auth form and showing todo list
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("todo-container").style.display = "block";

  loadTasks();   //since the user is new its loads the empty task list
  alert(`Welcome ${username}! Your account has been created!`);
}

//user sign-in (for existing user)
function signIn() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const userData = JSON.parse(localStorage.getItem("user_" + username));

  //mathcing the username and password
  if (!userData || userData.password !== password) {
    alert("Username/Password is incorrect!");
    return;
  }

  //storin current user globally as well
  window.currentUser = username;

  document.getElementById("auth-container").style.display = "none";
  document.getElementById("todo-container").style.display = "block";

  loadTasks();    //this time it loads the users old saved tasks
  alert(`Welcome back, ${username}!`);
}

//logout function for exiting
//useful becuase other new/old users can log back in without refreshing the page every time
function logout() {
      //checking if there is at leats one user logged in at the time
    if (!window.currentUser) {
        alert("You are not signed in!");
        return; // stopping function if no user is logged in
    }

    window.currentUser = null;

    document.getElementById("todo-container").style.display = "none";
    document.getElementById("auth-container").style.display = "block";

    listContainer.innerHTML = "";  // clearing the current session; all previous tasks cleared

    updateCounters();  //resetting counters

    alert("You have been logged out successfully!");
}


//saving tasks to storage for the current user
function saveTasks() {
  if (!window.currentUser) return; // only save if logged in

  const tasks = [];
  document.querySelectorAll("#list-container li").forEach((li) => {
    tasks.push({
      text: li.querySelector("span").textContent,
      completed: li.classList.contains("completed"),
      date: li.dataset.date || "",
    });
  });

  const userData = JSON.parse(
    localStorage.getItem("user_" + window.currentUser)
  );
  userData.tasks = tasks;
  localStorage.setItem(
    "user_" + window.currentUser,
    JSON.stringify(userData)
  );
}

//Loading tasks for the current user
function loadTasks() {
  const userData = JSON.parse(
    localStorage.getItem("user_" + window.currentUser)
  );
  listContainer.innerHTML = "";  //clearing the task list of current user before laoding new tasks

  userData.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.date = task.date || "";
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span>${task.text}</span>
        <small>${task.date ? ` | Due: ${task.date}` : ""}</small>
      </label>
      <span class="edit-btn">Edit</span>
      <span class="delete-btn">Delete</span>
    `;
    if (task.completed) li.classList.add("completed");  //if the task is added succesfully, add the the completed class for styling

	//selcting the checkbox, edit&delete button and span
    const checkbox = li.querySelector("input[type='checkbox']");
    const editBtn = li.querySelector(".edit-btn");
    const taskSpan = li.querySelector("span");
    const deleteBtn = li.querySelector(".delete-btn");

	//toggle completed class and save updated tasks
    checkbox.addEventListener("click", () => {
      li.classList.toggle("completed", checkbox.checked);
      updateCounters();
      saveTasks();
    });

	//rest completed status if edited saved updated tasks
    editBtn.addEventListener("click", () => {
      const update = prompt("Edit task:", taskSpan.textContent);
      if (update !== null) {
        taskSpan.textContent = update;
        li.classList.remove("completed");
        checkbox.checked = false;
        updateCounters();
        saveTasks();
      }
    });

	//remove the task
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this task?")) {
        li.remove();
        updateCounters();
        saveTasks();
      }
    });

    listContainer.appendChild(li);
  });

  sortTasksByDate();
  updateCounters();
}

//updating completed and incomplete task counters
function updateCounters() {
  const completedTasks = document.querySelectorAll(".completed").length;
  const uncompletedTasks = document.querySelectorAll("li:not(.completed)").length;
  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
}

function addTask() {
  const task = inputBox.value.trim();
  const date = taskDate.value;
  if (!task) {  //validation
    alert("Please write down a task");
    return;
  }

  //creating new task item
  const li = document.createElement("li");
  li.innerHTML = `
    <label>
      <input type="checkbox">
      <span>${task}</span>
      <small>${date ? ` | Due: ${date}` : ''}</small>
    </label>
    <span class="edit-btn">Edit</span>
    <span class="delete-btn">Delete</span>
  `;
  li.dataset.date = date;

  listContainer.appendChild(li);
  //clear input fields
  inputBox.value = "";
  taskDate.value = "";

  const checkbox = li.querySelector("input[type='checkbox']");
  const editBtn = li.querySelector(".edit-btn");
  const taskSpan = li.querySelector("span");
  const deleteBtn = li.querySelector(".delete-btn");

  //checkbox toggle; marking task and completed or incomplete and save
  checkbox.addEventListener("click", () => {
    li.classList.toggle("completed", checkbox.checked);
    updateCounters();
    saveTasks();
  });

  //edit task
  editBtn.addEventListener("click", () => {
    const update = prompt("Edit task:", taskSpan.textContent);
    if (update !== null) {
      taskSpan.textContent = update;
      li.classList.remove("completed");
      checkbox.checked = false;
      updateCounters();
      saveTasks();
    }
  });

  //delete task
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      li.remove();
      updateCounters();
      saveTasks();
    }
  });

  //sorting tasks by date and updating counters
  sortTasksByDate();
  updateCounters();
  saveTasks();
}

function sortTasksByDate() {
  const tasks = Array.from(listContainer.children);
  tasks.sort((a, b) => {
    if (!a.dataset.date) return 1;
    if (!b.dataset.date) return -1;
    return new Date(a.dataset.date) - new Date(b.dataset.date);
  });
  tasks.forEach(task => listContainer.appendChild(task));
}

//filtering tasks; all tasks, active and completed
function filterTasks(status) {
  const tasks = listContainer.children;
  for (let task of tasks) {
    switch(status) {
      case 'all':
        task.style.display = '';
        break;
      case 'active':
        task.style.display = task.classList.contains('completed') ? 'none' : '';
        break;
      case 'completed':
        task.style.display = task.classList.contains('completed') ? '' : 'none';
        break;
    }
  }
}

