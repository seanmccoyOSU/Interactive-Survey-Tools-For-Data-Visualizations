document.addEventListener('DOMContentLoaded', () => {
    const requirements = document.getElementById("requirements")
    const required = requirements.getAttribute("required")
    const min = requirements.getAttribute("min")
    const max = requirements.getAttribute("max")
    const questionType = requirements.getAttribute("questionType")

    console.log(required)
    console.log(min)
    console.log(max)
    console.log(questionType)

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

            console.log(total >= min)
            console.log(required == "false")
            console.log(total <= max)
            

            if ((total >= min || required == "false") && total <= max)
                window.location.href = nextButton.getAttribute("href")
        } else {
            window.location.href = nextButton.getAttribute("href")
        }
    })
})

