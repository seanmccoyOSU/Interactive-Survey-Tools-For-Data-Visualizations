for (let element of document.getElementsByClassName("delete-button")) {
    element.addEventListener("click", () => {
        fetch(element.getAttribute("action"), { 
            method: "DELETE"
        }).then(response => {
            window.location.replace(window.location.href)
        })
    })
}