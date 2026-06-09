import '../pages/index.css';

import {
  addCard,
  changeLikeCardStatus,
  deleteCard,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from './components/api.js';
import { createCardElement, removeCardElement, updateLikeInfo } from './components/card.js';
import { closeModalWindow, openModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { clearValidation, enableValidation } from './components/validation.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

let currentUserId = null;

const placesWrap = document.querySelector('.places__list');

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');
const openProfileFormButton = document.querySelector('.profile__edit-button');
const openCardFormButton = document.querySelector('.profile__add-button');

const profileFormModalWindow = document.querySelector('.popup_type_edit');
const profileForm = profileFormModalWindow.querySelector('.popup__form');
const profileTitleInput = profileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = profileForm.querySelector('.popup__input_type_description');

const cardFormModalWindow = document.querySelector('.popup_type_new-card');
const cardForm = cardFormModalWindow.querySelector('.popup__form');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarFormModalWindow.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

const imageModalWindow = document.querySelector('.popup_type_image');
const imageElement = imageModalWindow.querySelector('.popup__image');
const imageCaption = imageModalWindow.querySelector('.popup__caption');

const cardInfoModalWindow = document.querySelector('.popup_type_info');
const cardInfoTitle = cardInfoModalWindow.querySelector('.popup__title');
const cardInfoList = cardInfoModalWindow.querySelector('.popup__info');
const cardInfoText = cardInfoModalWindow.querySelector('.popup__text');
const cardInfoUsersList = cardInfoModalWindow.querySelector('.popup__list');

const setButtonLoadingState = (buttonElement, isLoading, loadingText) => {
  if (isLoading) {
    buttonElement.dataset.defaultText = buttonElement.textContent;
    buttonElement.textContent = loadingText;
  } else {
    buttonElement.textContent = buttonElement.dataset.defaultText;
  }
};

const renderProfile = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
};

const formatDate = (date) => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const createInfoString = (term, description) => {
  const infoElement = document
    .querySelector('#popup-info-definition-template')
    .content
    .querySelector('.popup__info-item')
    .cloneNode(true);

  infoElement.querySelector('.popup__info-term').textContent = term;
  infoElement.querySelector('.popup__info-description').textContent = description;

  return infoElement;
};

const createLikedUserBadge = (userData) => {
  const likedUserElement = document
    .querySelector('#popup-info-user-preview-template')
    .content
    .querySelector('.popup__list-item')
    .cloneNode(true);

  likedUserElement.textContent = userData.name;
  likedUserElement.title = userData.name;

  return likedUserElement;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardId, likeButton) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => updateLikeInfo(likeButton, updatedCard, currentUserId))
    .catch((err) => console.error(err));
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCard(cardId)
    .then(() => removeCardElement(cardElement))
    .catch((err) => console.error(err));
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return Promise.reject('Карточка не найдена');
      }

      cardInfoTitle.textContent = 'Информация о карточке';
      cardInfoList.textContent = '';
      cardInfoUsersList.textContent = '';
      cardInfoText.textContent = 'Лайкнули:';

      cardInfoList.append(
        createInfoString('Описание:', cardData.name),
        createInfoString('Дата создания:', formatDate(new Date(cardData.createdAt))),
        createInfoString('Владелец:', cardData.owner.name),
        createInfoString('Количество лайков:', String(cardData.likes.length))
      );

      if (cardData.likes.length === 0) {
        cardInfoUsersList.append(createLikedUserBadge({ name: 'Пока никто' }));
      } else {
        cardData.likes.forEach((userData) => {
          cardInfoUsersList.append(createLikedUserBadge(userData));
        });
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => console.error(err));
};

const createCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeCard: handleLikeCard,
    onDeleteCard: handleDeleteCard,
    onInfoClick: handleInfoClick,
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonLoadingState(submitButton, true, 'Сохранение...');

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderProfile(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoadingState(submitButton, false));
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonLoadingState(submitButton, true, 'Сохранение...');

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoadingState(submitButton, false));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonLoadingState(submitButton, true, 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      cardForm.reset();
      clearValidation(cardForm, validationConfig);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoadingState(submitButton, false));
};

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll('.popup');
allPopups.forEach((popup) => setCloseModalWindowEventListeners(popup));

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    renderProfile(userData);
    cards.forEach((cardData) => placesWrap.append(createCard(cardData)));
  })
  .catch((err) => console.error(err));
