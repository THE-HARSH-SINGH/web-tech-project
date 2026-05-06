
var calcDisplay = document.getElementById("calcDisplay");
var calcExpression = document.getElementById("calcExpression");
var calcButtons = document.getElementById("calcButtons");
var calcStatus = document.getElementById("calcStatus");
var historyList = document.getElementById("historyList");
var inputBtn = document.getElementById("inputBtn");

var expression = "";
var historyEntries = [];

function setStatus(message, color) {
  calcStatus.textContent = message;
  calcStatus.style.color = color || "#0f172a";
}

function refreshDisplay() {
  var show = expression === "" ? "0" : expression;
  calcDisplay.value = show;
  calcExpression.textContent = "Expression: " + show;
}

function formatNumber(value) {
  var rounded = Math.round((value + Number.EPSILON) * 10000000000) / 10000000000;
  return String(rounded);
}

function addToHistory(exp, result) {
  var rowText = exp + " = " + result;
  historyEntries.unshift(rowText);
  if (historyEntries.length > 8) {
    historyEntries.pop();
  }
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (historyEntries.length === 0) {
    var emptyRow = document.createElement("li");
    emptyRow.textContent = "No results yet.";
    historyList.appendChild(emptyRow);
    return;
  }

  for (var i = 0; i < historyEntries.length; i++) {
    var item = document.createElement("li");
    item.textContent = historyEntries[i];
    item.setAttribute("data-row", historyEntries[i]);
    historyList.appendChild(item);
  }
}

function isOperator(char) {
  return char === "+" || char === "-" || char === "*" || char === "/";
}

function appendDigit(digit) {
  if (expression === "0") {
    expression = digit;
  } else {
    expression += digit;
  }
  refreshDisplay();
}

function appendOperator(op) {
  if (expression === "") {
    if (op === "-") {
      expression = "-";
      refreshDisplay();
    }
    return;
  }

  var lastChar = expression.slice(-1);
  if (isOperator(lastChar)) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }
  refreshDisplay();
}

function appendDot() {
  if (expression === "") {
    expression = "0.";
    refreshDisplay();
    return;
  }

  var lastOperatorIndex = -1;
  for (var i = expression.length - 1; i >= 0; i--) {
    if (isOperator(expression[i])) {
      lastOperatorIndex = i;
      break;
    }
  }

  var currentNumber = expression.slice(lastOperatorIndex + 1);
  if (currentNumber.includes(".")) {
    return;
  }

  expression += ".";
  refreshDisplay();
}

function tokenize(expr) {
  var tokens = [];
  var num = "";
  var lastType = "operator";

  for (var i = 0; i < expr.length; i++) {
    var ch = expr[i];

    if ((ch >= "0" && ch <= "9") || ch === "." || (ch === "-" && lastType === "operator")) {
      num += ch;
      lastType = "number";
      continue;
    }

    if (isOperator(ch)) {
      if (num !== "") {
        tokens.push(num);
        num = "";
      }
      tokens.push(ch);
      lastType = "operator";
      continue;
    }

    return null;
  }

  if (num !== "") {
    tokens.push(num);
  }

  return tokens;
}

function toRPN(tokens) {
  var output = [];
  var ops = [];
  var precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (!isNaN(Number(token))) {
      output.push(token);
    } else if (isOperator(token)) {
      while (ops.length > 0 && precedence[ops[ops.length - 1]] >= precedence[token]) {
        output.push(ops.pop());
      }
      ops.push(token);
    } else {
      return null;
    }
  }

  while (ops.length > 0) {
    output.push(ops.pop());
  }

  return output;
}

function evalRPN(rpn) {
  var stack = [];

  for (var i = 0; i < rpn.length; i++) {
    var token = rpn[i];

    if (!isNaN(Number(token))) {
      stack.push(Number(token));
      continue;
    }

    if (isOperator(token)) {
      if (stack.length < 2) {
        return null;
      }

      var b = stack.pop();
      var a = stack.pop();
      var result = 0;

      if (token === "+") {
        result = a + b;
      } else if (token === "-") {
        result = a - b;
      } else if (token === "*") {
        result = a * b;
      } else if (token === "/") {
        if (b === 0) {
          return null;
        }
        result = a / b;
      }

      stack.push(result);
    }
  }

  if (stack.length !== 1) {
    return null;
  }

  return stack[0];
}

function evaluateExpression() {
  var outcome = getCurrentValue();
  if (!outcome.ok) {
    setStatus(outcome.message, "#b91c1c");
    return;
  }

  var expBefore = expression;
  var resultText = formatNumber(outcome.value);
  expression = resultText;
  refreshDisplay();
  addToHistory(expBefore, resultText);
  setStatus("Result: " + resultText, "#065f46");
}

