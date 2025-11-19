function randomBGColor() {
    return Math.floor(Math.random() * 256);  // 0부터 255 사이의 랜덤 숫자 생성
}

function changeBGColor() {
    let rgb = `rgb(${randomBGColor()}, ${randomBGColor()}, ${randomBGColor()})`;  // 랜덤 RGB 값 생성
    document.body.style.background = rgb;  // 배경 색상 변경
    let count = document.getElementById("rgb");  // RGB 값을 표시할 요소
    count.innerHTML = `HEX: ${rgbToHex(rgb)}<br>RGB: ${rgb}`;  // HEX 값과 RGB 값 표시
}

// RGB 값을 HEX로 변환하는 함수
function rgbToHex(rgb) {
    let result = rgb.match(/\d+/g);  // RGB 숫자값을 추출
    let r = parseInt(result[0]).toString(16).padStart(2, '0');
    let g = parseInt(result[1]).toString(16).padStart(2, '0');
    let b = parseInt(result[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
}