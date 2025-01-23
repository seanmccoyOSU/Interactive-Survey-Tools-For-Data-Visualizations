/**
 * HTML tags of visual elements that are interactable on the visualization
 * @const
 * @type {string[]}
 * @default
 */
const VISUAL_ELEMENT_TAGS = ["path"]
// below is what we want it to be, but not fully implemented yet
// const VISUAL_ELEMENT_TAGS = ["path", "rect", "circle", "ellipse", "polygon", "line", "polyline"]

/**
 * Class name for selected elements
 * @const
 * @type {string}
 * @default
 */
const SELECTION_LABEL = "selected"
/**
 * Class name for selectable elements
 * @const
 * @type {string}
 * @default
 */
const SELECTABLE_LABEL = "selectable"
/**
 * Class name that blocks default behavior of marking all visual elements as selectable
 * @const
 * @type {string}
 * @default
 */
const FIRST_TIME_MARK_LABEL = "marked-selectables"

/**
 * Class for the visualization element in the DOM
 * @class
 */
const VisualizationElement = class {
    /**
     * Constructs a VisualizationElement using existing SVG element as its base
     * @constructor
     * @param {Element} svg 
     */
    constructor(svg) {
        this.svg = svg
        this.visualElements = ExtractVisualElements(svg)

        // on first time upload, mark all visual elements as selectable by default
        if (!this.svg.classList.contains(FIRST_TIME_MARK_LABEL)) {
            this.setSelectableMultiple(this.visualElements)
            this.svg.classList.add(FIRST_TIME_MARK_LABEL)
        }
    }

    /**
     * Marks element as selected
     * @param {Element} element 
     */
    select(element) {
        element.classList.add(SELECTION_LABEL)
    }

    /**
     * Unmarks element as selected
     * @param {Element} element 
     */
    deselect(element) {
        element.classList.remove(SELECTION_LABEL)
    }
    
    /**
     * Toggles selection of element
     * @param {Element} element 
     */
    toggleSelection(element) {
        element.classList.toggle(SELECTION_LABEL)
    }

    /**
     * Marks multiple elements as selected
     * @param {Array} elements 
     */
    selectMultiple(elements) {
        for (const element of elements) {
            this.select(element)
        }
    }

    /**
     * Marks element as selectable
     * @param {Element} element 
     */
    setSelectable(element) {
        element.classList.add(SELECTABLE_LABEL)
    }

    /**
     * Toggles selectability of element
     * @param {Element} element 
     */
    toggleSelectable(element) {
        element.classList.toggle(SELECTABLE_LABEL)
    }

    /**
     * Returns true if element is selectable
     * @param {Element} element 
     * @returns {boolean} 
     */
    isSelectable(element) {
        return element.classList.contains(SELECTABLE_LABEL)
    }

    /**
     * Marks multiple elements as selectable
     * @param {Array} elements 
     */
    setSelectableMultiple(elements) {
        for (const element of elements) {
            this.setSelectable(element)
        }
    }

    /**
     * Adds visual element to visualization
     * @param {Element} element 
     */
    addVisualElement(element) {
        const liveElement = this.svg.appendChild(element)
        this.visualElements.push(liveElement)

        // make selectable by default
        this.setSelectable(liveElement)
    }

    /**
     * Removes visual element from visualization
     * @param {Element} element 
     */
    removeVisualElement(element) {
        element.remove()
    }
}

/**
 * Returns array of all current visual elements from SVG
 * @param {Element} svg SVG DOM element to extract visual elements from
 * @returns {Array} Array of visual elements
 */
function ExtractVisualElements(svg) {
    const elements = []

    for (const tag of VISUAL_ELEMENT_TAGS) {
        const shapeGroup = svg.getElementsByTagName(tag)
        elements.push(...shapeGroup)
    }

    return elements
}

export {VisualizationElement}
