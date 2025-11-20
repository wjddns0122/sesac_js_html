
// 1번
// for(let i = 1; i <= 5; i++) {
//     console.log("*".repeat(i));
// }

str = ""
for (let n = 0; n < 5; n ++) {
    str += "*"
    console.log(str)
}

function paintTree1(height) {
    str = ""
    for (let n = 0; n < height + 1; n++) {
        str += "*"
        console.log(str);
    }
}

// 2번
for(let i = 5; i >= 1; i --) {
    console.log("*".repeat(i));
}

// 3번
function printTree3(height) {    
    for (let i = 1; i <= height; i++) {
        let space = " ".repeat(height - i);
        let star = "*".repeat(i);
        console.log(space + star);
    }
}

let height = 5;
printTree3(height)

// 4번
function printTree4(height) {    
    for (let i = 0; i < height; i++) {
        let space = " ".repeat(i);
        let star = "*".repeat(height - i);
        console.log(space + star);
    }
}

// let height = 5;
printTree4(height)

