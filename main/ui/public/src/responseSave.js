// gets the text of every answer that was checked as a single string, comma separated 
// sends response to callback
function getMultipleChoiceResponse(onGet) {
    const boxes = document.getElementsByClassName("multiple-choice-box")

    let response = ""
    for (const box of boxes) {
        if (box.checked) {
            response += box.value + ','
        }
    }

    if (response == "")
        onGet(response)
    else
        onGet(response.slice(0, -1))
}

// gets whatever the user has input into the short answer box
// sends response to callback
function getShortAnswerResponse(onGet) {
    // simply return the value of the short answer box
    onGet(document.getElementsByClassName("answer-entry-box")[0].value)
}

// gets the visualId of every visual element that was selected, comma separated
// sends response to callback
function getSelectElementResponse(onGet) {
    // the visualization is in an iframe
    // we need to send a request message to the iframe for the ids
    // then wait for a response that contains the ids
    const visualURL = document.getElementById("visualURL").getAttribute("url")
    const visualWindow = document.getElementById("displayedImage").contentWindow

    // if receive a message from iframe, it might be for the ids of visual elements
    window.addEventListener('message', (event) => {
        if (event.origin === visualURL && event.data.type == "ids") {
            let response = ""
            for (const id of event.data.ids) {
                response += id + ','
            }
        
            if (response == "")
                onGet(response)
            else
                onGet(response.slice(0, -1))
        }
    })

    // send message to iframe to get selected element ids
    visualWindow.postMessage("ids", visualURL)
}


// save answer as a cookie
export default function saveAnswer(onDoneSaving) {
    const requirements = document.getElementById("requirements")
    const questionType = requirements.getAttribute("questionType")
    const number = requirements.getAttribute("number")

    // get comment, if available
    let comment = ""
    if (document.getElementsByClassName("comment-entry-box").length > 0) {
        comment = document.getElementsByClassName("comment-entry-box")[0].value
    }

    // callback func for after getting response, sends answer to cookie
    function sendToCookie(response) {
        // this fetch request saves the answer to a cookie
        fetch(window.location.href, { 
            method: "PATCH",
            body: JSON.stringify({
                answer: {questionNumber: number, comment: comment, response: response}
            }),
            headers: {
                "Content-type": "application/json",
            },    
        })

        // callback
        onDoneSaving()
    }

    // get response, format of response depends on response type
    switch (questionType) {
        case "Multiple Choice":
            getMultipleChoiceResponse(sendToCookie)
            break;
        case "Short Answer":
            getShortAnswerResponse(sendToCookie)
            break;
        case "Select Elements":
            getSelectElementResponse(sendToCookie)
            break;
        default:
            console.warn("unable to save answer due to unknown question type")
            onDoneSaving()
    }
}