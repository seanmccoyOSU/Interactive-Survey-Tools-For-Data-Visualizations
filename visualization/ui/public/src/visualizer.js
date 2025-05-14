import {VisualizationElement} from "./visualizationElement.js"
import {exportButton} from "./features/exportButton.js"
import {selectElements} from "./features/selectElements.js"

export let debug = false
export const mouseMode = { mode: "pan" }
let visualizer
export let visualizationElement
export let svgElement
export const wrapper = document.getElementById("wrapper")                      // container that covers entire page
export const visualContainer = document.getElementById("visual-container")     // container for the visual

document.getElementById("pan-button").addEventListener("click", (evt) => {
    mouseMode.mode = "pan" 
    wrapper.style.cursor = "grab"
})

// document.getElementById("select-button").addEventListener("click", (evt) => {
//     mouseMode = "select" 
//     wrapper.style.cursor = "default"
// })





const visualizerBase = {
    onPageLoad: function() {
    
    },
    
    onPageLoadAsEditor: function() {
        // create tool buttons
        document.getElementById("pan-button").removeAttribute("hidden")
        
        // create file uploader
        const uploader = document.getElementById("svg-uploader");
        uploader.removeAttribute("hidden")
        uploader.addEventListener("change", handleSvgUpload);  
    
        // create save button
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
    },
    
    onPageLoadAsParticipant: function() {
    
    },
    
    onPageLoadDebug: function() {
        // debug mode set up
        debug = true
    
        // create file uploader
        const uploader = document.getElementById("svg-uploader");
        uploader.removeAttribute("hidden")
        uploader.addEventListener("change", handleSvgUpload);  
    
        // create debug mode buttons
        document.getElementById("editor-button").removeAttribute("hidden")
        document.getElementById("participant-button").removeAttribute("hidden")
    
        document.getElementById("editor-button").addEventListener("click", (evt) => {
            wrapper.classList.remove("participant") 
            wrapper.classList.add("editor") 
            document.getElementById("pan-button").removeAttribute("hidden")
        })
    
        document.getElementById("participant-button").addEventListener("click", (evt) => {
            wrapper.classList.remove("editor") 
            wrapper.classList.add("participant") 
            mouseMode.mode = "pan"
            document.getElementById("pan-button").setAttribute("hidden", "true")
        })
    },

    onFirstLoadSvg: function() {
        EnablePanning()
        EnableZoom()
    },

    onLoadSvg: function() {
        document.body.style.setProperty("--visual-scale", visualizationElement.scale / 80 + "px")
    }
}



// start loading svg once page has loaded
addEventListener("DOMContentLoaded", () => {
    visualizer = selectElements(exportButton(visualizerBase))
    visualizer.onPageLoad()

    if (wrapper.classList.contains("editor")) {
        visualizer.onPageLoadAsEditor()
    } else {
        wrapper.classList.add("participant")
        visualizer.onPageLoadAsParticipant()
        
        // debug mode
        if (wrapper.classList.contains("debug")) {
            visualizer.onPageLoadDebug()
        }
    }

    if (visualContainer.firstElementChild) {
        svgElement = visualContainer.firstElementChild
        visualizationElement = new VisualizationElement(svgElement)
        visualizer.onLoadSvg();
        visualizer.onFirstLoadSvg();
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
    visualizer.onLoadSvg();
    if (firstUpload)
        visualizer.onFirstLoadSvg();
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
    visualizer.onLoadSvg();
    if (firstUpload)
        visualizer.onFirstLoadSvg();
}



// Enable user to pan the visual by clicking and dragging anywhere on the page
function EnablePanning() {
    let isPanning = false
    let startXMouse, startYMouse
    let startXVisual, startYVisual

    // define behavior for when user presses mouse button down anywhere on the page
    wrapper.addEventListener("mousedown", evt => {
        if (mouseMode.mode == "pan") {
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
        if (mouseMode.mode == "pan") {
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

// The following function was adapted from stackoverflow user "inna" (Jan 19, 2018)
// Adapted from function transformPoint() (name was taken from Paul LeBeau's answer) 
// Sourced on 1/30/2025
// Source URL: https://stackoverflow.com/questions/48343436/how-to-convert-svg-element-coordinates-to-screen-coordinates
export const screenToSVG = function(screenX, screenY) {
    const p = DOMPoint.fromPoint(svgElement)
    p.x = screenX
    p.y = screenY
    return p.matrixTransform(svgElement.getScreenCTM().inverse());
}

// this is in response for an iframe message for the count of selected elements, ids of selected elements, or selection based on array of ids
window.addEventListener('message', (event) => {
    if (event.data == "count")
        event.source.postMessage({ type: "count", count: visualizationElement.getNumberOfSelectedElements() }, "*")
    else if (event.data == "ids")
        event.source.postMessage({ type: "ids", ids: visualizationElement.getSelectedIds() }, "*")
    else if (event.data.selectIds) {
        for (const id of event.data.selectIds) {
            const elementToSelect = visualizationElement.getElementById(id)
            if (elementToSelect)
                visualizationElement.select(elementToSelect)
        }
    }
})