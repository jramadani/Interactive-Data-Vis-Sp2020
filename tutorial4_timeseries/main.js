/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 80, right: 40 },
  radius = 5,
  default_selection = "Select a Complaint Type";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedCType: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH

d3.json("../data/OPENcouncildata.json")
  .then(data =>
    data.map(d => ({
      year: new Date(d.OPENYEAR, 0, 1),
      ctype: d.COMPLAINT_TYPE
    }))
  )
  .then(formattedData => {
    state.data = formattedData;
    init();
  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  // + AXES
  const xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selectedCType = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(Array.from(new Set(state.data.map(d => d.ctype)))) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.property("value", default_selection);

  // + CREATE SVG ELEMENT

  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + CALL AXES
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year")
    .attr("fill", "#259D98");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left / 2)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Complaints")
    .attr("fill", "#259D98");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData = [];
  if (state.selectedCType !== null) {
    filteredData = state.data.filter(d => d.ctype === state.selectedCType);
  }

  let nestedData = d3
    .nest()
    .key(function(d) {
      return d.year;
    })
    .entries(filteredData);

  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(nestedData, d => d.values.length)]);

  // + UPDATE AXIS/AXES, if needed
  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale)); // this updates the yAxis' scale to be our newly updated one

  // + DRAW CIRCLES, if you decide to
  // const dot = svg
  //   .selectAll(".dot")
  //   .data(nestedData, d => d.key) // use `d.year` as the `key` to match between HTML and data elements
  //   .join(
  //     enter =>
  //       // enter selections -- all data elements that don't have a `.dot` element attached to them yet
  //       enter
  //         .append("circle")
  //         .attr("class", "dot") // Note: this is important so we can identify it in future updates
  //         .attr("r", radius)
  //         .attr("cy", d => yScale(d.values.length)) // initial value - to be transitioned
  //         .attr("cx", d => xScale(new Date(d.key))),
  //     update => update,
  //     exit =>
  //       exit.call(exit =>
  //         // exit selections -- all the `.dot` element that no longer match to HTML elements
  //         exit
  //           .transition()
  //           .delay((d, i) => i * 10)
  //           .duration(500)
  //           .attr("cy", height - margin.bottom)
  //           .remove()
  //       )
  //   )
  //   // the '.join()' function leaves us with the 'Enter' + 'Update' selections together.
  //   // Now we just need move them to the right place
  //   .call(
  //     selection =>
  //       selection
  //         .transition() // initialize transition
  //         .duration(1000) // duration 1000ms / 1s
  //         .attr("cy", d => yScale(d.values.length)) // started from the bottom, now we're here
  //   );

  // + DRAW LINE AND AREA
  // const lineFunc = d3
  //   .line()
  //   .x(d => xScale(new Date(d.key)))
  //   .y(d => yScale(d.values.length));

  // const line = svg
  //   .selectAll("path.trend")
  //   .data([nestedData])
  //   .join(
  //     enter =>
  //       enter
  //         .append("path")
  //         .attr("class", "trend")
  //         .attr("stroke", "blue")
  //         .attr("fill", "transparent")
  //         .attr("opacity", 0),
  //     update => update,
  //     exit => exit.remove()
  //   )
  //   .call(selection =>
  //     selection
  //       .transition()
  //       .duration(1000)
  //       .attr("opacity", 1)
  //       .attr("d", d => lineFunc(d))
  //   );

  const areaFunc = d3
    .area()
    .x(d => xScale(new Date(d.key)))
    .y1(d => yScale(d.values.length))
    .y0(d => yScale(0));

  const area = svg
    .selectAll("path.trend")
    .data([nestedData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("fill", "#59C4C0")
          .attr("opacity", 0),
      update => update,
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => areaFunc(d))
    );
}
