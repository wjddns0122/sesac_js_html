// 1-2번 문제 
function paintTree1(height) {
    str = "";
    for (let n = 0; n < height; n++) {
        str += "*";
        console.log(str);
    }
}

paintTree1(5);

// 1-3번 문제
function drawTriange(num, move) {
    if (move == "left") {
        for (let i = 1; i <= num; i++) {
            console.log("*".repeat(i));
        }
    } else if (move == "right") {
        for (let i = 1; i <= num; i++) {
            let space = " ".repeat(num - i);
            let star = "*".repeat(i);
            console.log(space + star);
        }
    } else if (move == "downLeft") {
        for (let i = num; i >= 1; i--) {
            console.log("*".repeat(i))
        }
    } else if (move == "downRight") {
        for (let i = 0; i < num; i++) {
            let space = " ".repeat(i);
            let star = "*".repeat(num - i);
            console.log(space + star);
        }
    }
}

// drawTriange(5, "left")
// drawTriange(5, "right")
// drawTriange(5, "downLeft")
// drawTriange(5, "downRight")