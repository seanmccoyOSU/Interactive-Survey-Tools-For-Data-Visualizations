import {VisualizationElement} from "./visualizationElement.js"

let debug = false
let mouseMode = "pan"
let visualizationElement
let svgElement
const wrapper = document.getElementById("wrapper")                      // container that covers entire page
const visualContainer = document.getElementById("visual-container")     // container for the visual

document.getElementById("pan-button").addEventListener("click", (evt) => {
    mouseMode = "pan" 
    wrapper.style.cursor = "grab"
})

// document.getElementById("select-button").addEventListener("click", (evt) => {
//     mouseMode = "select" 
//     wrapper.style.cursor = "default"
// })

document.getElementById("create-button").addEventListener("click", (evt) => {
    mouseMode = "create" 
    wrapper.style.cursor = "crosshair"
})

document.getElementById("delete-button").addEventListener("click", (evt) => {
    mouseMode = "delete" 
    wrapper.style.cursor = "default"
})

// start loading svg once page has loaded
addEventListener("DOMContentLoaded", () => {
    if (wrapper.classList.contains("editor")) {
        document.getElementById("pan-button").removeAttribute("hidden")
        document.getElementById("create-button").removeAttribute("hidden")
        document.getElementById("delete-button").removeAttribute("hidden")
        
        const uploader = document.getElementById("svg-uploader");
        uploader.removeAttribute("hidden")
        uploader.addEventListener("change", handleSvgUpload);  

        document.getElementById("save-svg").removeAttribute("hidden")

        // save changes to database
        document.getElementById("save-svg").addEventListener("click", () => {
            fetch(window.location.href, { 
                method: "PUT",
                body: JSON.stringify({
                    svg: svgElement.outerHTML
                }),
                headers: {
                    "Content-type": "application/json",
                },    
            })
        })
    } else {
        wrapper.classList.add("participant")
        
        // debug mode
        if (wrapper.classList.contains("debug")) {
            // debug mode set up
            debug = true

            const uploader = document.getElementById("svg-uploader");
            uploader.removeAttribute("hidden")
            uploader.addEventListener("change", handleSvgUpload);  

            document.getElementById("editor-button").removeAttribute("hidden")
            document.getElementById("participant-button").removeAttribute("hidden")
            document.getElementById("save-svg").removeAttribute("hidden")

            // make buttons functional
            document.getElementById("editor-button").addEventListener("click", (evt) => {
                wrapper.classList.remove("participant") 
                wrapper.classList.add("editor") 
                document.getElementById("pan-button").removeAttribute("hidden")
                document.getElementById("create-button").removeAttribute("hidden")
                document.getElementById("delete-button").removeAttribute("hidden")
            })

            document.getElementById("participant-button").addEventListener("click", (evt) => {
                wrapper.classList.remove("editor") 
                wrapper.classList.add("participant") 
                mouseMode = "pan"
                document.getElementById("pan-button").setAttribute("hidden", "true")
                document.getElementById("create-button").setAttribute("hidden", "true")
                document.getElementById("delete-button").setAttribute("hidden", "true")
            })

            //Locally saves the current .SVG file being displayed
            document.getElementById("save-svg").addEventListener("click", () => {
                // we don't want to save modified scale and position
                visualizationElement.resetScaleAndPosition()

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
        }
    }

    if (visualContainer.firstElementChild) {
        svgElement = visualContainer.firstElementChild
        visualizationElement = new VisualizationElement(svgElement)
        OnLoadSvg();
        OnFirstUpload();
    } 
    
});





function handleSvgUpload(event){
    const file = event.target.files[0];
    if (!file) return;
    if (debug)
        if (!file.name.endsWith('.svg')) return;
    else
        if (!(file.name.endsWith('.svg') || file.name.endsWith('.jpg') || file.name.endsWith('.png'))) return;

    if (file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const svgText = e.target.result;
            loadSvgFromText(svgText);
        }
        reader.readAsText(file);
    } else {
        loadRaster(file)
        
    }
    
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

   
    svgElement = visualContainer.appendChild(svgDoc.documentElement);

    visualizationElement = new VisualizationElement(svgElement)

    if (!debug) {
        fetch(window.location.href, { 
            method: "PUT",
            body: JSON.stringify({
                svg: svgElement.outerHTML
            }),
            headers: {
                "Content-type": "application/json",
            },    
        })
    }
  
    // Re-initialize pan/zoom
    OnLoadSvg();
    if (firstUpload)
        OnFirstUpload();
}

function loadRaster(file) {
    // send request to upload image
    const formData = new FormData()
    const urlParts = window.location.href.split('/')
    const fileParts = file.name.split('.')
    const fileUrl = window.location.href.split('?')[0] + "/photo"
    formData.append('file', file, urlParts[urlParts.length-1].split('?')[0] + '.' + fileParts[fileParts.length-1]);
    fetch(fileUrl, { 
        method: "POST",
        body: formData
    })

    // Remove old SVG if one is already present
    let firstUpload = true
    if (svgElement) {
        visualContainer.removeChild(visualizationElement.svg);
        firstUpload = false
    }

    // create svg element
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    newSvg.setAttributeNS(null, "width", "500")
    newSvg.setAttributeNS(null, "height", "500")
    newSvg.setAttributeNS(null, "viewBox", "0 0 500 500")
    newSvg.innerHTML = `<image href="${fileUrl}" x="0" y="0" height="500" width="500"></image>`

    svgElement = visualContainer.appendChild(newSvg);

    visualizationElement = new VisualizationElement(svgElement)

    fetch(window.location.href, { 
        method: "PUT",
        body: JSON.stringify({
            svg: svgElement.outerHTML
        }),
        headers: {
            "Content-type": "application/json",
        },    
    })

    window.location.replace(window.location.href)
  
    // Re-initialize pan/zoom
    OnLoadSvg();
    if (firstUpload)
        OnFirstUpload();
}

function OnLoadSvg() {
    EnableSelection()
}

function OnFirstUpload() {
    if (wrapper.classList.contains("editor") || debug) {
        document.getElementById("set-all-selectable-button").removeAttribute("hidden")
        document.getElementById("set-all-selectable-button").addEventListener("click", (evt) => {
            visualizationElement.setAllSelectable()
        })

        document.getElementById("set-all-not-selectable-button").removeAttribute("hidden")
        document.getElementById("set-all-not-selectable-button").addEventListener("click", (evt) => {
            visualizationElement.setAllNotSelectable()
        })
    }
    

    EnablePanning()
    EnableZoom()
    EnableBox()
}

// Enable user to select/deselect vector elements by clicking on them
function EnableSelection() {
    // loop through all visual elements and add event listeners to each
    for(const visualElement of visualizationElement.visualElements) {
        EnableSelectionOfElement(visualElement)
    }
}

// Enable user to select/deselect a single visual element
function EnableSelectionOfElement(visualElement) {
    // clicking on selectable element as a participant marks/unmarks as "selected"
    visualElement.addEventListener("click", evt => { 
        if (mouseMode == "pan" || mouseMode == "select") {
            if (wrapper.classList.contains("participant") && visualizationElement.isSelectable(evt.currentTarget)) { 
                visualizationElement.toggleSelection(evt.currentTarget)
            } 
        }
    })

    // clicking on element as an editor marks/unmarks as "selectable"
    visualElement.addEventListener("click", evt => { 
        if (mouseMode == "pan" || mouseMode == "select") {
            if (wrapper.classList.contains("editor")) { 
                visualizationElement.toggleSelectable(evt.currentTarget)
            } 
        }
    })

    // clicking on element in delete mode deletes it (only for custom elements)
    if (visualizationElement.isCustom(visualElement)) {
        visualElement.addEventListener("click", evt => {
            if (mouseMode == "delete") {
                visualizationElement.removeVisualElement(visualElement)
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

            // get scale of visualization as it is displayed in the window
            const svgBoundingBox = visualizationElement.svg.getBoundingClientRect()
            const svgWindowScale = svgBoundingBox.height < svgBoundingBox.width ? svgBoundingBox.height : svgBoundingBox.width

            // panning speed adjusts based on visualization's programmed scale and its window scale 
            const speedModifier = visualizationElement.scale / svgWindowScale

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

// Enable user to draw a box on the screen
function EnableBox() {
    let box
    let boxStartingPoint
    let isStartDrawing = false
    let isDrawingBox = false

    // when user presses mouse in select or create mode, enable box drawing
    wrapper.addEventListener("mousedown", evt => {
        if (mouseMode == "select" || mouseMode == "create") {
            evt.preventDefault()
            isStartDrawing = true
        }
    })

    document.addEventListener("mousemove", evt => {
        if (isStartDrawing) {       // when user has just started moving mouse after pressing down
            evt.preventDefault()

            // create rectangle element to start drawing the box at the mouse point
            box = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            box.setAttribute("width", 0)
            box.setAttribute("height", 0)
            boxStartingPoint = screenToSVG(evt.clientX, evt.clientY)
            box.setAttribute("x", boxStartingPoint.x)
            box.setAttribute("y", boxStartingPoint.y)
            box.setAttribute("id", "user-box")

            visualizationElement.svg.appendChild(box)

            isDrawingBox = true
            isStartDrawing = false
        } else if (isDrawingBox) {  // when user continues to move mouse
            // prevent mouse from highlighting text while drawing
            evt.preventDefault()

            // calculate box dimensions based on where mouse has moved from its starting point
            const newPoint = screenToSVG(evt.clientX, evt.clientY)
            const newWidth = newPoint.x - boxStartingPoint.x
            const newHeight = newPoint.y - boxStartingPoint.y

            // width and height grow box to the right and down respectively
            // if the user moves the mouse to the left or up (indicated by negative dimensions),
            // the box needs to be shifted accordingly in the same direction to appear to grow in that direction
            if (newWidth <= 0) {
                box.setAttribute("x", boxStartingPoint.x + newWidth)
            }
            if (newHeight <= 0) {
                box.setAttribute("y", boxStartingPoint.y + newHeight)
            }

            // set new box dimensions, can only be positive
            box.setAttribute("width", Math.abs(newWidth))
            box.setAttribute("height", Math.abs(newHeight))
            
        }
    })

    document.addEventListener("mouseup", evt => {
        // user is not longer drawing on mouse release
        isDrawingBox = false
        isStartDrawing = false
        if (box) {
            if (mouseMode == "select") {
                box.remove()
                // FUTURE GOAL: box selection
            } else if (mouseMode == "create") {
                // change from temporary box to actual visual element 
                box.removeAttribute("id")
                visualizationElement.addVisualElement(box)
                EnableSelectionOfElement(box)
            }

            box = null
        }
    })
}

// The following function was adapted from stackoverflow user "inna" (Jan 19, 2018)
// Adapted from function transformPoint() (name was taken from Paul LeBeau's answer) 
// Sourced on 1/30/2025
// Source URL: https://stackoverflow.com/questions/48343436/how-to-convert-svg-element-coordinates-to-screen-coordinates
function screenToSVG(screenX, screenY) {
    const p = DOMPoint.fromPoint(svgElement)
    p.x = screenX
    p.y = screenY
    return p.matrixTransform(svgElement.getScreenCTM().inverse());
 }