function mouseClick() {
    console.log('클릭됌');
}

const myButton = document.getElementById("myButton");
myButton.addEventListener('click', mouseClick());

// 1. 돔을 가져온다
// 2. 원하는 이벤트를 등록한다
// 3. 그 이벤트가 발생했을떄 처리할 콜백함수를 등록한다.
// 4. 그럼?? 이벤트가 발생했을때 그 함수로 이어져서 실행이됌.(비돋기적으로)