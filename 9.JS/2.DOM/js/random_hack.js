let low = 1;
let high = 100;

function startAutoGuess() {
    
    let searchBinary = setInterval(() => {
        let guess = Math.floor((low + high) / 2);  // 중간값 계산
        document.getElementById("guessInput").value = guess;  
        document.getElementById("trial").click();  
        if (guess < n) {
            low = guess + 1;  // 추측값보다 작은 경우, 최소값을 증가
        } else if (guess > n) {
            high = guess - 1;  // 추측값보다 큰 경우, 최대값을 감소
        } else {
            clearInterval(searchBinary);  
        }
    });  
}

// 자동으로 숫자 추측 시작
startAutoGuess();