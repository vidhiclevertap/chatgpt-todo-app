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
    this.userEmail = null;
  }

  async connectedCallback() {
    try {
      const css = await fetch(
        new URL("./styles.css", import.meta.url)
      ).then(res => res.text());

      this.render(css);
    } catch (err) {
      console.error("Failed to load Todo App", err);
    }
  }

  render(css) {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div id="app"></div>
    `;

    if (!this.userEmail) {
      this.renderLogin();
    } else {
      this.renderTodo();
    }
  }

  renderLogin() {
    const app = this.shadowRoot.getElementById("app");
    app.innerHTML = `
      <h1>🔐 Login</h1>
      <input id="emailInput" type="email" placeholder="you@example.com" />
      <button id="loginBtn">Continue</button>
    `;

    this.shadowRoot
      .getElementById("loginBtn")
      .addEventListener("click", () => {
        const email = this.shadowRoot
          .getElementById("emailInput")
          .value.trim();

        if (!email.includes("@")) {
          alert("Enter a valid email");
          return;
        }

        this.userEmail = email;
        this.render(css);
      });
  }

  renderTodo() {
    const app = this.shadowRoot.getElementById("app");
    app.innerHTML = `
      <h1>📝 Todo App</h1>
      <p>Logged in as ${this.userEmail}</p>
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
        input.value = "";
        this.renderTodos();
      });
  }

  renderTodos() {
    const list = this.shadowRoot.getElementById("todoList");
    list.innerHTML = "";
    getTodos().forEach((todo, i) => {
      const li = document.createElement("li");
      li.textContent = todo.text;
      list.appendChild(li);
    });
  }
}

customElements.define("todo-app", TodoApp);
