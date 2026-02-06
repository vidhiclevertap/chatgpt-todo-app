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

    // App state
    this.userEmail = null;
    this.css = "";

    // CleverTap state
    this.clevertap = null;
    this.ctInitialized = false;
  }

  /* ---------- LIFECYCLE ---------- */

  async connectedCallback() {
    try {
      // Load CSS (shadow-DOM safe)
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(res => res.text());

      // Load CleverTap SDK
      this.clevertap = await this.loadCleverTap();

      // Initialize CleverTap account
      this.clevertap.account.push({
        id: "848-6W6-WR7Z" // 👈 replace this
      });

      this.ctInitialized = true;

      this.render();
    } catch (err) {
      console.error("Todo App initialization failed", err);
    }
  }

  /* ---------- CLEVERTAP LOADER ---------- */

  loadCleverTap() {
  return new Promise((resolve) => {
    if (window.clevertap) {
      return resolve(window.clevertap);
    }

    window.clevertap = {
      event: [],
      profile: [],
      account: [],
      onUserLogin: []
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://static.clevertap.com/js/a.js";

    script.onload = () => resolve(window.clevertap);
    document.head.appendChild(script);
  });
}



  /* ---------- RENDER ---------- */

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.css}</style>
      <div id="app"></div>
    `;

    if (!this.userEmail) {
      this.renderLogin();
    } else {
      this.renderTodo();
    }
  }

  /* ---------- LOGIN ---------- */

  renderLogin() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h1>🔐 Login</h1>
      <p>Enter your email to continue</p>
      <input id="emailInput" type="email" placeholder="you@example.com" />
      <button id="loginBtn" type="button">Continue</button>
    `;

    this.shadowRoot
      .getElementById("loginBtn")
      .addEventListener("click", () => this.handleLogin());
  }

  handleLogin() {
    const email = this.shadowRoot
      .getElementById("emailInput")
      .value.trim();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    this.userEmail = email;

    // 🔗 CleverTap identity + login event
    if (this.ctInitialized && this.clevertap) {
      this.clevertap.onUserLogin.push({
        Site: {
          Identity: email,
          Email: email
        }
      });

      this.clevertap.event.push("User Logged In");
    }

    this.render();
  }

  /* ---------- TODO ---------- */

  renderTodo() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h1>📝 Todo App</h1>
      <p>Logged in as <b>${this.userEmail}</b></p>

      <input id="todoInput" placeholder="Add task" />
      <button id="addTodoBtn" type="button">Add</button>

      <ul id="todoList"></ul>
    `;

    this.renderTodos();

    this.shadowRoot
      .getElementById("addTodoBtn")
      .addEventListener("click", () => {
        const input = this.shadowRoot.getElementById("todoInput");
        const value = input.value.trim();
        if (!value) return;

        addTodo(value);

        // 🔗 CleverTap event
        this.clevertap?.event.push("Todo Added", {
          task: value
        });

        input.value = "";
        this.renderTodos();
      });
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";

    getTodos().forEach((todo, index) => {
      const li = document.createElement("li");
      li.textContent = todo.text;
      list.appendChild(li);
    });
  }
}

customElements.define("todo-app", TodoApp);
