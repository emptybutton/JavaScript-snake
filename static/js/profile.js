import {Hint} from "./modules/html-managers.js";

const linkToProfileSettings = document.getElementById("to-change-profile-page");

if (linkToProfileSettings) {
  new Hint(
    document.getElementById("change-profile-hint"),
    linkToProfileSettings
  );
}
