const form = document.getElementById("user-form")
form.addEventListener("submit", isDataCorrect);

function isDataCorrect(event) {
  const name = form.accountName.value;
  const email = form.accountEmail.value;
  const originalPassword = form.originalPassword.value;
  const confirmPassword = form.confirmPassword.value;
  const isAgree = form.isAgree.checked;

  let error;

  if ([name.trim(), email.trim(), originalPassword.trim(), confirmPassword.trim()].map((line) => Boolean(line)).includes(false))
    error = "Fill in all the fields!";
  else if (!email.includes("@"))
    error = "Email is not correct!";
  else if (originalPassword != confirmPassword)
    error = "Password mismatch!";
  else if (!isAgree)
    error = "Agree to it";
  else
    error = null


  if (error != null) {
    event.preventDefault();
    document.getElementById("registration-error").innerHTML = error;
  }
}
