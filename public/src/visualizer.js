import {VisualizationElement} from "./visualizationElement.js"

let mouseMode = "pan"
let visualizationElement
let svgElement
const wrapper = document.getElementById("wrapper")                      // container that covers entire page
const visualContainer = document.getElementById("visual-container")     // container for the visual

document.getElementById("editor-button").addEventListener("click", (evt) => {
    wrapper.classList.remove("participant") 
    wrapper.classList.add("editor") 
})

document.getElementById("participant-button").addEventListener("click", (evt) => {
    wrapper.classList.remove("editor") 
    wrapper.classList.add("participant") 
})

document.getElementById("pan-button").addEventListener("click", (evt) => {
    mouseMode = "pan" 
    wrapper.style.cursor = "grab"
})

document.getElementById("select-button").addEventListener("click", (evt) => {
    mouseMode = "select" 
    wrapper.style.cursor = "default"
})

document.getElementById("create-button").addEventListener("click", (evt) => {
    mouseMode = "create" 
    wrapper.style.cursor = "default"
})

document.getElementById("delete-button").addEventListener("click", (evt) => {
    mouseMode = "delete" 
    wrapper.style.cursor = "default"
})

// start loading svg once page has loaded
addEventListener("DOMContentLoaded", () => {
    wrapper.classList.add("participant") 
    const uploader = document.getElementById("svg-uploader");
    uploader.addEventListener("change", handleSvgUpload);
});


//Locally saves the current .SVG file being displayed
document.getElementById("save-svg").addEventListener("click", () => {
    // 1) Convert the current <svg> to a string
    //    Using XMLSerializer preserves all attributes and nested elements
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
  
    // 2) Create a Blob from the string, then a URL from the Blob
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
  
    // 3) Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = "edited-visual.svg"; // default file name in download dialog
    document.body.appendChild(link);
  
    // 4) Programmatically click it to start the download, then clean up
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});


function handleSvgUpload(event){
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.svg')) return;

    const reader = new FileReader();
    reader.onload = function(e){
        const svgText = e.target.result;
        loadSvgFromText(svgText);
    }
    reader.readAsText(file);
}

function loadSvgFromText(svgText) {
    let firstUpload = true
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
  
    // Check if the parse failed
    if (svgDoc.documentElement.nodeName === "parsererror") {
      console.error("Error parsing SVG:", svgDoc.documentElement);
      return;
    }
    // Remove old SVG if one is already present
    if (svgElement) {
      visualContainer.removeChild(visualizationElement.svg);
      firstUpload = false
    }

    // Parse SVG text
    svgElement = visualContainer.appendChild(svgDoc.documentElement);
    console.log("Appended SVG:", svgElement);

    visualizationElement = new VisualizationElement(svgElement)
    console.log("Visualization Element Object:", visualizationElement);
  
    // Re-initialize pan/zoom
    OnLoadSvg();
    if (firstUpload)
        OnFirstUpload();
}

function OnLoadSvg() {
    EnableSelection()
}

function OnFirstUpload() {
    EnablePanning()
    EnableZoom()
}

// Enable user to select/deselect vector elements by clicking on them
function EnableSelection() {
    // loop through all visual elements and add event listeners to each
    for(const visualElement of visualizationElement.visualElements) {
        // clicking on selectable element as a participant marks/unmarks as "selected"
        visualElement.addEventListener("click", evt => { 
            if (wrapper.classList.contains("participant") && visualizationElement.isSelectable(evt.currentTarget)) { 
                visualizationElement.toggleSelection(evt.currentTarget)
            } 
        })

        // clicking on element as an editor marks/unmarks as "selectable"
        visualElement.addEventListener("click", evt => { 
            if (wrapper.classList.contains("editor")) { 
                visualizationElement.toggleSelectable(evt.currentTarget)
            } 
        })
    }
}

// Enable user to pan the visual by clicking and dragging anywhere on the page
function EnablePanning() {
    let isPanning = false
    let startXMouse, startYMouse
    let startXVisual, startYVisual

    // define behavior for when user presses mouse button down anywhere on the page
    wrapper.addEventListener("mousedown", evt => {
        if (mouseMode == "pan") {
            evt.preventDefault()
            // while user holds the mouse button down, the user is panning
            isPanning = true
    
            // get starting coordinates for visual and mouse
            startXMouse = evt.clientX
            startYMouse = evt.clientY
            startXVisual = visualizationElement.x
            startYVisual = visualizationElement.y
    
            // change cursor image to grabbing
            wrapper.style.cursor = "grabbing"
        }
    })

    // define behavior for when user moves mouse while panning
    document.addEventListener("mousemove", evt => {
        if (isPanning) {
            // prevent mouse from highlighting text while panning
            evt.preventDefault()

            const speedModifier = visualizationElement.scale / 1000

            // coordinates to move visual to
            visualizationElement.x = startXVisual - (evt.clientX - startXMouse) * speedModifier
            visualizationElement.y = startYVisual - (evt.clientY - startYMouse) * speedModifier
        }
    })

    // define behavior for when user releases mouse button
    document.addEventListener("mouseup", () => {
        if (mouseMode == "pan") {
            // the user is not panning if the mouse button is not pressed down
            isPanning = false

            // change cursor image to grab
            wrapper.style.cursor = "grab"
        }
    })
}

// Enable user to zoom the visual by clicking the zoom buttons
function EnableZoom() {
    const zoomOutIntensity = 2
    const zoomInIntensity = 1./zoomOutIntensity     // inverse
    
    // define zoom in event for clicking zoom in button
    document.getElementById("zoom-in").addEventListener("click", () => {
        let newSize = visualizationElement.scale * zoomInIntensity

        visualizationElement.scale = newSize
    })

    // define zoom out event for clicking zoom out button
    document.getElementById("zoom-out").addEventListener("click", () => {
        let newSize = visualizationElement.scale * zoomOutIntensity

        visualizationElement.scale = newSize
    })
}