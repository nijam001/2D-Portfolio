//to hold function 

export function displayDialogue(text, onDisplayEnd){
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
    const closebtn = document.getElementById("close");

    dialogueUI.style.display = "block"; //to show the textbox container visible

    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index]; // append text
            dialogue.innerHTML = currentText;
            index++;
        } else {
            clearInterval(intervalRef);
        }
    }, 5);

    closebtn.addEventListener("click", onCloseBtnClick);

    //function to close the textbox
    function onCloseBtnClick(){
        onDisplayEnd();
        dialogueUI.style.display = "none"; //to hide textbox
        dialogue.innerHTML = ""; // reset dialogue for next use
        clearInterval(intervalRef);
        closebtn.removeEventListener("click", onCloseBtnClick); //remove itself
    }
}

export function setCamScale(k){
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1){
        k.CamScale(k.vec2(1));
        return;
    }
    k.camScale(k.vec2(1.5));

}