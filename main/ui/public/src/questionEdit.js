import questionTypes from "./questionTypes.mjs"

document.addEventListener('DOMContentLoaded', () => {
    // show appropriate content based on specified question type
    const questionType = document.getElementById("type")
    if (questionType) {
        let typeInfo = questionTypes.filter(type => type.name == questionType.value)[0]
        const minLabel = document.getElementById("min-label")
        const maxLabel = document.getElementById("max-label")
        const multiChoiceSection = document.getElementById("multiple-choice-section")
        minLabel.textContent = typeInfo.minText + ": "
        maxLabel.textContent = typeInfo.maxText + ": "

        if (typeInfo.hasChoices)
            multiChoiceSection.removeAttribute("hidden")

        questionType.addEventListener("change", () => {
            typeInfo = questionTypes.filter(type => type.name == questionType.value)[0]
            minLabel.textContent = typeInfo.minText + ": "
            maxLabel.textContent = typeInfo.maxText + ": "
            if (typeInfo.hasChoices)
                multiChoiceSection.removeAttribute("hidden")
            else
                multiChoiceSection.setAttribute("hidden", "true")
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

    // making min connected to required
    const requiredElement = document.getElementById("required")
    const minElement = document.getElementById("min")
    if (!requiredElement.checked) {
        minElement.value = 0
        minElement.setAttribute("readonly", "true")
    }
    requiredElement.addEventListener("change", (evt) => {
        if (!requiredElement.checked) {
            minElement.value = 0
            minElement.setAttribute("readonly", "true")
        } else {
            minElement.removeAttribute("readonly")
        }
    })
    

})

