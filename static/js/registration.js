document.getElementById("user-form").addEventListener("submit", isDataCorrect);

function isDataCorrect(event) {
  let name = form.accountName.value;
  let email = form.accountEmail.value;
  let pass = form.originalPassword.value;
  let repass = form.confirmPassword.value;
  let agree = form.agree.checked;

  let error = "";

  if (hasEmptiness([name.trim(), email.trim(), pass.trim(), repass.trim()]) || !agree)
    error = "required data is missing";
  else if (!email.includes("@"))
    error = "email entered incorrectly"
  else if (pass != repass)
    error = "repeated password is different";

  if (error != "") {
    event.preventDefault();

    console.log(error);
    document.getElementById("registration-error").innerHTML = error;
  }
}


function hasEmptiness(array) {
  for (let i = 0; i < array.length; i++) {
    if (!array[i]) return true;
  }
  return false;
}
