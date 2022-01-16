document.getElementById("account-form").addEventListener("submit", accountLogin);

function accountLogin(event) {
  let name = form.accountName.value;
  let pass = form.accountPassword.value;

  console.log(`login to ${name}`);
  event.preventDefault();
}
