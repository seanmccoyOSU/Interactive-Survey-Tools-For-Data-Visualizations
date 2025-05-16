import {VisualizationElement} from "./visualizationElement.js"
import {exportButton} from "./features/exportButton.js"
import {selectElements} from "./features/selectElements.js"
import {zoomPan} from "./features/zoomPan.js"

export let debug = false
export const mouseMode = { mode: "pan" }
let visualizer
export let visualizationElement
export let svgElement
export const wrapper = document.getElementById("wrapper")                      // container that covers entire page
export const visualContainer = document.getElementById("visual-container")     // container for the visual


const visualizerBase = {
    // mode property is just for specifying what the current interaction mode is
    // the rest of the code here is just for replacing the mode label in the wrapper classlist (for CSS)
    modeLabels: [],
    mode: "",
    set mode(s) {
        wrapper.classList.remove(this.modeLabels)
        wrapper.classList.add(s)
        if (!this.modeLabels.contains(s))
            this.modeLabels.push(s)
        this.value = s
    },

    // called when the page loads regardless of role
    onPageLoad: function() {
        
    },
    
    // called when the page loads as an editor
    onPageLoadAsEditor: function() {
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
    
    // called when the page loads as a participant
    onPageLoadAsParticipant: function() {
    
    },
    
    // called when the page loads in debug mode
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
        })
    
        document.getElementById("participant-button").addEventListener("click", (evt) => {
            wrapper.classList.remove("editor") 
            wrapper.classList.add("participant") 
        })
    },

    // called when the SVG loads for the first time
    onFirstLoadSvg: function() {
        
    },

    // called each time the SVG loads
    onLoadSvg: function() {
        // send scale factor to CSS
        document.body.style.setProperty("--visual-scale", visualizationElement.scale / 80 + "px")
    }
}

Object.defineProperty(visualizerBase, "mode", {
    value: "",
    set(s) {
        wrapper.classList.remove(modeLabels)
        wrapper.classList.add(s)
        this.value = s
    }
})



// start loading svg once page has loaded
addEventListener("DOMContentLoaded", () => {
    visualizer = selectElements(zoomPan(exportButton(visualizerBase)))
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