let visualElements
let svgElement
const wrapper = document.getElementById("wrapper")
const visualContainer = document.getElementById("visual-container")

document.addEventListener("DOMContentLoaded", LoadSvg)

function LoadSvg() {
    // load svg file
    fetch("../hyper.svg")
    .then(response => response.text())
    .then(svgText => {
        // Create SVG element
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        svgElement = visualContainer.appendChild(svgDoc.documentElement);
        console.log(svgElement)

        // Make elements selectable
        visualElements = document.getElementsByTagName("path")
        console.log(visualElements)
        console.log(visualElements.length)

        for(let i = 0; i < visualElements.length; i++) {
            console.log("add listener")
            visualElements.item(i).addEventListener("click", ToggleSelected)
        }

        // Things to do after loading
        OnLoadSvg()
    })
}

function OnLoadSvg() {
    EnablePanning()
    EnableZoom()
}

function EnablePanning() {
    let isDragging = false
    let startX, startY

    wrapper.addEventListener("mousedown", evt => {
        isDragging = true
        startX = evt.clientX - visualContainer.offsetLeft
        startY = evt.clientY - visualContainer.offsetTop
        wrapper.style.cursor = "grabbing"
    })

    document.addEventListener("mousemove", evt => {
        if (isDragging) {
            evt.preventDefault()

            const x = evt.clientX - startX
            const y = evt.clientY - startY

            visualContainer.style.left = x + "px"
            visualContainer.style.top = y + "px"
        }
    })

    document.addEventListener("mouseup", () => {
        isDragging = false
        wrapper.style.cursor = "grab"
    })
}

function EnableZoom() {
    let svgE = document.getElementsByTagName("svg")[0]
    document.getElementById("zoom-in").addEventListener("click", () => {
        let newHeight = parseInt(svgE.height) * 2
        let newWidth = parseInt(svgE.width) * 2

        svgE.setAttribute("height", newHeight.toString())
        svgE.setAttribute("width", newWidth.toString())
    })

    document.getElementById("zoom-out").addEventListener("click", () => {
        let newHeight = svgElement.height * 0.5
        let newWidth = svgElement.width * 0.5

        svgElement.height = newHeight + "px"
        svgElement.width = newWidth + "px"
    })
}


function ToggleSelected(evt) {
    evt.currentTarget.classList.toggle("selected")
    console.log("toggle select")
}







//visualElements.forEach(element => {
 //   element.addEventListener("click", ToggleSelected(element))
//})