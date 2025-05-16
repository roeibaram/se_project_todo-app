export default class Popup {
    constructor(popupSelector) {
      this._popup = document.querySelector(popupSelector);
      this._handleEscapeClose = this._handleEscapeClose.bind(this);
    }
  
    open() {
      this._popup.classList.add("popup_visible");
      document.addEventListener("keydown", this._handleEscapeClose);
    }
  
    close() {
      this._popup.classList.remove("popup_visible");
      document.removeEventListener("keydown", this._handleEscapeClose);
    }
  
    _handleEscapeClose(evt) {
      if (evt.key === "Escape") {
        this.close();
      }
    }
  
    setEventListeners() {
      this._popup.addEventListener("click", (evt) => {
        if (
          evt.target.classList.contains("popup__close") ||
          evt.target === this._popup
        ) {
          this.close();
        }
      });
    }
  }
  