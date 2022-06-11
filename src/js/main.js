class Modal {
  constructor(modal) {
    this.modal = modal;
    this.modalID = modal.id;
    this.modalClosingElements = this.modal.querySelectorAll('[data-close="modal"]');
    this.modalClickableElements = null;
    this.modalOpenButton = document.querySelector(`[data-target='${this.modalID}']`);
    this.displayClicksCounter = this.modal.querySelector('#counterOutput');
    this.bodyDOM = document.querySelector('body');
    this.clearCounterButton = null;
    this.countButtonClicks = JSON.parse(localStorage.getItem(`${this.modalID}`)) || 0;
    this.darkOverlay = null;
    this.counterLimit = 5;
  }

  incrementCounter = () => {
    this.countButtonClicks++;
    this.displayCounter();

    if(!this.clearCounterButton && this.countButtonClicks > this.counterLimit)  {
      this.appendResetButton();
      this.clearCounterButton.addEventListener('click', this.clearCounter);
    }
  }

  initCounter = () => {
    this.incrementCounter();

    if(!localStorage.getItem(`${this.modalID}`)) {
      localStorage.setItem(`${this.modalID}`, JSON.stringify(this.countButtonClicks));
    }
  }

  saveCounter = () => localStorage.setItem(`${this.modalID}`, JSON.stringify(this.countButtonClicks));

  clearCounter = () => {
    this.countButtonClicks = 0;
    localStorage.removeItem(`${this.modalID}`);

    this.clearCounterButton.remove();
    this.clearCounterButton = null;
    this.modalClickableElements[0].focus();
    this.displayCounter();
  }
  // Display and update counter
  displayCounter = () => this.displayClicksCounter.textContent = `${this.countButtonClicks} times`;

// Methods responsible for keeping FOCUS only for clickable elements within modal window:
  // 1. Move focus forward, when user press TAB key
  moveFocusForward = (activeElement, e) => {
    const getLastClickable = this.modalClickableElements[this.modalClickableElements.length-1];

    if(activeElement === getLastClickable) {
      e.preventDefault();
      this.modalClickableElements[0].focus();
    }
  }
  // 2. Move focus back, when user press SHIFT + TAB keys
  moveFocusBackward = (activeElement, e) => {
    const getFirstClickable = this.modalClickableElements[0];

    if(activeElement === getFirstClickable) {
      e.preventDefault();
      this.modalClickableElements[this.modalClickableElements.length-1].focus();
    }
  }

  handleKeydown = e => {
    this.modalClickableElements = this.modal.querySelectorAll('a[href], button:not([disabled])');
    
    if(e.key === 'Tab') {
      if(e.shiftKey) {
        this.moveFocusBackward(document.activeElement, e);
      } else {
        this.moveFocusForward(document.activeElement, e);
      }
    }
  }

  appendResetButton = () => {
    const markup = `
      <button type="button" class="btn btn__secondary btn-small" data-clear="modal" aria-label="Reset modal counter">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
          Reset
      </button>
    `; 

    this.modal.insertAdjacentHTML('beforeend', markup);
    this.clearCounterButton = this.modal.querySelector('[data-clear="modal"]');
    // if reset button is appended, update clickables nodes
    this.modalClickableElements = this.modal.querySelectorAll('a[href], button:not([disabled])');
  }

  appendDarkOverlay = () => {
    const overlay = `<div class="modal-overlay"></div>`;

    this.bodyDOM.insertAdjacentHTML('beforeend', overlay);
    this.bodyDOM.classList.add('modal-active');

    this.darkOverlay = document.querySelector('.modal-overlay');
    this.darkOverlay.addEventListener('click', this.closeModal);
  }

  openModal = () => {
    this.modal.ariaHidden = false;
    this.modal.ariaModal = true;
    this.modal.style.display = 'block';

    this.appendDarkOverlay();
    this.modalClosingElements[0].focus();
  }

  closeModal = () => {
    this.modal.ariaHidden = true;
    this.modal.ariaModal = false;
    this.modal.style.display = 'none';

    this.darkOverlay.remove();
    this.bodyDOM.classList.remove('modal-active');
    this.saveCounter();

    this.modalOpenButton.focus();
    this.modalClickableElements = null;
    // remove listener when modal is dismissed
    this.modal.removeEventListener('keydown', this.handleKeydown);
  }

  handleCloseMethods = () => {
    // get all clickables elements from modal, and attach event listener to them
    Array.from(this.modalClosingElements).forEach(el => el.addEventListener('click', this.closeModal));
    window.addEventListener('keydown', e => { if(e.key === 'Escape') this.closeModal() });
  }
  // initialize basic functions for modal
  init = () => {
    this.modalOpenButton.addEventListener('click', () => {
      this.openModal();
      this.initCounter();
      this.handleCloseMethods();
    });

    this.modal.addEventListener('keydown', e => this.handleKeydown(e));
    this.modal.ariaHidden = true;
  }
}

const myModal = new Modal(document.querySelector('#exampleModal')).init();