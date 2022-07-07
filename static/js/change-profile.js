const proxyForUserDescriptionValue = document.getElementById("user-description-value");

document.getElementById("user-description").innerHTML = proxyForUserDescriptionValue.innerHTML

proxyForUserDescriptionValue.parentElement.removeChild(proxyForUserDescriptionValue);


const userIconBuffer = document.getElementById("user-icon-buffer");

const hideIconLoader = document.getElementById("icon-loader");

const submitButton = document.getElementById("submit-button");
const iconUploadButton = document.getElementById("add-image-button");
const iconGenerationButton = document.getElementById("generate-image-button");


userIconBuffer.onload = () => {
  const canvas = imageToCanvas(userIconBuffer);

  canvas.toBlob((blob) => {
    hideIconLoader.files = getFileListFrom([new File([blob], 'image.jpeg', {type: blob.type})]);
  })
}


iconUploadButton.onclick = () => {
  hideIconLoader.click();
}


iconGenerationButton.onclick = () => {
  fetch(new Request("/api/random-user-icon")).then(response => response.blob())
    .then(blob => {
      userIconBuffer.src = URL.createObjectURL(blob);
      hideIconLoader.files = getFileListFrom([new File([blob], 'image.jpeg', {type: blob.type})]);
    });
}


hideIconLoader.addEventListener('change', () => {
  userIconBuffer.src = URL.createObjectURL(hideIconLoader.files[0]);
});


function getFileListFrom(fiels) {
  const dataTransfer = new DataTransfer();

  fiels.forEach(file => {
    dataTransfer.items.add(file);
  });

  return dataTransfer.files;
}


function imageToCanvas(image, width, height) {
  if (!width)
    width = parseInt(image.naturalWidth);

  if (!height)
    height = parseInt(image.naturalHeight);


  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  canvas.getContext('2d').drawImage(image, 0, 0, width, height);

  return canvas;
}
