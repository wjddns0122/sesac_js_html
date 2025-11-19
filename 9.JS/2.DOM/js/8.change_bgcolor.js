function changeBGColor() {
    const colors = ["red", "blue", "green"]

    // console.log("배경색 바꾸기");
    if (document.body.style.backgroundColor == colors[0]) {
        document.body.style.backgroundColor = colors[1];
    } else if (document.body.style.backgroundColor == colors[1]) {
        document.body.style.backgroundColor = colors[2];
    } else if (document.body.style.backgroundColor == colors[2]) {
        document.body.style.backgroundColor = colors[0];
    }
}
