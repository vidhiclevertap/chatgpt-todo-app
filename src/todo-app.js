import { addTodo, getTodos } from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.userEmail = null;
    this.css = "";

    // CleverTap
    this.clevertap = null;
    this.ctInitialized = false;

    // Popup guard
    this.popupTriggered = false;
  }

  /* ---------- INIT ---------- */

  async connectedCallback() {
    try {
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(res => res.text());

      this.clevertap = await this.loadCleverTap();
      this.ctInitialized = true;

      // ✅ Native Display setup
      this.createNativeDisplayContainer();
      this.listenForNativeDisplay();

      this.render();
    } catch (e) {
      console.error("Todo App init failed", e);
    }
  }

  /* ---------- CLEVERTAP LOADER ---------- */

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
        region: "us1",
        enableWebNativeDisplay: true
      };

      window.clevertap.notifications.push({
        webPush: false
      });

      window.clevertap.account.push({
        id: "848-6W6-WR7Z"
      });

      const s = document.createElement("script");
      s.async = true;
      s.src =
        "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js";

      s.onload = () => {
        resolve(window.clevertap);
      };

      document.head.appendChild(s);
    });
  }

  /* ---------- NATIVE DISPLAY ---------- */

  createNativeDisplayContainer() {
    if (document.querySelector(".native-card")) return;

    const div = document.createElement("div");
    div.className = "native-card";
    div.style.margin = "16px";
    div.style.minHeight = "200px";

    // Important: Native Display must be OUTSIDE shadow DOM
    document.body.prepend(div);
  }

  listenForNativeDisplay() {
    this.clevertap.on("native_display", data => {
      if (!data || !data.length) return;

      const unit = data[0];
      const container = document.querySelector(".native-card");
      if (!container) return;

      container.innerHTML = `
        <img src="${unit.content.imageUrl}" style="max-width:100%" />
      `;

      // Impression tracking
      this.clevertap.renderNotificationViewed(unit);
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

    if (!email || !email.includes("@")) return;

    this.userEmail = email;

    if (this.ctInitialized) {
      this.clevertap.onUserLogin.push({
        Site: {
          Identity: email,
          Email: email
        }
      });

      this.clevertap.event.push("User Logged In");

      // ✅ Fetch Native Display AFTER login
      this.clevertap.getAllNativeDisplay();
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
      .addEventListener("click", () => this.handleAddTodo());
  }

  handleAddTodo() {
    const input = this.shadowRoot.getElementById("todoInput");
    const value = input.value.trim();
    if (!value) return;

    addTodo(value);

    // Analytics
    this.clevertap?.event.push("Todo Added", {
      task: value
    });

    // Web Popup trigger (once)
    if (!this.popupTriggered) {
      this.clevertap?.event.push("Todo Created Popup Trigger");
      this.popupTriggered = true;
    }

    input.value = "";
    this.renderTodos();
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";

    getTodos().forEach(todo => {
      const li = document.createElement("li");
      li.textContent = todo.text;
      list.appendChild(li);
    });
  }
}

customElements.define("todo-app", TodoApp);
