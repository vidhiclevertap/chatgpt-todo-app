import { addTodo, toggleTodo, deleteTodo, getTodos } from "./todo-store.js";

class TodoApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import "./styles.css";
      </style>

      <div id="app">
        <h1>📝 Todo App</h1>

        <div class="todo-input">
          <input id="todoInput" type="text" placeholder="Add a new task..." />
          <button id="addTodoBtn">Add</button>
        </div>

        <ul id="todoList"></ul>
      </div>
    `;

    this.renderTodos();
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
          <button data-index="${index}" class="toggle">✔</button>
          <button data-index="${index}" class="delete">✖</button>
        </div>
      `;

      list.appendChild(li);
    });
  }

  attachEvents() {
    this.shadowRoot
      .getElementById("addTodoBtn")
      .addEventListener("click", () => {
        const input = this.shadowRoot.getElementById("todoInput");
        const value = input.value.trim();
        if (!value) return;

        addTodo(value);
        input.value = "";
        this.renderTodos();
      });

    this.shadowRoot
      .getElementById("todoList")
      .addEventListener("click", (e) => {
        const index = e.target.dataset.index;

        if (e.target.classList.contains("toggle")) {
          toggleTodo(index);
        }

        if (e.target.classList.contains("delete")) {
          deleteTodo(index);
        }

        this.renderTodos();
      });
  }
}

customElements.define("todo-app", TodoApp);
