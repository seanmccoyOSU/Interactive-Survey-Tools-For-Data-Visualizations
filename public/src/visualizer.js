let visualElements

fetch("../hyper.svg")
  .then(response => response.text())
  .then(svgText => {
    // Create a new SVG element
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = document.body.appendChild(svgDoc.documentElement);

    visualElements = document.getElementsByTagName("path")

    console.log(visualElements)

    console.log(visualElements.length)

    for(let i = 0; i < visualElements.length; i++) {
        console.log("add listener")
        visualElements.item(i).addEventListener("click", ToggleSelected)
    }
  })

function ToggleSelected(evt) {
    evt.currentTarget.classList.toggle("selected")
    console.log("toggle select")
}







//visualElements.forEach(element => {
 //   element.addEventListener("click", ToggleSelected(element))
//})