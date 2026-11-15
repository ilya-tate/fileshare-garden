const popupElement = document.getElementById("popup");
const titleElement = document.getElementById("popup-title");
const textElement = document.getElementById("popup-text");

export const openPopup = (title, text) => {
  titleElement.textContent = title;
  textElement.textContent = text;
  popupElement.hidden = false;
};

export const closePopup = () => {
  popupElement.hidden = true;
};

document.getElementById("popup-close").addEventListener("click", closePopup);
