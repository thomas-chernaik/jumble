let words;
let seed = 0;
let currentGuess = "";
let phrase = "";
let finished = false;

//get the json data from the file (jumble.json)
fetch('jumble.json')
    .then(response => response.text())
    .then(data => {
        words = JSON.parse(data);
        console.log(words);
        loadStuff(words);
    });

function daysAfter2024() {
    const now = new Date();
    const start = new Date(2024, 2, 27); // Note: JavaScript counts months from 0
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const days = Math.floor(diff / oneDay);
    return days;
}

function seededRandom() {
    seed += 1;
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32); // 2^32
    seed = (a * seed + c) % m;
    return seed / m;
}

function jumble(word, seed) {
    let jumbled = "";
    //remove any spaces
    word = word.replace(/\s/g, "");
    //lowercase the word
    word = word.toLowerCase();
    let wordArray = word.split("");
    let wordArrayCopy = wordArray.slice();
    wordArray.sort(() => seededRandom() - 0.5);
    //make sure no letters are in the same place
    let matching = true;
    while (matching) {
        matching = false;
        //check if there are any letters in the same place
        for (let i = 0; i < wordArray.length; i++) {
            if (wordArray[i] === wordArrayCopy[i]) {
                //shuffle the array
                wordArray.sort(() => seededRandom() - 0.5);
                matching = true;
                break;
            }
        }

    }
    jumbled = wordArray.join("");
    return jumbled;
}

function loadStuff(words) {
    //get the day
    let diff = daysAfter2024();
    //get the word of the day
    if (diff > words.length) {
        // output an error message
        document.body.innerHTML = "No word for today, remind my creator to update the words";
        return;
    }
    console.log(diff);
    console.log(words[diff]);
    let theme = words[diff].theme;
    phrase = words[diff].phrase;
    //uppercase phrase
    phrase = phrase.toUpperCase();
    //jumble up the phrase, using a fixed seed
    let jumbled = jumble(phrase, 0);
    console.log(jumbled);
    // set the theme element
    document.getElementById("theme").innerHTML = theme;
    // set the jumbled element
    createJumbledElement(jumbled);

}

function createJumbledElement(jumbled) {
    //create the current guess
    currentGuess = "";
    let phraseArray = phrase.split("");
    for (let i = 0; i < phraseArray.length; i++) {
        if (phraseArray[i] === " ") {
            currentGuess += "-";
        } else {
            currentGuess += "_";
        }
    }
    //create the buttons for each letter
    let jumbledArray = jumbled.split("");
    let jumbledElement = document.getElementById("jumble keyboard");
    for (let i = 0; i < jumbledArray.length; i++) {
        //                <button type="button" class="btn-custom">A</button>
        let button = document.createElement("div");
        button.type = "button";
        button.className = "btn-custom btn-unclicked";
        //make the letter uppercase
        button.innerHTML = jumbledArray[i].toUpperCase();
        //add the event listener
        button.onclick = buttonPressed;

        jumbledElement.appendChild(button);
    }
    //add the submit button
    let submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.className = "btn-submit btn-custom";
    submitButton.innerHTML = "SUBMIT";
    submitButton.onclick = submitPressed;
    jumbledElement.appendChild(submitButton);
    //add the backspace button
    let backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "btn-backspace btn-custom";
    backButton.innerHTML = "RESET";
    backButton.onclick = backspacePressed;
    jumbledElement.appendChild(backButton);
    createInput();
}

function createInput() {
    if (finished) {
        return;
    }
    let phraseArray = phrase.split("");

    //create the input boxes
    let guessGroup = document.getElementById("guess-container");
    let guessElement = document.createElement("div");
    guessElement.className = "group";
    guessElement.role = "group";
    guessElement.ariaLabel = "Button Group";
    guessElement.id = "jumble guess";
    guessGroup.appendChild(guessElement);
    for (let i = 0; i < phraseArray.length; i++) {
        //if this is not a space, add a button
        if (phraseArray[i] !== " ") {
            let button = document.createElement("div");
            //button.type = "button";
            button.className = "btn-unguessed btn-custom";
            //make the letter uppercase
            button.innerHTML = "_";
            //add the event listener
            button.onclick = buttonPressed;
            guessElement.appendChild(button);

        }
        //if this is a space, add a -
        else {
            let dash = document.createElement("div");
            dash.className = "dash";
            dash.innerHTML = "-";
            guessElement.appendChild(dash);
        }
    }
}

function buttonPressed(event) {
    if (finished) {
        return;
    }

    // check if the parent is the keyboard
    if (event.target.parentElement.id === "jumble keyboard") {
        //check if the class contains btn-clicked
        if (event.target.className.includes("btn-clicked")) {
            //remove the letter from the current guess
            let value = event.target.value;
            let guessArray = currentGuess.split("");
            guessArray[value] = "_";
            currentGuess = guessArray.join("");
            //switch the class to btn-unclicked
            event.target.className = "btn-unclicked btn-custom";
            updateGuess();
            return;
        }
        console.log("keyboard button pressed" + event.target.innerHTML);
        //add the letter to the current guess
        let letter = event.target.innerHTML;
        //get the current guess
        let guessArray = currentGuess.split("");
        //replace the first _ with the letter
        for (let i = 0; i < guessArray.length; i++) {
            if (guessArray[i] === "_") {
                guessArray[i] = letter;
                //store the value of i on the element
                event.target.value = i;
                break;
            }
        }
        currentGuess = guessArray.join("");
        //switch the class to btn-clicked
        event.target.className = "btn-clicked btn-custom";
    } else {
        if (event.target.className.includes("btn-guessed")) {
            console.log("guessed button pressed" + event.target.innerHTML);
            //remove the letter from the current guess
            //work out what number child this is
            let value = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);
            let guessArray = currentGuess.split("");
            guessArray[value] = "_";
            currentGuess = guessArray.join("");
            //switch the class to btn-unclicked
            event.target.className = "btn-unguessed btn-custom";
            updateGuess();
            //search through the keyboard and find the letter
            let keyboard = document.getElementById("jumble keyboard");
            let keyboardChildren = keyboard.children;
            for (let i = 0; i < keyboardChildren.length - 2; i++) {
                if (keyboardChildren[i].value === value) {
                    keyboardChildren[i].className = "btn-unclicked btn-custom";
                    break;
                }
            }
        }
    }
    updateGuess();
}

