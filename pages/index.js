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

const counter = new TodoCounter(initialTodos, ".counter");

const updateEmptyState = () => {
  const hasTodos = todosList.querySelector(".todo") !== null;
  emptyMessage.hidden = hasTodos;
};

function generateTodo(todoData) {
  const todo = new Todo(todoData, "#todo-template", counter, updateEmptyState);
  return todo.getView();
}

const renderTodo = (todoData) => {
  const todoElement = generateTodo(todoData);
  section.addItem(todoElement);
  updateEmptyState();
};

const section = new Section({
  items: initialTodos,
  renderer: (item) => {
    renderTodo(item);
  },
  containerSelector: ".todos__list",
});

section.renderItems();
updateEmptyState();

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
  popupWithForm.close();
});

popupWithForm.setEventListeners();
addTodoButton.addEventListener("click", () => popupWithForm.open());

const newFormValidator = new FormValidator(validationConfig, addTodoForm);
newFormValidator.enableValidation();
