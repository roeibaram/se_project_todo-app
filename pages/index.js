import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { initialTodos, validationConfig } from "../utils/constants.js";
import Todo from "../components/Todo.js";
import Section from "../components/Section.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithForm from "../components/PopupWithForm.js";
import TodoCounter from "../components/TodoCounter.js";

const addTodoButton = document.querySelector(".button_action_add");
const addTodoForm = document.forms["add-todo-form"];
const todosList = document.querySelector(".todos__list");
const emptyMessage = document.querySelector(".todos__empty-message");
const filterButtons = Array.from(document.querySelectorAll(".todos__filter-btn"));
const clearCompletedButton = document.querySelector(".todos__clear-completed");

let activeFilter = "all";

const counter = new TodoCounter(initialTodos, ".counter");

const getTodoItems = () => Array.from(todosList.querySelectorAll(".todo"));

const syncCounterFromDom = () => {
  const todoItems = getTodoItems();
  const completedCount = todoItems.filter((item) => {
    const checkbox = item.querySelector(".todo__completed");
    return checkbox && checkbox.checked;
  }).length;

  counter.setCounts(todoItems.length, completedCount);
};

const updateEmptyState = () => {
  const visibleTodos = getTodoItems().filter((item) => !item.hidden).length;

  emptyMessage.hidden = visibleTodos > 0;

  if (!emptyMessage.hidden) {
    emptyMessage.textContent =
      activeFilter === "all"
        ? "No tasks yet. Add your first todo to get started."
        : "No tasks in this view yet.";
  }
};

const applyFilter = () => {
  getTodoItems().forEach((item) => {
    const checkbox = item.querySelector(".todo__completed");
    const isCompleted = checkbox ? checkbox.checked : false;

    if (activeFilter === "active") {
      item.hidden = isCompleted;
    } else if (activeFilter === "completed") {
      item.hidden = !isCompleted;
    } else {
      item.hidden = false;
    }
  });
};

const updateToolbarState = () => {
  filterButtons.forEach((button) => {
    const isCurrent = button.dataset.filter === activeFilter;
    button.classList.toggle("todos__filter-btn_active", isCurrent);
  });

  const hasCompletedTodos =
    todosList.querySelectorAll(".todo .todo__completed:checked").length > 0;
  clearCompletedButton.disabled = !hasCompletedTodos;
};

const refreshUi = () => {
  applyFilter();
  updateEmptyState();
  updateToolbarState();
};

const handleTodoStateChange = () => {
  refreshUi();
};

function generateTodo(todoData) {
  const todo = new Todo(todoData, "#todo-template", counter, handleTodoStateChange);
  return todo.getView();
}

const renderTodo = (todoData) => {
  const todoElement = generateTodo(todoData);
  section.addItem(todoElement);
  refreshUi();
};

const section = new Section({
  items: initialTodos,
  renderer: (item) => {
    renderTodo(item);
  },
  containerSelector: ".todos__list",
});

section.renderItems();
refreshUi();

const popupWithForm = new PopupWithForm("#add-todo-popup", (data) => {
  const date = new Date(data.date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  const todoData = {
    name: data.name,
    date,
    id: uuidv4(),
    completed: false,
  };

  renderTodo(todoData);
  counter.updateTotal(true);
  refreshUi();
  popupWithForm.close();
});

popupWithForm.setEventListeners();
addTodoButton.addEventListener("click", () => popupWithForm.open());

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    refreshUi();
  });
});

clearCompletedButton.addEventListener("click", () => {
  getTodoItems().forEach((item) => {
    const checkbox = item.querySelector(".todo__completed");

    if (checkbox && checkbox.checked) {
      item.remove();
    }
  });

  syncCounterFromDom();
  refreshUi();
});

const newFormValidator = new FormValidator(validationConfig, addTodoForm);
newFormValidator.enableValidation();