function updateGuess() {
    let guessElement = document.getElementById("jumble guess");
    let guessArray = currentGuess.split("");
    for (let i = 0; i < guessArray.length; i++) {
        if (guessArray[i] === "-") {
            continue;
        }
        guessElement.children[i].innerHTML = guessArray[i];
        if (guessArray[i] === "_") {
            guessElement.children[i].className = "btn-unguessed btn-custom";
        } else {
            guessElement.children[i].className = "btn-guessed btn-custom";
        }
    }
}

function submitPressed(event) {
    if (finished) {
        return;

    }
    //go through each letter in the current guess
    let guessArray = currentGuess.split("");
    //if there are any _ in the guess, return
    if (guessArray.includes("_")) {
        return;
    }
    let phraseArray = phrase.split("");
    let wordsSplit = phrase.split(" ");
    let currentWord = 0;
    let isCorrect = true;
    for (let i = 0; i < guessArray.length; i++) {
        //if this is a space, skip
        if (phraseArray[i] === " ") {
            currentWord++;
            continue;
        }
        console.log("Checking " + guessArray[i] + " against " + phraseArray[i] + " in word " + wordsSplit[currentWord])
        //if the letter matches, change the class to guess-correct btn-custom
        if (guessArray[i] === phraseArray[i]) {
            let guessElement = document.getElementById("jumble guess");
            guessElement.children[i].className = "guess-correct btn-custom";
        } else {
            isCorrect = false;
            if (wordsSplit[currentWord].includes(guessArray[i])) {
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i].className = "guess-correctWord btn-custom";

            }
            //if the letter is wrong, change the class to guess-incorrect btn-custom
            else {
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i].className = "guess-incorrect btn-custom";
            }
        }
    }
    if (isCorrect) {
        //bring up a modal with an image in it
        let modal = document.getElementById("wonModal")
        let modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        finished = true;
    }
    //rename the jumble guess to jumble guessed
    let guessElement = document.getElementById("jumble guess");
    guessElement.id = "jumble guessed";
    createInput();
    backspacePressed(null);
//update the trys remaining
    let trysRemaining = document.getElementById("trys-remaining");
    //loop through the children of trys remaining
    let trysRemainingChildren = trysRemaining.children;
    for (let i = 0; i < trysRemainingChildren.length; i++) {
        //if the image is dot.png, change it to redDot.png
        if (trysRemainingChildren[i].src.includes("dot.png")) {
            if(isCorrect){
                trysRemainingChildren[i].src = "icons/greenDot.png";
            }
            else {
                trysRemainingChildren[i].src = "icons/redDot.png";
            }
            break;
        }
    }


}

function backspacePressed(event) {
    if (finished) {
        return;

    }
    currentGuess = "";
    let phraseArray = phrase.split("");
    for (let i = 0; i < phraseArray.length; i++) {
        if (phraseArray[i] === " ") {
            currentGuess += "-";
        } else {
            currentGuess += "_";
        }
    }
    updateGuess();
    //reset the keyboard
    let keyboard = document.getElementById("jumble keyboard");
    let keyboardChildren = keyboard.children;
    for (let i = 0; i < keyboardChildren.length - 2; i++) {
        keyboardChildren[i].className = "btn-unclicked btn-custom";
    }
}

function handleKeyPress(event) {
    if (finished) {
        return;
    }
    //get the key pressed
    let key = event.key;
    //check if the key is a letter
    if (key.match(/[a-z]/i)) {
        //get the keyboard
        let keyboard = document.getElementById("jumble keyboard");
        let keyboardChildren = keyboard.children;
        for (let i = 0; i < keyboardChildren.length - 2; i++) {
            if (keyboardChildren[i].innerHTML === key.toUpperCase()) {
                if (keyboardChildren[i].className.includes("btn-unclicked")) {
                    keyboardChildren[i].click();
                    break;
                }
            }
        }
    }
    //if the key is backspace
    if (key === "Backspace") {
        console.log("backspace");
        //remove the last non - or _ from the current guess
        let guessArray = currentGuess.split("");
        for (let i = guessArray.length - 1; i >= 0; i--) {
            if (guessArray[i] !== "_" && guessArray[i] !== "-") {
                guessArray[i] = "_";
                //switch the keyboard button to unclicked
                let keyboard = document.getElementById("jumble keyboard");
                let keyboardChildren = keyboard.children;
                for (let j = 0; j < keyboardChildren.length - 2; j++) {
                    if (keyboardChildren[j].value === i) {
                        keyboardChildren[j].className = "btn-unclicked btn-custom";
                        break;
                    }
                }

                break;
            }
        }
        currentGuess = guessArray.join("");

    }
    updateGuess();
    //if the key is enter
    if (key === "Enter") {
        let submitButton = document.querySelector(".btn-submit");
        submitButton.click();
    }
}

//add the event listener
document.addEventListener("keydown", handleKeyPress);