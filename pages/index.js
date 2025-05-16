import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { initialTodos, validationConfig } from "../utils/constants.js";
import Todo from "../components/Todo.js";
import Section from "../components/Section.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithForm from "../components/PopupWithForm.js";
import TodoCounter from "../components/TodoCounter.js";

const addTodoButton = document.querySelector(".button_action_add");
const addTodoForm = document.forms["add-todo-form"];

const counter = new TodoCounter(initialTodos, ".counter");

const section = new Section({
  items: initialTodos,
  renderer: (item) => {
    const todo = new Todo(item, "#todo-template", counter);
    const todoElement = todo.getView();
    section.addItem(todoElement);
  },
  containerSelector: ".todos__list",
});

section.renderItems();

const renderTodo = (todoData) => {
  const todo = new Todo(todoData, "#todo-template", counter);
  const todoElement = todo.getView();
  section.addItem(todoElement);
  counter.updateTotal(true);
  if (todoData.completed) counter.updateCompleted(true);
};

const popupWithForm = new PopupWithForm("#add-todo-popup", (data) => {
  const date = new Date(data.date);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  const id = uuidv4();
  const todoData = {
    name: data.name,
    date,
    id,
    completed: false,
  };

  renderTodo(todoData);
  popupWithForm.close();
});

popupWithForm.setEventListeners();
addTodoButton.addEventListener("click", () => popupWithForm.open());

const newFormValidator = new FormValidator(validationConfig, addTodoForm);
newFormValidator.enableValidation();
