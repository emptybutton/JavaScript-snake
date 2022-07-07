import {BlackAlert} from "./modules/html-managers.js";


const alertMessageElements = Array.from(document.getElementsByClassName("alert-message"));

if (alertMessageElements.length > 0) {
  const alert = new BlackAlert();

  alertMessageElements.forEach(element => {
    alert.message += element.innerHTML + " ";
    document.body.removeChild(element);
  });

  alert.startShowing();
}
