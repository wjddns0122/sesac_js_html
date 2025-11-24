const guesses = [10, 20, 50, 70, 80, 90];

const inputBox = document.getElementById("guessInput");
const trialButton = document.getElementById("trial");

for (let i = 1; i <= 100; i++) {
    inputBox.value = i;
    trialButton.click();
}

///////////////////////////

function 내함수() {
    console.log("출력");
}

setInterval(내함수, 1000);      // 내함수를 1000ms 만큼ㅂ 실행 1000ms = 1s

//////////////////////////

function myLateFunction() {
    console.log("출력");
    clearInterval(timerId);
}

const timerId = setInterval(function myLateFunction() {
    console.log("출력");
    clearInterval(timerId);
}, 1000);

/////////////////////////

const timerId2 = setInterval(() => {
    console.log("출력");
    clearInterval(timerId2);
}, 1000);


for (let v of guesses) {
    inputBox.value = v;
    trialButton.click()
}

//////////////////////////////

const guesses1 = [10, 20, 50, 70, 80, 90];
let index = 0;

// const inputBox = document.getElementById("guessInput");
// const trialButton = document.getElementById("trial");

const timerId3 = setInterval(() =>{
    inputBox.value = guesses1[index];
    console.log("입력시도: ", inputBox.value);
    index++;
    trialButton.click()

    if (index == guesses1.length) {
        clearInterval(timerId3)
    }
   }, 1000);