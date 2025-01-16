fetch("../hyper.svg")
  .then(response => response.text())
  .then(svgText => {
    // Create a new SVG element
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = document.body.appendChild(svgDoc.documentElement);

    // Access elements within the SVG
    //const circle = svg.querySelector("circle");
    // ...
  })