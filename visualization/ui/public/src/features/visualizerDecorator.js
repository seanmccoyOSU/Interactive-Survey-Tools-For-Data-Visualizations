// This file brings all the feature decorators together into one decorator

import {exportButton} from "./exportButton.js"
import {zoomPan} from "./zoomPan.js"
import {selectElements} from "./selectElements.js"
// ^ import your feature here

const decorators = [exportButton, zoomPan, selectElements]  // <-- add your feature to this array

export const visualizerDecorator = (visualizer) => {
    let decoratedVisualizer = visualizer

    for (const decorator of decorators) {
        decoratedVisualizer = decorator(decoratedVisualizer)
    }

    return decoratedVisualizer
}