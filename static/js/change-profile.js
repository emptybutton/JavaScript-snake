const form = document.getElementById("form-for-new-account-data");

const bufferForNewIcon = document.getElementsByClassName("users-icon")[0];
const standartIconSize = [500, 500];

let isIconDefault = Boolean(Number(getCookie("is_icon_standart")));

const submitButton = document.getElementById("save-button");
const buttonLoader = document.getElementById("add-image-button");
const buttonRemover = document.getElementById("remove-image-button");

const trueIconLoader = document.getElementById("icon-loader");


submitButton.onclick = () => {
  if (!isIconDefault) {
    imageToCanvas(bufferForNewIcon, standartIconSize[0], standartIconSize[1]).toBlob((blob) => {
      reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onload = () => {
        addDataToForm(form, "icon", reader.result.slice(23));
        form.submit();
      }
    }, "image/jpeg");
  }
  else {
    addDataToForm(form, "icon", "");
    form.submit();
  }
}


buttonLoader.onclick = () => {
  trueIconLoader.click();
}


buttonRemover.onclick = () => {
  fetch(new Request("/api/default-user-avatar")).then(response => response.blob())
    .then(blob => {
      bufferForNewIcon.src = URL.createObjectURL(blob);
    });

  isIconDefault = true;
}


trueIconLoader.addEventListener('change', () => {
  bufferForNewIcon.src = URL.createObjectURL(trueIconLoader.files[0]);
  isIconDefault = false;
});


function imageToCanvas(image, width, height) {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  canvas.getContext('2d').drawImage(image, 0, 0, width, height);

  return canvas;
}


function addDataToForm(form, name, data) {
  let homeData = document.getElementsByName(name)[0];

  if (!homeData) {
    homeData = document.createElement("input");
    homeData.name = name;
    homeData.style.display = "none";

    form.appendChild(homeData);
  }

  homeData.value = data;
}


function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
