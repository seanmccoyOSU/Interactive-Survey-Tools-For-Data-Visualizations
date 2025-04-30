document.getElementById("displayedImage")?.addEventListener('load', () => {
    const questionType = document.getElementById("requirements").getAttribute("questionType")

    if (questionType == "Select Elements") {
        // get saved ids of selected elements
        const savedResponse = document.getElementById("savedResponse").getAttribute("response")
        const selectedIds = savedResponse.split('|')
    
        // send message to iframe to highlight selected elements
        const visualURL = document.getElementById("visualURL").getAttribute("url")
        const visualWindow = document.getElementById("displayedImage").contentWindow
        visualWindow.postMessage({ selectIds: selectedIds }, visualURL)
        //visualWindow.postMessage({ selectIds: selectedIds }, window.location.protocol + "//" + window.location.hostname + ":" + window.location.port)  
    }
})