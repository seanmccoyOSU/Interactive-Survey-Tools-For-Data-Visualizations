// change min and max label text based on question type
function ChangeMinMaxText(type, min, max) {
    switch (type.value) {
        case "Multiple Choice":
            min.textContent = "Minimum required selections: "
            max.textContent = "Maximum allowed selections: "
            break;
        case "Short Answer":
            min.textContent = "Minimum required characters: "
            max.textContent = "Maximum allowed characters: "
            break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // show appropriate content based on specified question type
    const questionType = document.getElementById("type")
    if (questionType) {
        const minLabel = document.getElementById("min-label")
        const maxLabel = document.getElementById("max-label")
        const multiChoiceSections = document.getElementById("multiple-choice-section")
        ChangeMinMaxText(questionType, minLabel, maxLabel)
        if (questionType.value == "Multiple Choice") {
            multiChoiceSections.removeAttribute("hidden")
        }

        questionType.addEventListener("change", () => {
            ChangeMinMaxText(questionType, minLabel, maxLabel)
            if (questionType.value == "Multiple Choice") {
                multiChoiceSections.removeAttribute("hidden")
            } else {
                multiChoiceSections.setAttribute("hidden", "true")
            }

        })
    }
})

