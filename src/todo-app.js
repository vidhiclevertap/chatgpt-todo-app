import { addTodo, getTodos } from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.userEmail = null;
    this.css = "";

    this.clevertap = null;
    this.popupTriggered = false;
    this.nativeRendered = false;
  }

  /* ---------- INIT ---------- */

  async connectedCallback() {
    try {
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(r => r.text());

      this.clevertap = await this.loadCleverTap();

      // ✅ ALWAYS render login first
      this.render();
    } catch (e) {
      console.error("Init failed", e);
    }
  }

  /* ---------- CLEVERTAP ---------- */

  loadCleverTap() {
    return new Promise(resolve => {
      if (window.clevertap) {
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

      window.clevertap.notifications.push({ webPush: false });
      window.clevertap.account.push({ id: "848-6W6-WR7Z" });

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

    this.userEmail ? this.renderTodo() : this.renderLogin();
  }

  /* ---------- LOGIN ---------- */

  renderLogin() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h2>🔐 Login</h2>
      <input id="email" placeholder="you@example.com" />
      <button id="login">Continue</button>
    `;

    this.shadowRoot
      .getElementById("login")
      .onclick = () => this.handleLogin();
  }

  handleLogin() {
    const email = this.shadowRoot
      .getElementById("email")
      .value.trim();

    if (!email.includes("@")) return;

    this.userEmail = email;

    // ✅ Identify user
    this.clevertap.onUserLogin.push({
      Site: { Identity: email, Email: email }
    });

    this.clevertap.event.push("User Logged In");

    // ✅ Render Todo UI (creates native-card div)
    this.render();

    // ✅ Register native AFTER SDK + DOM exist
    this.registerNativeListener();

    // ✅ Fetch native display
    this.clevertap.getAllNativeDisplay();
  }

  /* ---------- NATIVE DISPLAY ---------- */

  registerNativeListener() {
    if (this.nativeRendered) return;
    if (!this.clevertap.on) return;

    this.clevertap.on("native_display", payload => {
      if (!payload || !payload.length) return;

      const card = payload[0];
      const slot = this.shadowRoot.getElementById("native-card");
      if (!slot) return;

      slot.innerHTML = `
        <div style="
          background:#f8f8f8;
          border:1px solid #ddd;
          padding:12px;
          border-radius:8px;
          margin-bottom:16px;
        ">
          <strong>${card.title || ""}</strong>
          <p>${card.message || ""}</p>
        </div>
      `;

      this.nativeRendered = true;
    });
  }

  /* ---------- TODO ---------- */

  renderTodo() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h2>📝 Todo</h2>

      <p style="color:#666;">
        Logged in as <b>${this.userEmail}</b>
      </p>

      <!-- Native Display Slot -->
      <div id="native-card"></div>

      <input id="todo" placeholder="New task" />
      <button id="add">Add</button>

      <ul id="list"></ul>
    `;

    this.renderTodos();

    this.shadowRoot
      .getElementById("add")
      .onclick = () => this.handleAddTodo();
  }

  handleAddTodo() {
    const input = this.shadowRoot.getElementById("todo");
    const value = input.value.trim();
    if (!value) return;

    addTodo(value);
    this.renderTodos();

    this.clevertap.event.push("Todo Added");

    // 🔔 Web Popup (once)
    if (!this.popupTriggered) {
      this.clevertap.event.push("Todo Created Popup Trigger");
      this.popupTriggered = true;
    }

    input.value = "";
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("list");
    list.innerHTML = "";

    getTodos().forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.text;
      list.appendChild(li);
    });
  }
}

customElements.define("todo-app", TodoApp);
