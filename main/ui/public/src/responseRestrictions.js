import saveAnswer from "./responseSave.js"

document.addEventListener('DOMContentLoaded', () => {
    const requirements = document.getElementById("requirements")
    const required = requirements.getAttribute("required")
    const min = requirements.getAttribute("min")
    const max = requirements.getAttribute("max")
    const questionType = requirements.getAttribute("questionType")

    

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

    function goToNextPage() {
        saveAnswer(() => {
            const questionNumber = document.getElementById("questionNumber").getAttribute("number")
            const questionTotal = document.getElementById("questionTotal").getAttribute("total")

            if (questionNumber == questionTotal) {
                const style = document.createElement('style')
                style.innerHTML = '*{cursor: wait !important;}'
                document.head.appendChild(style)
                setTimeout(() => {window.location.href = nextButton.getAttribute("href")}, 3000)
            } else {
                window.location.href = nextButton.getAttribute("href")
            }
        })
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

    // if recieve a message from iframe, it might be for the selected element count check
    window.addEventListener('message', (event) => {
        if (event.origin === visualURL && event.data.type == "count") {
            const count = parseInt(event.data.count)
        
            if (max > 0 && count > max) {
                document.getElementById("error-text").textContent = `You cannot select more than ${max} elements`
            } else if (min > 0 && count < min && required == "true") {
                document.getElementById("error-text").textContent = `You must select at least ${min} elements`
            } else {
                goToNextPage()
            }
        } 
    })
})



