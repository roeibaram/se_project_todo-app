import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { initialTodos, validationConfig } from "../utils/constants.js";
import Todo from "../components/Todo.js";
import Section from "../components/Section.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithForm from "../components/PopupWithForm.js";
import TodoCounter from "../components/TodoCounter.js";

const STORAGE_KEY = "todo-items-storage";

const addTodoButton = document.querySelector(".button_action_add");
const addTodoForm = document.forms["add-todo-form"];
const todosList = document.querySelector(".todos__list");
const emptyMessage = document.querySelector(".todos__empty-message");
const filterButtons = Array.from(document.querySelectorAll(".todos__filter-btn"));
const clearCompletedButton = document.querySelector(".todos__clear-completed");
const searchInput = document.querySelector(".todos__search");
const searchClearButton = document.querySelector(".todos__search-clear");

let activeFilter = "all";
let searchQuery = "";

const normalizeTodo = (todo) => {
  const normalizedDate = todo.date ? new Date(todo.date) : null;

  return {
    id: todo.id || uuidv4(),
    name: String(todo.name || "Untitled task"),
    completed: Boolean(todo.completed),
    date:
      normalizedDate && !Number.isNaN(normalizedDate)
        ? normalizedDate.toISOString()
        : "",
  };
};

const loadTodosFromStorage = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return initialTodos.map((todo) => normalizeTodo(todo));
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return initialTodos.map((todo) => normalizeTodo(todo));
    }

    return parsedValue.map((todo) => normalizeTodo(todo));
  } catch {
    return initialTodos.map((todo) => normalizeTodo(todo));
  }
};

const todoSeed = loadTodosFromStorage();
const counter = new TodoCounter(todoSeed, ".counter");

const getTodoItems = () => Array.from(todosList.querySelectorAll(".todo"));

const saveTodosToStorage = () => {
  const todoPayload = getTodoItems().map((item) => {
    const checkbox = item.querySelector(".todo__completed");

    return {
      id: item.dataset.id,
      name: item.dataset.name,
      date: item.dataset.date,
      completed: checkbox ? checkbox.checked : false,
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(todoPayload));
};

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
    if (searchQuery && activeFilter !== "all") {
      emptyMessage.textContent = `No ${activeFilter} tasks match "${searchQuery}".`;
      return;
    }

    if (searchQuery) {
      emptyMessage.textContent = `No tasks match "${searchQuery}".`;
      return;
    }

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

    const nameMatches = !searchQuery
      ? true
      : item.dataset.name.toLowerCase().includes(searchQuery);

    let matchesFilter = true;

    if (activeFilter === "active") {
      matchesFilter = !isCompleted;
    } else if (activeFilter === "completed") {
      matchesFilter = isCompleted;
    }

    item.hidden = !(matchesFilter && nameMatches);
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

  searchClearButton.hidden = !searchQuery;
};

const refreshUi = ({ persist = false } = {}) => {
  applyFilter();
  updateEmptyState();
  updateToolbarState();

  if (persist) {
    saveTodosToStorage();
  }
};

const handleTodoStateChange = () => {
  refreshUi({ persist: true });
};

function generateTodo(todoData) {
  const todo = new Todo(todoData, "#todo-template", counter, handleTodoStateChange);
  return todo.getView();
}

const renderTodo = (todoData, { persist = true } = {}) => {
  const todoElement = generateTodo(todoData);
  section.addItem(todoElement);
  refreshUi({ persist });
};

const section = new Section({
  items: todoSeed,
  renderer: (item) => {
    renderTodo(item, { persist: false });
  },
  containerSelector: ".todos__list",
});

section.renderItems();
refreshUi({ persist: true });

const popupWithForm = new PopupWithForm("#add-todo-popup", (data) => {
  const dateValue = data.date ? new Date(data.date) : null;

  if (dateValue) {
    dateValue.setMinutes(dateValue.getMinutes() + dateValue.getTimezoneOffset());
  }

  const todoData = {
    name: data.name,
    date: dateValue ? dateValue.toISOString() : "",
    id: uuidv4(),
    completed: false,
  };

  renderTodo(todoData);
  counter.updateTotal(true);
  refreshUi({ persist: true });
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
  refreshUi({ persist: true });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  refreshUi();
});

searchClearButton.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  refreshUi();
});

const newFormValidator = new FormValidator(validationConfig, addTodoForm);
newFormValidator.enableValidation();
