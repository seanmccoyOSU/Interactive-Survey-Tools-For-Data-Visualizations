let svgElement                                                          // var to hold entire svg element
let visualElements                                                      // var to hold the list of all svg vector elements
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

// start loading svg once page has loaded
addEventListener("DOMContentLoaded", () => {
    wrapper.classList.add("participant") 
    //LoadSvg();
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

// no more default svg
// Reads SVG file, then inserts it as a set of DOM elements into page
// function LoadSvg() {
//     fetch("../hyper.svg")
//       .then((response) => response.text())
//       .then((svgText) => {
//         loadSvgFromText(svgText);
//       })
//       .catch(err => {
//         console.error("Error fetching default SVG:", err);
//       });
// }

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
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
  
    // Check if the parse failed
    if (svgDoc.documentElement.nodeName === "parsererror") {
      console.error("Error parsing SVG:", svgDoc.documentElement);
      return;
    }
    // Remove old SVG if one is already present
    if (svgElement) {
      visualContainer.removeChild(svgElement);
    }

    visualContainer.style.height = "300px"

    // Parse SVG text
    svgElement = visualContainer.appendChild(svgDoc.documentElement);
    console.log("Appended SVG:", svgElement);
  
    // Re-initialize pan/zoom
    OnLoadSvg();
}

function OnLoadSvg() {
    EnableSelection()
    EnablePanning()
    EnableZoom()
}

// Enable user to select/deselect vector elements by clicking on them
function EnableSelection() {
    // get list of vector elements (path elements)
    visualElements = svgElement.getElementsByTagName("path")
    
    // loop through list
    for(let i = 0; i < visualElements.length; i++) {
        // mark all elements as selectable by default
        // only do this for a first time upload
        if (!svgElement.classList.contains("marked-selectables"))
        {
            visualElements.item(i).classList.add("selectable")
        }
        

        // clicking on selectable element as a participant marks/unmarks as "selected"
        visualElements.item(i).addEventListener("click", evt => { 
            if (wrapper.classList.contains("participant") && evt.currentTarget.classList.contains("selectable")) { 
                evt.currentTarget.classList.toggle("selected") 
            } 
        })

        // clicking on element as an editor marks/unmarks as "selectable"
        visualElements.item(i).addEventListener("click", evt => { 
            if (wrapper.classList.contains("editor")) { 
                evt.currentTarget.classList.toggle("selectable") 
            } 
        })
    }

    // mark svg to not mark all selectables on re-upload
    if (!svgElement.classList.contains("marked-selectables")) {
        svgElement.classList.add("marked-selectables")
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

    // set viewBox attribute, this is necessary for scaling
    svgElement.setAttribute("viewBox", "0 0 " + svgElement.width.baseVal.value + " " + svgElement.height.baseVal.value)
    
    // define zoom in event for clicking zoom in button
    document.getElementById("zoom-in").addEventListener("click", () => {
        let heightText = visualContainer.style.height
        let curHeight = parseInt(heightText.substring(0, heightText.length - 2))
        let newHeight =  curHeight * zoomInIntensity
        visualContainer.style.height = newHeight + "px"
    })

    // define zoom out event for clicking zoom out button
    document.getElementById("zoom-out").addEventListener("click", () => {
        let heightText = visualContainer.style.height
        let curHeight = parseInt(heightText.substring(0, heightText.length - 2))
        let newHeight =  curHeight * zoomOutIntensity
        visualContainer.style.height = newHeight + "px"
    })
}