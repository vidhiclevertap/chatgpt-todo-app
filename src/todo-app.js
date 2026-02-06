import {
  addTodo,
  toggleTodo,
  deleteTodo,
  getTodos
} from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.userEmail = null; // identity state
  }

  async connectedCallback() {
    const css = await fetch("../src/styles.css").then(res => res.text());
    this.render(css);
  }

  render(css) {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div id="app"></div>
    `;

    if (!this.userEmail) {
      this.renderLogin();
    } else {
      this.renderTodoApp();
    }
  }

  /* ---------------- LOGIN UI ---------------- */

  renderLogin() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h1>🔐 Login</h1>
      <p>Enter your email to continue</p>

      <div class="todo-input">
        <input
          id="emailInput"
          type="email"
          placeholder="you@example.com"
        />
        <button id="loginBtn">Continue</button>
      </div>
    `;

    this.shadowRoot
      .getElementById("loginBtn")
      .addEventListener("click", () => this.handleLogin());
  }

  handleLogin() {
    const emailInput = this.shadowRoot.getElementById("emailInput");
    const email = emailInput.value.trim();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    this.userEmail = email;

    // 🔗 CleverTap identity hook (will activate in Goal 2)
    /*
    clevertap.onUserLogin({
      Site: {
        Identity: email,
        Email: email
      }
    });

    clevertap.event.push("User Logged In");
    */

    this.render(await this.getCss());
  }

  /* ---------------- TODO UI ---------------- */

  async renderTodoApp() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h1>📝 Todo App</h1>
      <p class="user-info">Logged in as <b>${this.userEmail}</b></p>

      <div class="todo-input">
        <input id="todoInput" type="text" placeholder="Add a new task..." />
        <button id="addTodoBtn">Add</button>
      </div>

      <ul id="todoList"></ul>
    `;

    this.renderTodos();
    this.attachTodoEvents();
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";

    getTodos().forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = todo.completed ? "completed" : "";

      li.innerHTML = `
        <span>${todo.text}</span>
        <div>
          <button class="toggle" data-index="${index}">✔</button>
          <button class="delete" data-index="${index}">✖</button>
        </div>
      `;

      list.appendChild(li);
    });
  }

  attachTodoEvents() {
    this.shadowRoot
      .getElementById("addTodoBtn")
      .addEventListener("click", () => {
        const input = this.shadowRoot.getElementById("todoInput");
        const value = input.value.trim();
        if (!value) return;

        addTodo(value);

        // 🔗 CleverTap event hook (Goal 2)
        // clevertap.event.push("Todo Added", { task: value });

        input.value = "";
        this.renderTodos();
      });

    this.shadowRoot
      .getElementById("todoList")
      .addEventListener("click", (event) => {
        const index = event.target.dataset.index;
        if (index === undefined) return;

        if (event.target.classList.contains("toggle")) {
          toggleTodo(index);

          // clevertap.event.push("Todo Completed");
        }

        if (event.target.classList.contains("delete")) {
          deleteTodo(index);

          // clevertap.event.push("Todo Deleted");
        }

        this.renderTodos();
      });
  }

  /* ---------------- UTILS ---------------- */

  async getCss() {
    return fetch("/src/styles.css").then(res => res.text());
  }
}

customElements.define("todo-app", TodoApp);
