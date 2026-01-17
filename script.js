const display = document.querySelector(".display");
const buttons = document.querySelectorAll("button");

let currentInput = " ";
let firstOperand = null;
let operator = null;
let waitingForSecond = false;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    let value = button.getAttribute("data-key");
    handleInput(value);
  });
});

document.addEventListener("keydown", (event) => {
  let key = event.key;
  if (key === "Escape") key = "AC";
  if (key === "Enter") key = "=";
  if (key === "Backspace") key = "CE";

  const allowedKeys = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ".",
    "+",
    "-",
    "*",
    "/",
    "=",
    "AC",
    "%",
    "CE",
  ];

  if (allowedKeys.includes(key)) {
    handleInput(key);
    triggerFlashEffect(key);
    event.preventDefault();
  }
});

function handleInput(value) {
  if (isNumber(value)) {
    inputNumber(value);
  } else if (value === ".") {
    inputDecimal();
  } else if (value === "AC") {
    clearAll();
  } else if (value === "CE") {
    deleteLast();
  } else if (value === "=") {
    calculateResult();
  } else {
    handleOperator(value);
  }
  updateDisplay();
}

function isNumber(value) {
  return !isNaN(value) && value !== " ";
}

function inputNumber(num) {

  if (waitingForSecond) {
    currentInput = num;
    waitingForSecond = false;
  } else {
    currentInput = currentInput === "0" ? num : currentInput + num;
  }
}

function inputDecimal() {
  if (waitingForSecond) {
    currentInput = "0.";
    waitingForSecond = false;
    return;
  }

  if ( !currentInput.includes(".")) {
    currentInput += ".";
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(currentInput);
  if (isNaN(inputValue) && nextOperator !== "-") return;

  // Special case: Allow negative numbers
  if (nextOperator === "-" && isNaN(inputValue)) {
    currentInput = "-";
    return;
  }

  updateOperatorState(nextOperator);

  if (operator && waitingForSecond) {
    operator = nextOperator;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = calculate(firstOperand, inputValue, operator);
    currentInput = String(result);
    firstOperand = result;
  }

  waitingForSecond = true;
  operator = nextOperator;
}

function calculate(first, second, op) {
  if (op === "+") return first + second;
  if (op === "-") return first - second;
  if (op === "*") return first * second;
  if (op === "/") return second === 0 ? "Error: Zero Division" : first / second;
  if (op === "%") return (first / second) * 100;
  return second;
}

function calculateResult() {
  updateOperatorState(null);
  if (operator === null || waitingForSecond) return;

  const inputValue = parseFloat(currentInput);
  const result = String(calculate(firstOperand, inputValue, operator));

  if (result === "Error: Zero Division") {
    currentInput = result;
    firstOperand = null;
  } else {
    // Round to prevent long decimals (e.g. 0.1 + 0.2 = 0.3000000004)
    currentInput =  result; // This makes it a String (SAFE);
  }

  firstOperand = null;
  operator = null;
  waitingForSecond = true;
}

function clearAll() {
  updateOperatorState(null);
  currentInput = "";
  firstOperand = null;
  operator = null;
  waitingForSecond = false;
}

function deleteLast() {
  currentInput = display.value;
  currentInput = currentInput.slice(0, -1);
  waitingForSecond = false;
}

function updateDisplay() {
  let value = parseFloat(currentInput);

  if(currentInput.includes(".") && currentInput.split(".")[1].length > 3){
    display.value = String(Math.round(value * 1000) / 1000);
  }else{
    display.value = currentInput;
  }

}

function triggerFlashEffect(key) {
  const button = document.querySelector(`button[data-key="${key}"]`);

  if (button) {
    const currentActive = document.querySelectorAll(".pressed");
    currentActive.forEach((btn) => btn.classList.remove("pressed"));

    button.classList.add("pressed");

    setTimeout(() => {
      button.classList.remove("pressed"); // CHANGE "add" TO "remove"
    }, 100);
  }
}

function updateOperatorState(activeOp) {
  // 1. Remove the 'active-operator' class from ALL buttons first
  const buttons = document.querySelectorAll("button");
  buttons.forEach((btn) => btn.classList.remove("active-operator"));

  // 2. If we have a new active operator, find that button and make it
  if (activeOp) {
    const activeBtn = document.querySelector(`button[data-key="${activeOp}"]`);
    if (activeBtn) activeBtn.classList.add("active-operator");
  }
}
