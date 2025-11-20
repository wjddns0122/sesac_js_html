function counting() {
    const guessInput = document.getElementById("guessInput"); 
    const resultDiv = document.getElementById("result"); 
    const historyDiv = document.getElementById("history");

    let m = parseInt(guessInput.value);  

    if (m < n) {
        resultDiv.innerHTML = "Too low!";
        count += 1;
    } else if (m > n) {
        resultDiv.innerHTML = "Too high!";
        count += 1;
    } else {
        resultDiv.innerHTML = "Correct! You guessed the number.";
    }

    guessInput.value = "";
}


const guessInput = document.getElementById("guessInput"); 
const resultDiv = document.getElementById("result"); 
const historyDiv = document.getElementById("history");

while (n == m) {

    let m = parseInt(guessInput.value);  

    if (m < n) {
        resultDiv.innerHTML = "Too low!";
        count += 1;
    } else if (m > n) {
        resultDiv.innerHTML = "Too high!";
        count += 1;
    } else {
        resultDiv.innerHTML = "Correct! You guessed the number.";
    }

    guessInput.value = "";

}


const n = Math.floor(Math.random() * 101);  

function counting() {
    const guessInput = document.getElementById("guessInput"); 
    const resultDiv = document.getElementById("result"); 
    const historyDiv = document.getElementById("history");

    let m = parseInt(guessInput.value);  

    while (n == m) {

        let m = parseInt(guessInput.value);  

        if (m < n) {
            resultDiv.innerHTML = "Too low!";
            count += 1;
            historyDiv.innerHTML = m.toString();
        } else if (m > n) {
            resultDiv.innerHTML = "Too high!";
            count += 1;
        } else {
            resultDiv.innerHTML = "Correct! You guessed the number.";
        }

        guessInput.value = "";
    }
}
