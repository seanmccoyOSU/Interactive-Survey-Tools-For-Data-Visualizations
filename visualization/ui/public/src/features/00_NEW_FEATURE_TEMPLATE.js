import { visualizationElement, svgElement, wrapper, debug, screenToSVG, page, visualContainer } from "../visualizer.js"

export const RENAME_TO_NEW_FEATURE = (visualizer) => {

    const decoratedVisualizer = Object.create(visualizer)

    decoratedVisualizer.onFirstLoadSvg = function() {
        visualizer.onFirstLoadSvg()
        // new code here
    }

    decoratedVisualizer.onLoadSvg = function() {
        visualizer.onLoadSvg()
        // new code here
    }

    decoratedVisualizer.onPageLoad = function() {
        visualizer.onPageLoad()
        // new code here
    }

    decoratedVisualizer.onPageLoadAsParticipant = function() {
        visualizer.onPageLoadAsParticipant()
        // new code here
    }


    decoratedVisualizer.onPageLoadAsEditor = function() {
        visualizer.onPageLoadAsEditor()
        // new code here
    }

    decoratedVisualizer.onPageLoadDebug = function() {
        visualizer.onPageLoadDebug()
        // new code here
    }

    decoratedVisualizer.onChangeMode = function() {
        visualizer.onChangeMode()
        // new code here
    }

    return decoratedVisualizer
}