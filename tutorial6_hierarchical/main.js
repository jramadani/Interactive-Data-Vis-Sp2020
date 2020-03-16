/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null,
  hover: null,
  mousePosition: null
};

/**
 * LOAD DATA
 * */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  console.log(state.data);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "absolute");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute");

  const colorScale = d3.scaleOrdinal(d3.schemeRdYlBu[10]);

  // + INITIALIZE TOOLTIP IN YOUR CONTAINER ELEMENT

  tooltip = container
    .append("div")
    .attr("class", "tooltip")
    .style("position", "relative");

  {
    //TREEMAP
    // // + CREATE YOUR ROOT HIERARCHY NODE
    // const root = d3
    //   .hierarchy(state.data)
    //   .sum(d => d.value)
    //   .sort((a, b) => b.value - a.value);
    // // + CREATE YOUR LAYOUT GENERATOR
    // const tree = d3
    //   .treemap()
    //   .size([width, height])
    //   .padding(0.75)
    //   .round(true);
    // // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
    // tree(root);
    // // + CREATE YOUR GRAPHICAL ELEMENTS
    // const leaf = svg
    //   .selectAll("g")
    //   .data(root.leaves())
    //   .join("g")
    //   .attr("transform", d => `translate(${d.x0},${d.y0})`);
    // leaf
    //   .append("rect")
    //   .attr("fill", d => {
    //     const anc1 = d.ancestors().find(d => d.depth === 1);
    //     return colorScale(anc1.data.name);
    //   })
    //   .attr("width", d => d.x1 - d.x0)
    //   .attr("height", d => d.y1 - d.y0)
    //   .on("mouseover", d => {
    //     state.hover = {
    //       translate: [d.x0 + (d.x1 - d.x0) / 2, d.y0 + (d.y1 - d.y0) / 2],
    //       name: d.data.name,
    //       value: d.data.value,
    //       title: `${d
    //         .ancestors()
    //         .reverse()
    //         .map(d => d.data.name)
    //         .join("/")}`
    //     };
    //     draw();
    //   });
  }
  //CIRCLE PACKING

  // + CREATE YOUR ROOT HIERARCHY NODE

  const root = d3
    .hierarchy(state.data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
  // + CREATE YOUR LAYOUT GENERATOR

  const node = d3
    .pack()
    .size([width, height])
    .padding(2);

  // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
  node(root);

  // + CREATE YOUR GRAPHICAL ELEMENTS
  const leaf = svg
    .selectAll("g")
    .data(root.descendants().slice(1))
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  leaf
    .append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => (d.children ? colorScale(d.depth) : "#FFE66B"))
    .on("mouseover", d => {
      state.hover = {
        translate: [d.x, d.y],
        name: d.data.name,
        value: d.data.value,
        title: `${d
          .ancestors()
          .reverse()
          .map(d => d.data.name)
          .join("/")}`
      };
      draw();
    });

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(
        `<div>Name: ${state.hover.name}</div>
      <div>Value: ${state.hover.value}</div>
      <div>Hierarchy Path: ${state.hover.title}</div>`
      )
      .transition()
      .duration(500)
      .style("background-color", "white")
      .style("color", "#A50026")
      .style("border-radius", "15px")
      .style("padding", "15px")
      .style("opacity", 0.85)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px, ${state.hover.translate[1]}px)`
      );
  }
}
