/**
 * HTML tags of visual elements that are interactable on the visualization
 * @const
 * @type {string[]}
 * @default
 */
const VISUAL_ELEMENT_TAGS = ["path", "rect", "circle", "ellipse", "polygon", "line", "polyline"]

/**
 * Class name for visual elements
 * @const
 * @type {string}
 * @default
 */
const VISUAL_ELEMENT_LABEL = "visual-element"
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
 * Class name for user-created visual elements
 * @const
 * @type {string}
 * @default
 */
const CUSTOM_ELEMENT_LABEL = "custom"

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
        this.nextId = this.visualElements.length

        this.defaultWidth = this.svg.viewBox?.baseVal?.width ? this.svg.viewBox.baseVal.width : this.svg.width.baseVal.value
        this.defaultHeight = this.svg.viewBox?.baseVal?.height ? this.svg.viewBox.baseVal.height : this.svg.height.baseVal.value
        this.resetScaleAndPosition()
        
        // on first time upload, mark all visual elements as selectable by default
        if (!this.svg.classList.contains(FIRST_TIME_MARK_LABEL)) {
            this.setAllSelectable()
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
     * Marks element as not selectable
     * @param {Element} element 
     */
    setNotSelectable(element) {
        element.classList.remove(SELECTABLE_LABEL)
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
     * Returns all visualId's of selected elements
     * @returns {Array} 
     */
    getSelectedIds() {
        let ids = []
        for (const element of this.visualElements) {
            ids.push(element.getAttribute("visualId"))
        }

        return ids
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
     * Marks all elements as selectable
     * @param {Array} elements 
     */
    setAllSelectable() {
        for (const element of this.visualElements) {
            this.setSelectable(element)
        }
    }

    /**
     * Marks all elements as not selectable
     * @param {Array} elements 
     */
    setAllNotSelectable() {
        for (const element of this.visualElements) {
            this.setNotSelectable(element)
        }
    }

    /**
     * Returns true if element was drawn by user
     * @param {Element} element 
     * @returns {boolean} 
     */
    isCustom(element) {
        return element.classList.contains(CUSTOM_ELEMENT_LABEL)
    }
    

    /**
     * Adds visual element to visualization
     * @param {Element} element 
     */
    addVisualElement(element) {
        // mark as a visual element
        element.classList.add(VISUAL_ELEMENT_LABEL)

        // mark as a custom element
        element.classList.add(CUSTOM_ELEMENT_LABEL)

        // set unique ID
        element.setAttribute("visualId", this.nextId)
        this.nextId += 1

        // make selectable by default
        this.setSelectable(element)
    }

    /**
     * Removes visual element from visualization
     * @param {Element} element 
     */
    removeVisualElement(element) {
        // simply remove from the DOM
        element.remove()
    }

    /**
     * Resets scale and position to calculated default which should fill the container
     */
    resetScaleAndPosition() {
        const scale = this.defaultWidth > this.defaultHeight ? this.defaultWidth : this.defaultHeight
        this.svg.setAttribute("viewBox", "0 0 " + scale + " " + scale)
    }

    /**
     * Returns number of selected elements
     * @returns {int} 
     */
    getNumberOfSelectedElements() {
        let count = 0
        for (const element of this.visualElements) {
            if (element.classList.contains(SELECTION_LABEL))
                count += 1
        }
        return count
    }

    get scale() {
        return this.svg.viewBox.baseVal.width
    }

    set scale(num) {
        if (num > 0) {
            this.svg.setAttribute("viewBox", this.x + " " + this.y + " " + 
                num + " " + num)
        }
    }

    get x() {
        return this.svg.viewBox.baseVal.x
    }

    set x(pos) {
        this.svg.setAttribute("viewBox", pos + " " + this.y + " " + 
            this.scale + " " + this.scale)
    }

    get y() {
        return this.svg.viewBox.baseVal.y
    }

    set y(pos) {
        this.svg.setAttribute("viewBox", this.x + " " + pos + " " + 
            this.scale + " " + this.scale)
    }
}

/**
 * Marks visual elements then returns live collection of visual elements from SVG
 * @param {Element} svg SVG DOM element to extract visual elements from
 * @returns {HTMLCollection} Live collection of visual elements
 */
function ExtractVisualElements(svg) {
    let visualId = 0

    // this is a live collection of elements in class <VISUAL_ELEMENT_LABEL>
    const elements = svg.getElementsByClassName(VISUAL_ELEMENT_LABEL)

    // remove all existing visual element marks just to be safe
    while (elements.length > 0) {
        elements.item(0).classList.remove(VISUAL_ELEMENT_LABEL)
    }

    // mark all elements with the appropriate tag
    for (const tag of VISUAL_ELEMENT_TAGS) {
        const shapeGroup = svg.getElementsByTagName(tag)
        for (const shape of shapeGroup) {
            shape.classList.add(VISUAL_ELEMENT_LABEL)
            shape.setAttribute("visualId", visualId)
            visualId += 1
        }
    }

    return elements
}

export {VisualizationElement}
