let words;
let seed = 0;
let currentGuess = "";
let phrase = "";
let finished = false;
let results = "";
let todaysDay = 0;
let guesses = [];
let remainingLetters = {};

//get the json data from the file (jumble.json)
fetch('jumble.json')
    .then(response => response.text())
    .then(data => {
        words = JSON.parse(data);
        console.log(words);
        loadStuff(words);
        loadGuesses();
        updateKeyboard();

    });

function daysAfter2024() {
    const now = new Date();
    const start = new Date(2024, 2, 27); // Note: JavaScript counts months from 0
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const days = Math.floor(diff / oneDay);
    todaysDay = days;
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
    let theme = words[diff].context;
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


    if (event.target.className.includes("btn-guessed")) {
        console.log("guessed button pressed" + event.target.innerHTML);
        //remove the letter from the current guess
        //work out what number child this is
        let value = Array.prototype.indexOf.call(event.target.parentElement.children, event.target);
        let guessArray = currentGuess.split("");
        let prevValue = guessArray[value];
        guessArray[value] = "_";
        currentGuess = guessArray.join("");
        //switch the class to btn-unclicked
        event.target.className = "btn-unguessed btn-custom";
        updateGuess();
    }

    updateGuess();
    updateKeyboard()
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

function submitPressed() {
    if (finished) {
        return;

    }
    let guessString = "";
    //go through each letter in the current guess
    let guessArray = currentGuess.split("");
    //if there are any _ in the guess, return
    if (guessArray.includes("_")) {
        return;
    }
    let phraseArray = phrase.split("");
    let wordsSplit = phrase.split(" ");
    let currentWord = 0;
    let letterCounts = {};
    let isCorrect = true;
    //do the correct letters first
    for(let i = 0; i < guessArray.length; i++){
        if(guessArray[i] === phraseArray[i]){
            letterCounts[guessArray[i]] = letterCounts[guessArray[i]] ? letterCounts[guessArray[i]] + 1 : 1;
            let guessElement = document.getElementById("jumble guess");
            guessElement.children[i].className = "guess-correct btn-custom";
        }
    }
    for (let i = 0; i < guessArray.length; i++) {
        //if this is a space, skip
        if (phraseArray[i] === " ") {
            currentWord++;
            letterCounts = {};
            continue;
        }
        console.log("Checking " + guessArray[i] + " against " + phraseArray[i] + " in word " + wordsSplit[currentWord])
        //if the letter matches, change the class to guess-correct btn-custom
        if (guessArray[i] === phraseArray[i]) {
            continue;
        } else {
            isCorrect = false;
            if (wordsSplit[currentWord].includes(guessArray[i])) {
                letterCounts[guessArray[i]] = letterCounts[guessArray[i]] ? letterCounts[guessArray[i]] + 1 : 1;
                //check if the letter is in the word at least letterCounts[guessArray[i]] times
                if (wordsSplit[currentWord].split(guessArray[i]).length - 1 >= letterCounts[guessArray[i]]) {
                    //if the letter is in the word, but not enough times, change the class to guess-incorrect btn-custom
                    let guessElement = document.getElementById("jumble guess");
                    guessElement.children[i].className = "guess-correctWord btn-custom";
                }
                //if the letter is wrong, change the class to guess-incorrect btn-custom
                else {
                    let guessElement = document.getElementById("jumble guess");
                    guessElement.children[i].className = "guess-incorrect btn-custom";
                }

            }
            //if the letter is wrong, change the class to guess-incorrect btn-custom
            else {
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i].className = "guess-incorrect btn-custom";
            }
        }
        results += guessString + "\n";
    }

    //rename the jumble guess to jumble guessed
    let guessElement = document.getElementById("jumble guess");
    guessElement.id = "jumble guessed";
    //update the trys remaining
    let trysRemaining = document.getElementById("trys-remaining");
    //loop through the children of trys remaining
    let trysRemainingChildren = trysRemaining.children;
    finished = true;
    for (let i = 0; i < trysRemainingChildren.length; i++) {
        //if the image is dot.png, change it to redDot.png
        if (trysRemainingChildren[i].src.includes("dot.png")) {
            if (isCorrect) {
                trysRemainingChildren[i].src = "icons/greenDot.png";
            } else {
                trysRemainingChildren[i].src = "icons/redDot.png";
                if (i != trysRemainingChildren.length - 1)
                    finished = false;
            }
            break;
        }
    }
    //store the guess
    guesses.push(currentGuess);
    storeGuesses();
    if (finished && !isCorrect) {
        let modal = document.getElementById("lostModal")
        let shareText = document.getElementById("share-text2");
        shareText.innerHTML = generateResults(false);
        let modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    if (isCorrect) {
        //bring up a modal with an image in it
        let modal = document.getElementById("wonModal")
        //set the share-text
        let shareText = document.getElementById("share-text1");
        shareText.innerHTML = generateResults(false);
        let modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        finished = true;
    }

    createInput();
    resetPressed();


}

function resetPressed() {
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
    updateKeyboard();
}

function handleKeyPress(event) {
    if (finished) {
        return;
    }
    //get the key pressed
    let key = "";
    //if event is a string, get the key from the string
    if(typeof event === "string"){
        console.log(event);
        key = event;
    }
    else {
        key = event.key;
    }
    //check if the key is a letter
    if (key.match(/[a-z]/i)) {
        key = key.toUpperCase();
        keyPress(key);
    }
    console.log("key pressed " + key);
    //if the key is backspace
    if (key === "BACKSPACE") {
        console.log("backspace");
        //remove the last non - or _ from the current guess
        let guessArray = currentGuess.split("");
        for (let i = guessArray.length - 1; i >= 0; i--) {
            if (guessArray[i] !== "_" && guessArray[i] !== "-") {
                guessArray[i] = "_";

                break;
            }
        }
        currentGuess = guessArray.join("");
        updateKeyboard();

    }
    updateGuess();
    //if the key is enter
    if (key === "ENTER" || key === "SUBMIT") {
        submitPressed();
    }
    if(key == "RESET")
    {
        resetPressed();
    }
}
function handleButtonPress(key) {
    //get the div that was clicked
    handleKeyPress(key.toUpperCase());
}

function updateLetterCounts() {
    //get the remaining letter counts
    remainingLetters = {};
    //add the letter counts for the phrase
    let phraseArray = phrase.split("");
    for (let i = 0; i < phraseArray.length; i++) {
        if (phraseArray[i] === " ") {
            continue;
        }
        remainingLetters[phraseArray[i]] = remainingLetters[phraseArray[i]] ? remainingLetters[phraseArray[i]] + 1 : 1;
    }
    //subtract the letter counts for the current guess
    let guessArray = currentGuess.split("");
    for (let i = 0; i < guessArray.length; i++) {
        if (guessArray[i] === "_") {
            continue;
        }
        remainingLetters[guessArray[i]] = remainingLetters[guessArray[i]] ? remainingLetters[guessArray[i]] - 1 : -1;
    }
}

function keyPress(key) {
    updateLetterCounts();
    //if the letter is not in the remaining letters, return
    if (!remainingLetters.hasOwnProperty(key)) {
        return;
    }
    if (remainingLetters[key] === 0) {
        return;
    }
    //if we are here we can add the key to the current guess
    let guessArray = currentGuess.split("");
    for (let i = 0; i < guessArray.length; i++) {
        if (guessArray[i] === "_") {
            guessArray[i] = key;
            break;
        }
    }
    currentGuess = guessArray.join("");
    updateKeyboard();
}

function updateKeyboard() {
    updateLetterCounts();
    //get the keys
    let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    //loop through the keys
    for (let i = 0; i < alphabet.length; i++) {
        let key = document.getElementById(alphabet[i]);
        //if the letter is in the letter counts, set the class to btn-unclicked
        if (remainingLetters[alphabet[i].toUpperCase()] > 0) {
            key.className = "btn-unclicked btn-custom";
        } else {
            key.className = "btn-clicked btn-custom";
        }
        //get the counter for this letter
        let counter = document.getElementById(alphabet[i] + "c");
        //set the counter to the letter count
        counter.innerHTML = remainingLetters[alphabet[i].toUpperCase()] > 0 ? remainingLetters[alphabet[i].toUpperCase()] : 0;

    }
}


function generateResults(plaintext) {
    let fullResults = "Jumble " + todaysDay
    fullResults += "<br>";
    fullResults += "Clue: " + words[todaysDay].context;
    console.log(fullResults);
    results = "";
    //construct the results from the guesses
    for (let i = 0; i < guesses.length; i++) {
        let guess = guesses[i];
        let guessArray = guess.split("");
        let phraseArray = phrase.split("");
        let wordsSplit = phrase.split(" ");
        let currentWord = 0;
        //dictionary of letter counts
        let letterCounts = {};
        for (let j = 0; j < guessArray.length; j++) {
            //if this is a space, skip
            if (phraseArray[j] === " ") {
                currentWord++;
                results += "- ";
                letterCounts = {};
                continue;
            }
            //if the letter matches, change the class to guess-correct btn-custom
            if (guessArray[j] === phraseArray[j]) {
                letterCounts[guessArray[j]] = letterCounts[guessArray[j]] ? letterCounts[guessArray[j]] + 1 : 1;

                //green circle emoji
                results += "🟢 "
            } else {
                if (wordsSplit[currentWord].includes(guessArray[j])) {
                    letterCounts[guessArray[j]] = letterCounts[guessArray[j]] ? letterCounts[guessArray[j]] + 1 : 1;
                    //check if the letter is in the word at least letterCounts[guessArray[j]] times
                    if (wordsSplit[currentWord].split(guessArray[j]).length - 1 >= letterCounts[guessArray[j]]) {
                        //yellow circle emoji
                        results += "🟡 "
                    }
                    //if the letter is in the word, but not enough times, change the class to guess-incorrect btn-custom
                    else {
                        results += "🔵 ";
                    }
                }
                //if the letter is wrong, change the class to guess-incorrect btn-custom
                else {
                    results += "🔵 ";
                }
            }
        }
        results += "<br>";
    }
    console.log(results);
    fullResults += "<br>" + results;
    if (plaintext) {
        //go through full results and replace the <br> with \n
        fullResults = fullResults.replace(/<br>/g, "\n");
        //remove any duplicate new lines
        fullResults = fullResults.replace(/\n\n/g, "\n");
    }
    return fullResults;
}

//add the event listener
document.addEventListener("keydown", handleKeyPress);


function storeGuesses() {
    //store the guesses in local storage, set to expire at midnight
    let date = new Date();
    let midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    let expiry = todaysDay;
    //store the guesses
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("expiry", expiry);
}

function loadGuesses() {
    //load the guesses from local storage
    let date = new Date();
    let expiry = localStorage.getItem("expiry");
    if (expiry != todaysDay) {
        //clear the guesses
        guesses = [];
        storeGuesses();
    } else {
        tempGuesses = JSON.parse(localStorage.getItem("guesses"));
        //make the guesses
        //for each guess
        for (let i = 0; i < tempGuesses.length; i++) {
            let guess = tempGuesses[i];
            currentGuess = guess;
            //update the text for the guess
            updateGuess();
            submitPressed();
        }
        guesses = tempGuesses;
    }
}

window.onload = function () {
//on page load, load the guesses
    document.getElementById('shareButton1').addEventListener('click', async () => {
        console.log("share button pressed");
        try {
            //check if sharing is supported
            if (!navigator.share) {
                console.log('Web Share API not supported');
                //copy the results to the clipboard
                navigator.clipboard.writeText(generateResults(true));
                //display a toast
                let toast = document.getElementById("toast");
                toast.className = "show";
                setTimeout(function () {
                    toast.className = toast.className.replace("show", "hidden");
                }, 3000);
                return;
            }
            await navigator.share({
                title: 'Jumble',
                text: generateResults(true),
            });
            console.log('Data was shared successfully');
        } catch (err) {
            console.log('Failed to share:', err);
        }
    });
    document.getElementById('shareButton2').addEventListener('click', async () => {
        try {
            //check if sharing is supported
            if (!navigator.share) {
                console.log('Web Share API not supported');
                //copy the results to the clipboard
                navigator.clipboard.writeText(generateResults(true));
                //display a toast
                let toast = document.getElementById("toast2");
                toast.className = "show";
                setTimeout(function () {
                    toast.className = toast.className.replace("show", "hidden");
                }, 3000);
                return;
            }
            await navigator.share({
                title: 'Jumble',
                text: generateResults(true),
            });
            console.log('Data was shared successfully');
        } catch (err) {
            console.log('Failed to share:', err);
        }
    });
}