import { addTodo, getTodos } from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.userEmail = null;
    this.css = "";

    this.clevertap = null;
    this.popupTriggered = false;
  }

  /* ---------- INIT ---------- */

  async connectedCallback() {
    try {
      this.css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(r => r.text());

      this.clevertap = await this.loadCleverTap();

      // ✅ Always render login
      this.render();
    } catch (e) {
      console.error("Init failed", e);
    }
  }

  /* ---------- CLEVERTAP ---------- */

  loadCleverTap() {
    return new Promise(resolve => {
      if (window.clevertap) return resolve(window.clevertap);

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

  /* ---------- NATIVE DISPLAY (LIGHT DOM) ---------- */

  createNativeSlot() {
    if (document.querySelector(".native-card")) return;

    const slot = document.createElement("div");
    slot.className = "native-card";
    slot.style.maxWidth = "800px";
    slot.style.margin = "16px auto";

    // Insert ABOVE the app
    document.body.insertBefore(slot, document.body.firstChild);
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

    // ✅ Create Native Display container (LIGHT DOM)
    this.createNativeSlot();

    // ✅ Render Todo UI
    this.render();

    // ✅ Fetch Native Display AFTER identity + DOM
    setTimeout(() => {
      this.clevertap.getAllNativeDisplay();
    }, 300);
  }

  /* ---------- TODO ---------- */

  renderTodo() {
    const app = this.shadowRoot.getElementById("app");

    app.innerHTML = `
      <h2>📝 Todo</h2>

      <p style="color:#666;">
        Logged in as <b>${this.userEmail}</b>
      </p>

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

  // ✅ Single event → triggers popup + analytics
  this.clevertap.event.push("Todo Added");

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
