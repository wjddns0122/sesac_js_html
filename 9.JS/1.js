// 데이터 타입

let number = 10;    // 숫자 (number - integer / float)
let text = "글자";  // 문자 (String)
let isStudent = true;   // 불리언 (boolean)
let emptyValue = null;  // 널 (null)

let notDefined;         // 언디파인드 (undefined)

if (score >= 90) {
    console.log('A');
}  else if (score >= 80) {
    console.log('B');
} else if (score >= 70) {
    console.log('C');
} else {
    console.log('D');
}

// FOR 문법

// for(시작값, 처리종료조건, 처리하는동안의변경되는변수) {
//     중간로직구현하는곳
// }

for (i = 0; i < 10; i++) {
    console.log("이건뭘까");
}

for (i = 0; i < 10; i++) {
    console.log("이건뭘까" + i);
}

// 버그 발생 (무한 실행) 반복조건은 종료조건의 무조건 유의할것
for (i = 0; i < 100; i) {
    console.log()
}

// do .. while 구조
let count = 1;
while (count <= 5) {
    console.log(count);
    count += 1;
}

count = 1
do {
    console.log(count);
    count += 1;
} while (count <= 5);

// 구구단 2단 출력
cnt = 1
while (cnt <= 9) {
    console.log("2 x" + cnt );
}

for (i = 1; i <= 9; i++) {
    console.log("7 x " + i + " = " + 7 * i);
}

for (i = 1; i <= 9; i++) {
    console.log("5 x " + i + " = " + 5 * i);
}


dan = 2;
for (i = 1; i <= 9; i++) {
    console.log(dan + " x " + i + " = " + (dan * i))
} 


// 함수 (function)
function multiply(num) {
    for (i = 1; i <= 9; i++) {
        console.log(num + " x " + i + " = " + (num * i))
    }
}