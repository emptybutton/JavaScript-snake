const form = document.getElementById("user-form")
form.addEventListener("submit", manageForm);

function manageForm(event) {
  let error;

  if ([form.name.value.trim(), form.email.value.trim(), form.password.value.trim()].map((line) => Boolean(line)).includes(false))
    error = "Fill in all the fields!";
  else if (!form.isAgree.checked)
    error = "Agree to it";
  else
    error = null


  if (error) {
    alert(error) //Test ficha
    event.preventDefault();
  }
}
