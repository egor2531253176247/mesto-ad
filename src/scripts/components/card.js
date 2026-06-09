const getCardTemplate = () => {
  return document
    .querySelector('#card-template')
    .content
    .querySelector('.card')
    .cloneNode(true);
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const updateLikeInfo = (likeButton, cardData, userId) => {
  const cardElement = likeButton.closest('.card');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  const isLiked = cardData.likes.some((user) => user._id === userId);

  likeButton.classList.toggle('card__like-button_is-active', isLiked);
  likeCountElement.textContent = cardData.likes.length;
};

export const createCardElement = (
  cardData,
  userId,
  { onPreviewPicture, onLikeCard, onDeleteCard, onInfoClick }
) => {
  const cardElement = getCardTemplate();
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardElement.dataset.cardId = cardData._id;
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  updateLikeInfo(likeButton, cardData, userId);

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => onDeleteCard(cardData._id, cardElement));
  }

  likeButton.addEventListener('click', () => onLikeCard(cardData._id, likeButton));
  cardImage.addEventListener('click', () => onPreviewPicture(cardData));
  infoButton.addEventListener('click', () => onInfoClick(cardData._id));

  return cardElement;
};
