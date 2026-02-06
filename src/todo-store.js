let todos = [];

export function addTodo(text) {
  todos.push({ text, completed: false });
}

export function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
}

export function deleteTodo(index) {
  todos.splice(index, 1);
}

export function getTodos() {
  return todos;
}
