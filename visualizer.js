let visualElements
let svgElement
const wrapper = document.getElementById("wrapper")
const visualContainer = document.getElementById("visual-container")

document.addEventListener("DOMContentLoaded", () => {
    LoadSvg();
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

function LoadSvg() {
    fetch("../hyper.svg")
      .then((response) => response.text())
      .then((svgText) => {
        loadSvgFromText(svgText);
      })
      .catch(err => {
        console.error("Error fetching default SVG:", err);
      });
}

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
  
    // Parse SVG text
    svgElement = visualContainer.appendChild(svgDoc.documentElement);
    console.log("Appended SVG:", svgElement);
  
    // Make elements selectable
    visualElements = svgElement.getElementsByTagName("path");
    for (let i = 0; i < visualElements.length; i++) {
      visualElements.item(i).addEventListener("click", ToggleSelected);
    }
  
    // Re-initialize pan/zoom
    OnLoadSvg();
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