import questionTypes from "./questionTypes.mjs"

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
        }).then(onDoneSaving)

        // callback
        //onDoneSaving()
    }

    // get response, format of response depends on response type
    const typeInfo = questionTypes.filter(type => type.name == questionType)[0]
    typeInfo.getResponse(sendToCookie)
}