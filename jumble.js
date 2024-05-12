let words;
let seed = 0;
let currentGuess = "";
let phrase = "";
let finished = false;
let results = "";
let todaysDay = 0;
let guesses = [];
let remainingLetters = {};
let playingArchive = false;
let archiveDate = Date.now();
let needToShowModal = null;

//get the json data from the file (jumble.json)
fetch('jumble.json')
    .then(response => response.text())
    .then(data => {
        words = JSON.parse(data);
        console.log(words);
        loadStuff(words);
        loadGuesses();
        updateKeyboard();
        generateArchiveLinks();

    });

function generateArchiveLinks() {
    //get the current day
    daysAfter2024();

    let archiveLinks = document.getElementById("archive-links");
    //make it a bootstrap 3xn grid, styled as cards
    let row = document.createElement("div");
    row.className = "row";
    let count = 0;
    for (let i = 0; i < todaysDay; i++) {
        let col = document.createElement("div");
        col.className = "col";
        let link = document.createElement("a");
        link.href = "index.html?archive=" + i;
        link.className = "card archive-card";
        link.innerHTML = "Archive day " + i;
        col.appendChild(link);
        row.appendChild(col);
        count++;
        if (count === 3) {
            archiveLinks.appendChild(row);
            row = document.createElement("div");
            row.className = "row";
            count = 0;
        }
    }
}

