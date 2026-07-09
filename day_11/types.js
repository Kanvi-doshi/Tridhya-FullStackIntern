"use strict";
let display = document.getElementById("display");
const operators = "+-*/%";
const operatorWithBracket = "+-*/%(";
function bracketCount(text) {
    return {
        open: (text.match(/\(/g) || []).length,
        close: (text.match(/\)/g) || []).length,
    };
}
function solve(state) {
    const b = state.values.pop();
    const a = state.values.pop();
    const op = state.operatorsStack.pop();
    state.values.push(operation(a, b, op));
}
function add(value) {
    const text = display.value;
    const last = text[text.length - 1];
    if (text === "") {
        if ("+*/%)".includes(value))
            return;
        if (value == ".") {
            display.value = "0.";
            return;
        }
        display.value += value;
        return;
    }
    if (value === ".") {
        if (operatorWithBracket.includes(last)) {
            display.value += "0.";
            return;
        }
        let current = text.split(/[+\-*/()%]/).pop() ?? "";
        if (current.includes("."))
            return;
    }
    if (operators.includes(value)) {
        if (value == "-" && operatorWithBracket.includes(last)) {
            display.value += value;
            return;
        }
        if (operators.includes(last)) {
            display.value = text.slice(0, -1) + value;
            return;
        }
    }
    if (value == ")") {
        let { open, close } = bracketCount(text);
        if (open <= close)
            return;
        if (operatorWithBracket.includes(last))
            return;
    }
    if ("0123456789".includes(value) && last === ")")
        return;
    display.value += value;
}
function addBracket() {
    const text = display.value;
    let { open, close } = bracketCount(text);
    if (open == close) {
        display.value += "(";
    }
    else {
        display.value += ")";
    }
}
function clearDisplay() {
    display.value = "";
}
function deleteLast() {
    display.value = display.value.slice(0, -1);
}
function answer() {
    if (display.value == "")
        return;
    try {
        display.value = `${calculate(display.value)}`;
    }
    catch {
        display.value = "Error";
    }
}
function calculate(exp) {
    const state = {
        values: [],
        operatorsStack: [],
    };
    let i = 0;
    while (i < exp.length) {
        const ch = exp[i];
        if (ch === " ") {
            i++;
            continue;
        }
        if (ch === "(") {
            state.operatorsStack.push(ch);
            i++;
        }
        else if (/^\d$/.test(ch) ||
            ch == "." ||
            (ch == "-" &&
                (i == 0 || exp[i - 1] == "(" || operators.includes(exp[i - 1])))) {
            let num = "";
            if (ch == "-") {
                num += "-";
                i++;
            }
            while (i < exp.length && (/^\d$/.test(exp[i]) || exp[i] == ".")) {
                num += exp[i];
                i++;
            }
            state.values.push(parseFloat(num));
        }
        else if (ch == ")") {
            while (state.operatorsStack.length &&
                state.operatorsStack[state.operatorsStack.length - 1] != "(") {
                solve(state);
            }
            state.operatorsStack.pop();
            i++;
        }
        else {
            while (state.operatorsStack.length &&
                priority(state.operatorsStack[state.operatorsStack.length - 1]) >=
                    priority(ch)) {
                solve(state);
            }
            state.operatorsStack.push(ch);
            i++;
        }
    }
    while (state.operatorsStack.length) {
        solve(state);
    }
    return parseFloat(state.values[0].toFixed(10));
}
function priority(op) {
    if (op == "+" || op == "-")
        return 1;
    if (op == "*" || op == "/" || op == "%")
        return 2;
    return 0;
}
function operation(a, b, op) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        case "%":
            return a % b;
        default:
            throw new Error("Invalid operator");
    }
}
document.addEventListener("keydown", function (e) {
    if (/^\d$/.test(e.key) || "+-*/.%()".includes(e.key)) {
        add(e.key);
    }
    if (e.key == "Enter") {
        e.preventDefault();
        answer();
    }
    if (e.key == "Backspace") {
        deleteLast();
    }
    if (e.key == "Escape") {
        clearDisplay();
    }
});
