import { visualizationElement, svgElement, wrapper, debug, mouseMode, screenToSVG } from "../visualizer.js"

export const zoomPan = (visualizer) => {

    const decoratedVisualizer = Object.create(visualizer)

    //decoratedVisualizer.disablePan = false

    decoratedVisualizer.onFirstLoadSvg = function() {
        visualizer.onFirstLoadSvg()
        EnablePanning(decoratedVisualizer)
        EnableZoom()
    }

    return decoratedVisualizer
}

// Enable user to pan the visual by clicking and dragging anywhere on the page
function EnablePanning(visualizer) {
    let isPanning = false
    let startXMouse, startYMouse
    let startXVisual, startYVisual

    // define behavior for when user presses mouse button down anywhere on the page
    wrapper.addEventListener("mousedown", evt => {
        if (!visualizer.disablePan) {
            evt.preventDefault()
            // while user holds the mouse button down, the user is panning
            isPanning = true
    
            // get starting coordinates for visual and mouse
            startXMouse = evt.clientX
            startYMouse = evt.clientY
            startXVisual = visualizationElement.x
            startYVisual = visualizationElement.y
    
            // add wrapper class for CSS changes
            wrapper.classList.add("panning")
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
        if (isPanning) {
            // the user is not panning if the mouse button is not pressed down
            isPanning = false

            // remove wrapper class
            wrapper.classList.remove("panning")
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
