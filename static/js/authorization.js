const form = document.getElementById("account-form")
form.addEventListener("submit", accountLogin);


function accountLogin(event) {
  let name = form.accountName.value;
  let pass = form.accountPassword.value;
  
  event.preventDefault();
}