function applySqrt() {
  var outcome = getCurrentValue();
  if (!outcome.ok) {
    setStatus(outcome.message, "#b91c1c");
    return;
  }

  if (outcome.value < 0) {
    setStatus("Square root of a negative number is not allowed.", "#b91c1c");
    return;
  }

  var expBefore = "SQRT(" + expression + ")";
  var result = Math.sqrt(outcome.value);
  var resultText = formatNumber(result);

  expression = resultText;
  refreshDisplay();
  addToHistory(expBefore, resultText);
  setStatus("Result: " + resultText, "#065f46");
}

function applySquare() {
  var outcome = getCurrentValue();
  if (!outcome.ok) {
    setStatus(outcome.message, "#b91c1c");
    return;
  }

  var expBefore = "SQR(" + expression + ")";
  var result = outcome.value * outcome.value;
  var resultText = formatNumber(result);

  expression = resultText;
  refreshDisplay();
  addToHistory(expBefore, resultText);
  setStatus("Result: " + resultText, "#065f46");
}

function getCurrentValue() {
  if (expression.trim() === "") {
    return { ok: false, message: "Type an expression first." };
  }

  var tokens = tokenize(expression);
  if (!tokens || isOperator(tokens[tokens.length - 1])) {
    return { ok: false, message: "Invalid expression." };
  }

  var rpn = toRPN(tokens);
  if (!rpn) {
    return { ok: false, message: "Invalid expression." };
  }

  var result = evalRPN(rpn);
  if (result === null || !isFinite(result)) {
    return { ok: false, message: "Math error." };
  }

  return { ok: true, value: result };
}

function promptInput() {
  var input = prompt("Enter an expression (example: 12+8/4):");
  if (input === null) {
    setStatus("Input cancelled.", "#334155");
    return;
  }

  var cleaned = input.replace(/\s+/g, "").trim();
  if (cleaned === "") {
    setStatus("Input is empty.", "#b91c1c");
    return;
  }

  var tokens = tokenize(cleaned);
  if (!tokens || isOperator(tokens[tokens.length - 1])) {
    setStatus("Input is not valid.", "#b91c1c");
    return;
  }

  expression = cleaned;
  refreshDisplay();
  setStatus("Input loaded.", "#334155");
}

function handleCommand(command) {
  if (command === "AC") {
    if (expression !== "") {
      var ok = confirm("Clear the current expression?");
      if (!ok) {
        setStatus("Clear cancelled.", "#334155");
        return;
      }
    }
    expression = "";
    refreshDisplay();
    setStatus("Cleared.");
    return;
  }

  if (command === "DEL") {
    expression = expression.slice(0, -1);
    refreshDisplay();
    setStatus("Deleted last input.");
    return;
  }

  if (command === "=") {
    evaluateExpression();
    return;
  }

  if (command === "SQRT") {
    applySqrt();
    return;
  }

  if (command === "SQR") {
    applySquare();
    return;
  }

  if (command === ".") {
    appendDot();
    return;
  }

  if (isOperator(command)) {
    appendOperator(command);
    return;
  }

  appendDigit(command);
}

calcButtons.addEventListener("click", function (event) {
  if (!event.target.matches("button")) {
    return;
  }

  var command = event.target.getAttribute("data-value");
  handleCommand(command);
});

historyList.addEventListener("click", function (event) {
  var clickedRow = event.target.closest("li");
  if (!clickedRow || !clickedRow.dataset.row) {
    return;
  }

  var text = clickedRow.dataset.row;
  var splitParts = text.split("=");
  if (splitParts.length === 2) {
    expression = splitParts[1].trim();
    refreshDisplay();
    setStatus("Loaded result.", "#334155");
  }
});

inputBtn.addEventListener("click", function () {
  promptInput();
});

document.addEventListener("keydown", function (event) {
  var key = event.key;

  if (key >= "0" && key <= "9") {
    appendDigit(key);
    return;
  }

  if (key === ".") {
    appendDot();
    return;
  }

  if (isOperator(key)) {
    appendOperator(key);
    return;
  }

  if (key === "Enter") {
    evaluateExpression();
    return;
  }

  if (key === "Backspace") {
    expression = expression.slice(0, -1);
    refreshDisplay();
    return;
  }

  if (key === "Escape") {
    expression = "";
    refreshDisplay();
    setStatus("Cleared.", "#334155");
  }
});

window.addEventListener("load", function () {
  renderHistory();
  refreshDisplay();
  setStatus("Calculator ready.");
});
