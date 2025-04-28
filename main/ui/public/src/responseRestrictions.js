document.addEventListener('DOMContentLoaded', () => {
    let doneSavingElements
    const requirements = document.getElementById("requirements")
    const required = requirements.getAttribute("required")
    const min = requirements.getAttribute("min")
    const max = requirements.getAttribute("max")
    const questionType = requirements.getAttribute("questionType")
    const number = requirements.getAttribute("number")
    const visualURL = document.getElementById("visualURL")?.getAttribute("url")

    const nextButton = document.getElementById("next-button")
    const prevButton = document.getElementById("prev-button")

    // for short answers, display character count
    if (questionType == "Short Answer") {
        const currentChars = document.getElementById("current-characters")
        const answer = document.getElementsByClassName("answer-entry-box")[0]
        currentChars.textContent = answer.value.length

        answer.addEventListener("input", (evt) => {
            currentChars.textContent = evt.target.value.length
        })
    }

    // save answer as a cookie
    function saveAnswer(doneSaving) {
        let comment = ""
        if (document.getElementsByClassName("comment-entry-box").length > 0) {
            comment = document.getElementsByClassName("comment-entry-box")[0].value
        }

        let response = ""
        if (questionType == "Select Element") {
            const visualWindow = document.getElementById("displayedImage").contentWindow

            // send message to iframe to get selected element ids
            doneSavingElements = doneSaving
            visualWindow.postMessage("ids", visualURL) 
        } else {
            if (questionType == "Short Answer") {
                response = document.getElementsByClassName("answer-entry-box")[0].value
            } else if (questionType == "Multiple Choice") {
                const boxes = document.getElementsByClassName("multiple-choice-box")
    
                for (let box of boxes) {
                    if (box.checked) {
                        if (response == "")
                            response = box.value
                        else
                            response += `,${box.value}`
                    }
                }
            }    
    
            fetch(window.location.href, { 
                method: "PATCH",
                body: JSON.stringify({
                    answer: {questionNumber: number, comment: comment, response: response}
                }),
                headers: {
                    "Content-type": "application/json",
                },    
            })
            doneSaving()
        }
        
    }

    function goToNextPage() {
        saveAnswer(() => { window.location.href = nextButton.getAttribute("href") })

        
    }

    function goToPrevPage() {
        saveAnswer(() => {window.location.href = prevButton.getAttribute("href")})
    }

    prevButton.addEventListener('click', goToPrevPage)

    // on clicking the next button, check for restrictions
    nextButton.addEventListener('click', () => {
        if (questionType == "Multiple Choice") {
            const boxes = document.getElementsByClassName("multiple-choice-box")
            let total = 0
            for (let box of boxes) {
                if (box.checked) {
                    total += 1
                }
            }

            if (max > 0 && total > max) {
                document.getElementById("error-text").textContent = `You cannot select more than ${max} choices`
            } else if (min > 0 && total < min && required == "true") {
                document.getElementById("error-text").textContent = `You must select at least ${min} choices`
            } else {
                goToNextPage()
            }
        } else if (questionType == "Short Answer") {
            const answer = document.getElementsByClassName("answer-entry-box")[0]

            if (max > 0 && answer.value.length > max) {
                document.getElementById("error-text").textContent = `Your answer may not exceed ${max} characters`
            } else if (min > 0 && answer.value.length < min && required == "true") {
                document.getElementById("error-text").textContent = `Your answer must be at least ${min} characters`
            } else {
                goToNextPage()
            }
        } else if (questionType == "Select Elements") {
            const visualWindow = document.getElementById("displayedImage").contentWindow

            // send message to iframe to get selected element count
            visualWindow.postMessage("count", visualURL) 
        } else {
            goToNextPage()
        }
    })

    // if recieve a message from iframe, that's for the selected element count check
    window.addEventListener('message', (event) => {
        if (event.origin === visualURL) {
            if (event.data.count) {
                const count = parseInt(event.data.count)
            
                if (max > 0 && count > max) {
                    document.getElementById("error-text").textContent = `You cannot select more than ${max} elements`
                } else if (min > 0 && count < min && required == "true") {
                    document.getElementById("error-text").textContent = `You must select at least ${min} elements`
                } else {
                    goToNextPage()
                }
            } else if (event.data.ids) {
                response = ""

                for (let id of event.data.ids) {
                    if (response == "")
                        response = id
                    else
                        response += `,${id}`
                }

                fetch(window.location.href, { 
                    method: "PATCH",
                    body: JSON.stringify({
                        answer: {questionNumber: number, comment: comment, response: response}
                    }),
                    headers: {
                        "Content-type": "application/json",
                    }    
                })
                doneSavingElements()
            }
        }
    })
})