function daysAfter2024() {
    //check and see if we are playing an archive game from the url parameters
    const urlParams = new URLSearchParams(window.location.search);
    const archive = parseInt(urlParams.get('archive'));

    const now = new Date();
    const start = new Date(2024, 2, 27); // Note: JavaScript counts months from 0
    let diff = now - start;
    //subtract the timezone offset
    diff -= now.getTimezoneOffset() * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    const days = Math.floor(diff / oneDay);
    todaysDay = days;
    if (archive) {
        //delete the play screen
        removeElement("play", 0);
        playingArchive = true;
        archiveDate = new Date(start);
        archiveDate.setDate(archiveDate.getDate() + archive);

        return archive;
    }
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

function jumble(word) {
    let jumbled;
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
    document.getElementById("todays-number").innerHTML = diff;
    if (playingArchive) {
        let options = {year: 'numeric', month: 'long', day: 'numeric'};
        document.getElementById("archive").innerHTML = "Playing archive game from " + archiveDate.toLocaleDateString('default', options);
        //add the archiveCard class to the archive element
        document.getElementById("archive").className = "archive-date";
    }
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
    let jumbled = jumble(phrase);
    console.log(jumbled);
    // set the theme element
    document.getElementById("theme").innerHTML = theme;
    // set the jumbled element
    createJumbledElement();

}

function createJumbledElement() {
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
    let wordElement = document.createElement("div");
    wordElement.className = "group";
    wordElement.role = "group";
    wordElement.ariaLabel = "Button Group";
    for (let i = 0; i < phraseArray.length; i++) {
        //if this is not a space, add a button
        if (phraseArray[i] !== " ") {
            let button = document.createElement("div");
            //button.type = "button";
            button.className = "btn-unguessed btn-custom";
            //make the letter uppercase
            button.innerHTML = "_";
            //add the event listener
            //button.onclick = buttonPressed;
            wordElement.appendChild(button);

        }
        //if this is a space, add a -
        else {
            guessElement.appendChild(wordElement);
            wordElement = document.createElement("div");
            wordElement.className = "group";
            wordElement.role = "group";
            wordElement.ariaLabel = "Button Group";
            let dash = document.createElement("div");
            dash.className = "dash";
            dash.innerHTML = "-";
            guessElement.appendChild(dash);
        }
    }
    guessElement.appendChild(wordElement);
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
    let wordindex = 0;
    let currentword = 0;
    for (let i = 0; i < guessArray.length; i++) {
        if (guessArray[i] === "-") {
            currentword += 2;
            wordindex = 0;
            continue;
        }
        guessElement.children[currentword].children[wordindex].innerHTML = guessArray[i];
        if (guessArray[i] === "_") {
            guessElement.children[currentword].children[wordindex].className = "btn-unguessed btn-custom";
        } else {
            guessElement.children[currentword].children[wordindex].className = "btn-guessed btn-custom";
        }
        wordindex++;
    }
}

function submitPressed() {
    if (finished) {
        return;

    }
    //go through each letter in the current guess
    let guessArray = currentGuess.split("");
    //if there are any _ in the guess, return
    if (guessArray.includes("_")) {
        return;
    }
    let wordsSplit = phrase.split(" ");

    console.log(wordsSplit);
    let isCorrect = true;
    //for each word in the phrase
    for (let i = 0; i < wordsSplit.length; i++) {
        console.log(wordsSplit[i]);
        //calculate the word offset (sum of the lengths of the previous words)
        let wordOffset = 0;
        for (let j = 0; j < i; j++) {
            wordOffset += wordsSplit[j].length;
            wordOffset++;
        }
        //create a letter histogram for the word
        let letterHistogram = {};
        for (let j = 0; j < wordsSplit[i].length; j++) {
            letterHistogram[wordsSplit[i][j]] = letterHistogram[wordsSplit[i][j]] ? letterHistogram[wordsSplit[i][j]] + 1 : 1;
        }
        //look for correct letters
        for (let j = 0; j < wordsSplit[i].length; j++) {
            if (guessArray[j + wordOffset] === wordsSplit[i][j]) {
                letterHistogram[guessArray[j + wordOffset]]--;
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i * 2].children[j].className = "guess-correct btn-custom";
            }
        }
        //look for correct letters in the wrong place
        for (let j = 0; j < wordsSplit[i].length; j++) {
            if (guessArray[j + wordOffset] === wordsSplit[i][j]) {
                continue;
            }
            isCorrect = false;
            console.log("guessArray[j + wordOffset] " + guessArray[j + wordOffset]);
            console.log("letterHistogram[guessArray[j + wordOffset]] " + letterHistogram[guessArray[j + wordOffset]])
            if (letterHistogram[guessArray[j + wordOffset]] > 0) {
                letterHistogram[guessArray[j + wordOffset]]--;
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i * 2].children[j].className = "guess-correctWord btn-custom";
            } else {
                let guessElement = document.getElementById("jumble guess");
                guessElement.children[i * 2].children[j].className = "guess-incorrect btn-custom";
            }
        }
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
                if (i !== trysRemainingChildren.length - 1)
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
        //check if the play element is still there
        if (document.getElementById("play") !== null) {
            needToShowModal = modalInstance;
        } else {
            modalInstance.show();
        }
    }
    if (isCorrect) {
        //bring up a modal with an image in it
        let modal = document.getElementById("wonModal")
        //set the share-text
        let shareText = document.getElementById("share-text1");
        shareText.innerHTML = generateResults(false);
        let modalInstance = new bootstrap.Modal(modal);
        if (document.getElementById("play") !== null) {
            needToShowModal = modalInstance;
        } else {
            modalInstance.show();
        }
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
    let key;
    //if event is a string, get the key from the string
    if (typeof event === "string") {
        console.log(event);
        key = event;
    } else {
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
    if (key === "RESET") {
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
    let today = daysAfter2024();
    let fullResults = "Oops, I spilled my phrase " + today + " " + guesses.length + "/6";
    fullResults += "<br>";
    fullResults += "Clue: " + words[today].context;
    console.log(fullResults);
    results = "";
    //construct the results from the guesses
    for (let k = 0; k < guesses.length; k++) {
        let guess = guesses[k];
        console.log(guess);
        let guessArray = guess.split("");
        let wordsSplit = phrase.split(" ");
        let resultsArray = [];
        for (let i = 0; i < guessArray.length; i++) {
            if (guessArray[i] === "-") {
                resultsArray.push("-");
            } else {
                resultsArray.push("_");
            }
        }

        //for each word in the phrase
        for (let i = 0; i < wordsSplit.length; i++) {

            //calculate the word offset (sum of the lengths of the previous words)
            let wordOffset = 0;
            for (let j = 0; j < i; j++) {
                wordOffset += wordsSplit[j].length;
                wordOffset++;
            }
            //create a letter histogram for the word
            let letterHistogram = {};
            for (let j = 0; j < wordsSplit[i].length; j++) {
                letterHistogram[wordsSplit[i][j]] = letterHistogram[wordsSplit[i][j]] ? letterHistogram[wordsSplit[i][j]] + 1 : 1;
            }
            //look for correct letters
            for (let j = 0; j < wordsSplit[i].length; j++) {
                if (guessArray[j + wordOffset] === wordsSplit[i][j]) {
                    letterHistogram[guessArray[j + wordOffset]]--;
                    console.log("correct letter " + guessArray[j + wordOffset]);
                    //replace the _ with the emoji
                    resultsArray[j + wordOffset] = "🟢";
                }
            }
            //look for correct letters in the wrong place
            for (let j = 0; j < wordsSplit[i].length; j++) {
                if (guessArray[j + wordOffset] === wordsSplit[i][j]) {
                    continue;
                }
                if (letterHistogram[guessArray[j + wordOffset]] > 0) {
                    letterHistogram[guessArray[j + wordOffset]]--;
                    //yellow circle emoji
                    resultsArray[j + wordOffset] = "🟡";
                } else {
                    //blue circle emoji
                    resultsArray[j + wordOffset] = "🔵";
                }
            }
        }
        //add the results to the results string
        for (let i = 0; i < resultsArray.length; i++) {
            results += resultsArray[i];
            console.log(resultsArray[i]);
            console.log(results);
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
    if (playingArchive) {
        return;
    }
    //store the guesses in local storage, set to expire at midnight
    let expiry = todaysDay;
    //store the guesses
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("expiry", expiry);
}

function loadGuesses() {
    if (playingArchive) {
        return;
    }
    console.log("loading guesses");
    //load the guesses from local storage
    let expiry = localStorage.getItem("expiry");
    //convert the expiry to a number
    expiry = parseInt(expiry);
    let tempGuesses;
    if (expiry !== todaysDay) {
        console.log(expiry);
        console.log(todaysDay);
        console.log("expiry date has passed");
        //clear the guesses
        guesses = [];
        storeGuesses();
    } else {
        tempGuesses = JSON.parse(localStorage.getItem("guesses"));
        //make the guesses
        //for each guess
        for (let i = 0; i < tempGuesses.length; i++) {
            currentGuess = tempGuesses[i];
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
            //check if sharing is supported, or we are on firefox mobile (firefox mobile share is broken)
            if (!navigator.share || navigator.userAgent.includes("Firefox")) {
                console.log('Web Share API not supported');
                //copy the results to the clipboard
                await navigator.clipboard.writeText(generateResults(true));
                //display a toast
                let toast = document.getElementById("toast");
                toast.className = "show";
                setTimeout(function () {
                    toast.className = toast.className.replace("show", "hidden");
                }, 3000);
                return;
            }
            let res = generateResults(true);
            await navigator.share({
                title: 'Oops, I spilled my phrase',
                text: res,
            });
            console.log('Data was shared successfully');
        } catch (err) {
            console.log('Failed to share:', err);
        }
    });
    document.getElementById('shareButton2').addEventListener('click', async () => {
        try {
            //check if sharing is supported, or we are on firefox mobile (firefox mobile share is broken)
            if (!navigator.share || navigator.userAgent.includes("Firefox")) {
                console.log('Web Share API not supported');
                //copy the results to the clipboard
                await navigator.clipboard.writeText(generateResults(true));
                //display a toast
                let toast = document.getElementById("toast2");
                toast.className = "show";
                setTimeout(function () {
                    toast.className = toast.className.replace("show", "hidden");
                }, 3000);
                return;
            }
            let res = generateResults(true);
            await navigator.share({
                title: 'Oops, I spilled my phrase',
                text: res,
            });
            console.log('Data was shared successfully');
        } catch (err) {
            console.log('Failed to share:', err);
        }
    });
    //get todays date
    let today = new Date();
    let dd = today.getDate();
    //get it in Monday 20th March 2024 format
    let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    let date = today.toLocaleDateString('default', options);
    //set the date element
    document.getElementById("todays-date").innerHTML = date;


}

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    let expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/";
}

function removeElement(elementId, delay = 1000) {
    // Get the element
    var element = document.getElementById(elementId);

    // If the element exists, start the fade out process
    if (element) {
        // Add the fade-out class to start the transition
        element.classList.add('fade-out');

        // Wait for the transition to finish (1s) then remove the element
        setTimeout(function () {
            element.remove();
        }, delay);
    }
}

function play() {
    removeElement("play");
    //add a cookie to count the number of times this page has been visited
    let visits = parseInt(getCookie("visits"));
    if (isNaN(visits)) {
        visits = 0;
    }
    visits++;
    //set the cookie to expire in 7 days

    setCookie("visits", visits, 7);
    //if the visits are less than 3, show the help modal
    if (visits < 3) {
        let modal = document.getElementById("helpModal");
        let modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    if (needToShowModal !== null) {
        needToShowModal.show();
    }
}