let visualElements                                                      // var to hold the list of all svg vector elements
const wrapper = document.getElementById("wrapper")                      // container that covers entire page
const visualContainer = document.getElementById("visual-container")     // container for the visual

// start loading svg once page has loaded
document.addEventListener("DOMContentLoaded", LoadSvg)

// Reads SVG file, then inserts it as a set of DOM elements into page
function LoadSvg() {
    // Read text from SVG file
    fetch("../hyper.svg")
    .then(response => response.text())
    .then(svgText => {
        // Create SVG DOM element
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

        // Insert SVG in visual container
        visualContainer.appendChild(svgDoc.documentElement);

        // Code to execute after loading SVG
        OnLoadSvg()
    })
}

// Code to execute after loading SVG
function OnLoadSvg() {
    EnableSelection()
    EnablePanning()
    EnableZoom()
}

// Enable user to select/deselect vector elements by clicking on them
function EnableSelection() {
    // get list of vector elements (path elements)
    visualElements = document.getElementsByTagName("path")

    // define event that toggles selection for each vector element
    // vector is selected if it belongs to the "selected" class
    for(let i = 0; i < visualElements.length; i++) {
        visualElements.item(i).addEventListener("click", evt => { evt.currentTarget.classList.toggle("selected") })
    }
}

// Enable user to pan the visual by clicking and dragging anywhere on the page
function EnablePanning() {
    let isPanning = false
    let startX, startY

    // define behavior for when user presses mouse button down anywhere on the page
    wrapper.addEventListener("mousedown", evt => {
        // while user holds the mouse button down, the user is panning
        isPanning = true

        // get starting coordinates for visual
        startX = evt.clientX - visualContainer.offsetLeft
        startY = evt.clientY - visualContainer.offsetTop

        // change cursor image to grabbing
        wrapper.style.cursor = "grabbing"
    })

    // define behavior for when user moves mouse while panning
    document.addEventListener("mousemove", evt => {
        if (isPanning) {
            // prevent mouse from highlighting text while panning
            evt.preventDefault()

            // coordinates to move visual to
            const x = evt.clientX - startX
            const y = evt.clientY - startY

            // move the visual accordingly
            visualContainer.style.left = x + "px"
            visualContainer.style.top = y + "px"
        }
    })

    // define behavior for when user releases mouse button
    document.addEventListener("mouseup", () => {
        // the user is not panning if the mouse button is not pressed down
        isPanning = false

        // change cursor image to grab
        wrapper.style.cursor = "grab"
    })
}

// Enable user to zoom the visual by clicking the zoom buttons
function EnableZoom() {
    // specify zoom intensities
    const zoomInIntensity = 1.5
    const zoomOutIntensity = 1./zoomInIntensity     // inverse of zoom in

    // get svg element
    const svgE = document.getElementsByTagName("svg")[0]

    // set viewBox attribute, this is necessary for scaling
    svgE.setAttribute("viewBox", "0 0 " + svgE.width.baseVal.value + " " + svgE.height.baseVal.value)
    
    // define zoom in event for clicking zoom in button
    document.getElementById("zoom-in").addEventListener("click", () => {
        let newHeight = svgE.height.baseVal.value * zoomInIntensity
        let newWidth = svgE.width.baseVal.value * zoomInIntensity

        svgE.setAttribute("height", newHeight)
        svgE.setAttribute("width", newWidth)
    })

    // define zoom out event for clicking zoom out button
    document.getElementById("zoom-out").addEventListener("click", () => {
        let newHeight = svgE.height.baseVal.value * zoomOutIntensity
        let newWidth = svgE.width.baseVal.value * zoomOutIntensity

        svgE.setAttribute("height", newHeight)
        svgE.setAttribute("width", newWidth)
    })
}