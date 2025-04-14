document.addEventListener('DOMContentLoaded', () => {
    const requirements = document.getElementById("requirements")
    const required = requirements.getAttribute("required")
    const min = requirements.getAttribute("min")
    const max = requirements.getAttribute("max")
    const questionType = requirements.getAttribute("questionType")

    const nextButton = document.getElementById("next-button")

    nextButton.addEventListener('click', () => {
        if (questionType == "Multiple Choice") {
            const boxes = document.getElementsByClassName("multiple-choice-box")
            let total = 0
            for (let box of boxes) {
                if (box.checked) {
                    total += 1
                }
            }

            if (total > max) {
                document.getElementById("error-text").textContent = `You cannot select more than ${max} choices`
            } else if (total < min && required == "true") {
                document.getElementById("error-text").textContent = `You must select at least ${min} choices`
            } else {
                window.location.href = nextButton.getAttribute("href")
            }
        } else if (questionType == "Short Answer") {
            const answer = document.getElementsByClassName("answer-entry-box")[0]

            if (answer.value.length > max) {
                document.getElementById("error-text").textContent = `Your answer may not exceed ${max} characters`
            } else if (answer.value.length < min && required == "true") {
                document.getElementById("error-text").textContent = `Your answer must be at least ${min} characters`
            } else {
                window.location.href = nextButton.getAttribute("href")
            }
        } else {
            window.location.href = nextButton.getAttribute("href")
        }
    })
})

