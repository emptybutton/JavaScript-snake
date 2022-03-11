const form = document.getElementById("form-for-new-account-data");

const bufferForNewIcon = document.getElementsByClassName("users-icon")[0];
const standartIconSize = [500, 500];
let isIconDefault = false;

const buttonLoader = document.getElementById("add-image-button");
const buttonRemover = document.getElementById("remove-image-button");

const trueIconLoader = document.getElementById("icon-loader");


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


form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isIconDefault) {
    imageToCanvas(bufferForNewIcon, standartIconSize[0], standartIconSize[1]).toBlob((blob) => {
      reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onload = () => {
        addDataToForm(form, "icon", reader.result.slice(23));
        console.log(document.getElementsByName("icon")[0].value);
      }
    }, "image/jpeg");
  }
  else {
    addDataToForm(form, "icon", "");
  }

  console.log(form);
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
