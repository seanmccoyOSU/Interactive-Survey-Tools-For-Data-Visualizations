import questionTypes from "./questionTypes.js"

// change min and max label text based on question type
function ChangeMinMaxText(type, min, max) {
    switch (type.value) {
        case questionTypes[0].label:
            min.textContent = questionTypes[0].minText
            max.textContent = questionTypes[0].maxText
            break;
        case "Select Elements":
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

    // saving without importing a visual
    const saveQuestionButton = document.getElementsByClassName("save-question-button")[0]
    if (saveQuestionButton) {
        saveQuestionButton.addEventListener("click", (event) => {
            // this will make it so the import doesn't send
            event.preventDefault()
            const form = document.getElementsByTagName("form")[0]
            form.elements['visualizationId'].value = ""
            form.submit()
        })
    }

    // removing a visual
    const removeVisualButton = document.getElementsByClassName("remove-visualization-button")[0]
    if (removeVisualButton) {
        removeVisualButton.addEventListener("click", (event) => {
            // negative number removes visualization
            event.preventDefault()
            const form = document.getElementsByTagName("form")[0]
            form.elements['visualizationId'].value = "-1"
            form.submit()
        })
    }
})

