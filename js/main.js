const theForm = document.querySelector(".frm-transactions");

const totalDebits = document.querySelector(".debits");
const totalCredits = document.querySelector(".credits");
const tableBody = document.querySelector("tbody");
const errorField = document.querySelector(".error");

// Build a list for our errors.
const errorList = buildErrorList();

// Make the page refresh every two minutes.
const timerDuration = 120000;
let refreshTimer = null;
startRefreshTimer();

theForm.addEventListener("submit", event => {
  // Stop the form from reloading on submit.
  event.preventDefault();

  // Reset our page reload timer.
  resetRefreshTimer();
  //Clear Error List (to prepare for new ones!)
  clearErrors();

  // Retrieve values from form.
  const type = getTransactionType();
  const desc = getDescription();
  const cashVal = getCashValue();

  if (isErrorFree()) {
    // Update our Debit/Credit Totals.
    if (type === "credit") {
      addCredits(cashVal);
    } else {
      addDebits(cashVal);
    }

    addTableRow(desc, type, cashVal);
    theForm.reset();
  }
});

function addTableRow(description, type, cashVal) {
  const newRow = document.createElement("tr");

  const descElt = buildTableData(description);
  const typeElt = buildTableData(type);
  const cashElt = buildTableData("$" + cashVal);
  cashElt.classList.add("transaction-value-itm", type);

  newRow.classList.add(type);
  newRow.appendChild(descElt);
  newRow.appendChild(typeElt);
  newRow.appendChild(cashElt);

  // Build our trash element, give it an event so we can remove table entries.
  const trashIcon = buildTrashIcon();
  trashIcon.addEventListener("click", removeTableRow);
  newRow.appendChild(trashIcon);

  tableBody.appendChild(newRow);
}

function removeTableRow(event) {
  if (confirm("Are you sure you want to delete this entry?")) {
    const { parentNode: row } = event.target;
    const cashElt = row.children[2];
    const cashVal = cleanCashString(cashElt.firstChild.nodeValue);

    const isDebit = row.classList.contains("debit");
    if (isDebit) {
      addDebits(-cashVal);
    } else {
      addCredits(-cashVal);
    }

    row.parentNode.removeChild(row);
  }
}

function buildTableData(str) {
  const td = document.createElement("td");
  const txtNode = document.createTextNode(str);
  td.appendChild(txtNode);

  return td;
}

function getTransactionType() {
  const type = theForm.elements.type;
  if (type.value === "") {
    logError("User must select transaction type.");
  }

  return type.value;
}

function getDescription() {
  const descInput = theForm.elements.description;
  const desc = descInput.value;
  if (isEmptyOrWhiteSpace(desc)) {
    logError("Description field cannot be empty.");
  }

  return desc;
}

function getCashValue() {
  const cash = theForm.elements.currency;
  if (cash.value < 0) {
    logError("Cash must be a positive number.");
  } else if (cash.value == 0){
    logError("Cash value cannot be Zero.");
  }

  return Number(cash.value).toFixed(2);
}

function addDebits(val) {
  let debits = getTotalDebits();
  debits += Number(val);
  if (debits < 0) {
    debits = 0;
  }

  setTotalDebits(debits);
}

function addCredits(val) {
  let credits = getTotalCredits();
  credits += Number(val);
  if (credits < 0) {
    credits = 0;
  }
  setTotalCredits(credits);
}

/* 
   I'm using firstChild to get around using
   textContent/innerHTML/innerText 
*/
function getTotalDebits() {
  const debits = totalDebits.firstChild.nodeValue;
  return Number(cleanCashString(debits));
}

function setTotalDebits(val) {
  totalDebits.firstChild.nodeValue = "$" + Number(val).toFixed(2);
}

function getTotalCredits() {
  const credits = totalCredits.firstChild.nodeValue;
  return Number(cleanCashString(credits));
}

function setTotalCredits(val) {
  totalCredits.firstChild.nodeValue = "$" + Number(val).toFixed(2);
}

function buildTrashIcon() {
  const icon = document.createElement("i");
  icon.classList.add("delete", "fa", "fa-trash-o");
  return icon;
}

function buildErrorList() {
  const errList = document.createElement("ul");
  errList.classList.add("error-list");
  errorField.appendChild(errList);

  return errList;
}

function logError(msg) {
  const err = document.createElement("li");
  const errMsg = document.createTextNode(msg);
  err.appendChild(errMsg);
  errorList.appendChild(err);
}

function isErrorFree() {
  return !errorList.hasChildNodes();
}

function clearErrors() {
  // While the error list has children, remove them.
  while (errorList.firstChild) {
    errorList.removeChild(errorList.firstChild);
  }
}

function startRefreshTimer(){
  if (refreshTimer === null){
    document.onmousemove = resetRefreshTimer;
    document.onkeydown = resetRefreshTimer;
  }
  refreshTimer = setTimeout(() => {
    alert("Your page is about to reload!");
    window.location.reload();
  }, timerDuration);
}

function resetRefreshTimer(){
  clearTimeout(refreshTimer);
  startRefreshTimer();
}

function isEmptyOrWhiteSpace(str) {
  return !str || !str.trim();
}

/* Remove the "$" character from our cash values */
function cleanCashString(str) {
  return str.replace("$", "");
}