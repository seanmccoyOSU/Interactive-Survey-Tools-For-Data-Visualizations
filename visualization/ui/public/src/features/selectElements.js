import { visualizationElement, svgElement, wrapper, debug, mouseMode, screenToSVG } from "../visualizer.js"

export const selectElements = (visualizer) => {
    const decoratedVisualizer = Object.create(visualizer)

    decoratedVisualizer.onFirstLoadSvg = function() {
        visualizer.onFirstLoadSvg()

        if (wrapper.classList.contains("editor") || debug) {
            // create set all selectable button
            const setAllSelectableButton = document.createElement("button")
            setAllSelectableButton.textContent = "Make All Elements Selectable"
            setAllSelectableButton.addEventListener("click", () => {
                visualizationElement.setAllSelectable()
            })

            // create set all not selectable button
            const setAllNotSelectableButton = document.createElement("button")
            setAllNotSelectableButton.textContent = "Make All Elements Not Selectable"
            setAllNotSelectableButton.addEventListener("click", () => {
                visualizationElement.setAllNotSelectable()
            })

            // add buttons to options dropdown
            const dropdownButtons = document.getElementsByClassName("dropdown-buttons")[0]
            dropdownButtons.appendChild(setAllSelectableButton)
            dropdownButtons.appendChild(setAllNotSelectableButton)        
        }

        if (!wrapper.classList.contains("editor") || debug) {
            // create select all button
            const selectAllButton = document.createElement("button")
            selectAllButton.textContent = "Select All Elements"
            selectAllButton.addEventListener("click", () => {
                visualizationElement.selectAll()
            })

            // create deselect all button
            const deselectAllButton = document.createElement("button")
            deselectAllButton.textContent = "Clear All Selections"
            deselectAllButton.addEventListener("click", () => {
                visualizationElement.deselectAll()
            })

            // add buttons to options dropdown
            const dropdownButtons = document.getElementsByClassName("dropdown-buttons")[0]
            dropdownButtons.appendChild(selectAllButton)
            dropdownButtons.appendChild(deselectAllButton)        
        }

        EnableBox()
    }

    decoratedVisualizer.onLoadSvg = function() {
        visualizer.onLoadSvg()
        EnableSelection()
    }

    decoratedVisualizer.onPageLoadDebug = function() {
        visualizer.onPageLoadDebug()
        createCreateAndDeleteButtons()
    }

    decoratedVisualizer.onPageLoadAsEditor = function() {
        visualizer.onPageLoadAsEditor()
        createCreateAndDeleteButtons()
    }

    return decoratedVisualizer
}

function createCreateAndDeleteButtons(visualizer) {
    // create create box button
    document.getElementById("create-button").removeAttribute("hidden")
    document.getElementById("create-button").addEventListener("click", (evt) => {
        visualizer.mode = "create"
        wrapper.classList. 
        wrapper.style.cursor = "crosshair"
    })

    // create create box button
    document.getElementById("create-button").removeAttribute("hidden")
    document.getElementById("create-button").addEventListener("click", (evt) => {
        visualizer.mode = "create" 
        wrapper.style.cursor = "crosshair"
    })

    // create delete box button
    document.getElementById("delete-button").removeAttribute("hidden")
    document.getElementById("delete-button").addEventListener("click", (evt) => {
        visualizer.mode = "delete" 
        wrapper.style.cursor = "default"
    })
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
        if (visualizer.mode == "selectElements") {
            if (wrapper.classList.contains("participant")) { 
                visualizationElement.toggleSelection(evt.currentTarget)
            } 
        }
    })

    // clicking on element as an editor marks/unmarks as "selectable"
    visualElement.addEventListener("click", evt => { 
        if (visualizer.mode == "selectElements") {
            if (wrapper.classList.contains("editor")) { 
                visualizationElement.toggleSelectable(evt.currentTarget)
            } 
        }
    })

    // clicking on element in delete mode deletes it (only for custom elements)
    if (visualizationElement.isCustom(visualElement)) {
        visualElement.addEventListener("click", evt => {
            if (visualizer.mode == "delete") {
                visualizationElement.removeVisualElement(visualElement)
            }
        })
    }
}

// Enable user to draw a selectable box on the screen
function EnableBox() {
    let box
    let boxStartingPoint
    let isStartDrawing = false
    let isDrawingBox = false

    // when user presses mouse in select or create mode, enable box drawing
    wrapper.addEventListener("mousedown", evt => {
        if (visualizer.mode == "create") {
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
            if (visualizer.mode == "selectElements") {
                box.remove()
                // FUTURE GOAL: box selection
            } else if (visualizer.mode == "create") {
                // change from temporary box to actual visual element 
                box.removeAttribute("id")
                visualizationElement.addVisualElement(box)
                EnableSelectionOfElement(box)
            }

            box = null
        }
    })
}