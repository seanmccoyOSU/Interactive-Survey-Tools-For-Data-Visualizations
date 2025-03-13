document.addEventListener('DOMContentLoaded', () => {
    // enable functionality of all delete buttons
    for (let element of document.getElementsByClassName("delete-button")) {
        element.addEventListener("click", () => {
            fetch(element.getAttribute("action"), { 
                method: "DELETE"
            }).then(response => {
                window.location.replace(window.location.href.split('#')[0])  // refreshes page
            })
        })
    }

    // enable functionality of all rename buttons
    for (let element of document.getElementsByClassName("rename-popup")) {
        const renameButton = element.getElementsByClassName("popup-rename-button")[0]
        const input = element.getElementsByClassName("rename-input")[0]
        const errorText = element.getElementsByClassName("rename-error")[0]

        renameButton.addEventListener("click", () => {
            fetch(renameButton.getAttribute("action"), { 
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name: input.value})
            }).then(response => {
                window.location.replace(window.location.href.split('#')[0])  // refreshes page
            })
        })
    }

    // enable functionality of button for saving changes to survey design
    const saveSurveyButton = document.getElementsByClassName("save-survey-button")[0]
    if (saveSurveyButton) {
        saveSurveyButton.addEventListener("click", () => {
            fetch(saveSurveyButton.getAttribute("action"), { 
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: document.getElementById("title").value, 
                    introText: document.getElementById("introText").value, 
                    conclusionText: document.getElementById("conclusionText").value,
                })
            })
        })
    }
})