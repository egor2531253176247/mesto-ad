const handleEscKey = (evt) => {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_is-opened');

    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add('popup_is-opened');
  document.addEventListener('keydown', handleEscKey);
};

export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', handleEscKey);
};

export const setCloseModalWindowEventListeners = (modalWindow) => {
  const closeButton = modalWindow.querySelector('.popup__close');

  closeButton.addEventListener('click', () => closeModalWindow(modalWindow));

  modalWindow.addEventListener('mousedown', (evt) => {
    if (evt.target === modalWindow) {
      closeModalWindow(modalWindow);
    }
  });
};
