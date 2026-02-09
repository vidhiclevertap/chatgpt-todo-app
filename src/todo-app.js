import {
  addTodo,
  getTodos
} from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.userEmail = null;
    this.css = "";

    this.clevertap = null;
    this.ctInitialized = false;
  }

  async connectedCallback() {
    try {
      // Load CSS
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(res => res.text());

      // Render UI FIRST (never block UI)
      this.render();

      // Load CleverTap async
      this.clevertap = await this.loadCleverTap();
      this.ctInitialized = true;

      // Setup Native Display AFTER CT loads
      this.setupNativeDisplay();

    } catch (e) {
      console.error("Init failed", e);
      this.render(); // still render UI
    }
  }

  /* ---------- CLEVERTAP ---------- */

  loadCleverTap() {
    return new Promise(resolve => {
      if (window.clevertap?.account?.length) {
        return resolve(window.clevertap);
      }

      window.clevertap = {
        event: [],
        profile: [],
        account: [],
        onUserLogin: [],
        notifications: [],
        privacy: [],
        region: "us1"
      };

      window.clevertap.account.push({
        id: "848-6W6-WR7Z"
      });

      const s = document.createElement("script");
      s.async = true;
      s.src =
        "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js";

      s.onload = () => resolve(window.clevertap);
      document.head.appendChild(s);
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
      <input id="emailInput" type="email" placeholder="you@example.com" />
      <button id="loginBtn">Continue</button>
    `;

    this.shadowRoot
      .getElementById("loginBtn")
      .addEventListener("click", () => this.handleLogin());
  }

  handleLogin() {
    const email = this.shadowRoot
      .getElementById("emailInput")
      .value.trim();

    if (!email) return;

    this.userEmail = email;

    if (this.ctInitialized) {
      this.clevertap.onUserLogin.push({
        Site: { Identity: email, Email: email }
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
      <button id="addTodoBtn">Add</button>

      <ul id="todoList"></ul>
    `;

    this.renderTodos();

    this.shadowRoot
      .getElementById("addTodoBtn")
      .addEventListener("click", () => {
        const input = this.shadowRoot.getElementById("todoInput");
        if (!input.value) return;

        addTodo(input.value);

        if (this.ctInitialized) {
          this.clevertap.event.push("Todo Added", {
            task: input.value
          });
        }

        input.value = "";
        this.renderTodos();
      });
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";

    getTodos().forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.text;
      list.appendChild(li);
    });
  }

  /* ---------- NATIVE DISPLAY (SAFE ADD-ON) ---------- */

  setupNativeDisplay() {
    // Create container OUTSIDE shadow DOM
    if (!document.querySelector(".native-card")) {
      const div = document.createElement("div");
      div.className = "native-card";
      div.style.minHeight = "400px";
      div.style.margin = "16px";
      document.body.prepend(div);
    }

    // Listen for Native Display
    this.clevertap.on("native_display", data => {
      if (!data || !data.length) return;

      const unit = data[0];
      const container = document.querySelector(".native-card");
      if (!container) return;

      container.innerHTML = `
        <img src="${unit.content.imageUrl}" style="max-width:100%" />
      `;

      this.clevertap.renderNotificationViewed(unit);
    });

    // Fetch campaigns
    this.clevertap.getAllNativeDisplay();
  }
}

customElements.define("todo-app", TodoApp);
import {
  addTodo,
  getTodos
} from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.userEmail = null;
    this.css = "";

    this.clevertap = null;
    this.ctInitialized = false;
  }

  async connectedCallback() {
    try {
      // Load CSS
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(res => res.text());

      // Render UI FIRST (never block UI)
      this.render();

      // Load CleverTap async
      this.clevertap = await this.loadCleverTap();
      this.ctInitialized = true;

      // Setup Native Display AFTER CT loads
      this.setupNativeDisplay();

    } catch (e) {
      console.error("Init failed", e);
      this.render(); // still render UI
    }
  }

  /* ---------- CLEVERTAP ---------- */

  loadCleverTap() {
    return new Promise(resolve => {
      if (window.clevertap?.account?.length) {
        return resolve(window.clevertap);
      }

      window.clevertap = {
        event: [],
        profile: [],
        account: [],
        onUserLogin: [],
        notifications: [],
        privacy: [],
        region: "us1"
      };

      window.clevertap.account.push({
        id: "848-6W6-WR7Z"
      });

      const s = document.createElement("script");
      s.async = true;
      s.src =
        "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js";

      s.onload = () => resolve(window.clevertap);
      document.head.appendChild(s);
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
      <input id="emailInput" type="email" placeholder="you@example.com" />
      <button id="loginBtn">Continue</button>
    `;

    this.shadowRoot
      .getElementById("loginBtn")
      .addEventListener("click", () => this.handleLogin());
  }

  handleLogin() {
    const email = this.shadowRoot
      .getElementById("emailInput")
      .value.trim();

    if (!email) return;

    this.userEmail = email;

    if (this.ctInitialized) {
      this.clevertap.onUserLogin.push({
        Site: { Identity: email, Email: email }
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
      <button id="addTodoBtn">Add</button>

      <ul id="todoList"></ul>
    `;

    this.renderTodos();

    this.shadowRoot
      .getElementById("addTodoBtn")
      .addEventListener("click", () => {
        const input = this.shadowRoot.getElementById("todoInput");
        if (!input.value) return;

        addTodo(input.value);

        if (this.ctInitialized) {
          this.clevertap.event.push("Todo Added", {
            task: input.value
          });
        }

        input.value = "";
        this.renderTodos();
      });
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";

    getTodos().forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.text;
      list.appendChild(li);
    });
  }

  /* ---------- NATIVE DISPLAY (SAFE ADD-ON) ---------- */

  setupNativeDisplay() {
    // Create container OUTSIDE shadow DOM
    if (!document.querySelector(".native-card")) {
      const div = document.createElement("div");
      div.className = "native-card";
      div.style.minHeight = "400px";
      div.style.margin = "16px";
      document.body.prepend(div);
    }

    // Listen for Native Display
    this.clevertap.on("native_display", data => {
      if (!data || !data.length) return;

      const unit = data[0];
      const container = document.querySelector(".native-card");
      if (!container) return;

      container.innerHTML = `
        <img src="${unit.content.imageUrl}" style="max-width:100%" />
      `;

      this.clevertap.renderNotificationViewed(unit);
    });

    // Fetch campaigns
    this.clevertap.getAllNativeDisplay();
  }
}

customElements.define("todo-app", TodoApp);
