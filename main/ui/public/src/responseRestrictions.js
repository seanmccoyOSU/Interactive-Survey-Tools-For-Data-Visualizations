import saveAnswer from "./responseSave.js"
import questionTypes from "./questionTypes.js"

document.addEventListener('DOMContentLoaded', () => {
    const requirements = document.getElementById("requirements")
    const required = requirements.getAttribute("required")
    const min = requirements.getAttribute("min")
    const max = requirements.getAttribute("max")
    const questionType = requirements.getAttribute("questionType")
    
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
        const typeInfo = questionTypes.filter(type => type.name == questionType)[0]
        typeInfo.checkRequirement(min, max, required, (failText) => { document.getElementById("error-text").textContent = failText }, goToNextPage)
    })
})



