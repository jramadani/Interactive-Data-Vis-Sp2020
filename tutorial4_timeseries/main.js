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

/* APPLICATION STATE */
let state = {
  data: [],
  selectedCType: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH

d3.json("../data/OPENcouncildata.json", d => ({
  year: new Date(d.OPENYEAR, 0, 1),
  ctype: d.values.COMPLAINT_TYPE,
  complaint: +d.values.length
})).then(raw_data => {
  nestedData = d3
    .nest()
    .key(function(d) {
      return d.OPENYEAR;
    })
    .entries(raw_data);

  // nestedData = Array.from(d3.nest(raw_data, v => d3.sum(v, d => d.OPENYEAR)));
  console.log("nestedData", nestedData);
  console.log("raw_data", raw_data);
  state.data = nestedData;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => new Date(d.key, 0, 1)))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.values.length)])
    .range([height - margin.bottom, margin.top]);

  // + AXES
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    console.log(state.data);
    draw(); // re-draw the graph based on this new selection
  });

  // var ctype = d3
  //   .values(nestedData)
  //   .map(d => d.values.map(v => v.COMPLAINT_TYPE).join(", "));

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(
      [
        "Aging",
        "Housing and Buildings",
        "Transportation",
        "Utilities",
        "General Welfare",
        "Finance",
        "Environment",
        "Sanitation",
        "Health",
        "Quality of Life",
        "Parks",
        "Public Safety",
        "Youth Services",
        "Immigration",
        "Legal Services",
        "Education",
        "Veterans Affairs",
        "Governmental Operations",
        "Human and Civil Rights",
        "Civil Service and Labor",
        "Consumer Affairs",
        "Land Use and Zoning",
        "Economy/Jobs"
      ]
      // [
      //   ...Array.from(
      //     new Set(
      //       state.data.map(i =>
      //         d3
      //           .values(nestedData)
      //           .map(d => d.values.map(v => v.COMPLAINT_TYPE))
      //       )
      //     )
      //   ),
      //   default_selection
      // ]

      // [
      //   "All",
      //   ...new Set(
      //     state.data.map(i =>
      //       d3
      //         .values(nestedData)
      //         .map(d => d.values.map(v => v.COMPLAINT_TYPE))
      //     )
      //   )
      // ]
    ) // + ADD DATA VALUES FOR DROPDOWN
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
    .attr("fill", "black");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-lr")
    .text("Complaints")
    .attr("fill", "black");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE

  //note to self here: we're filtering based on complaint data
  let filteredData = [];
  if (state.selectedCType !== null) {
    filteredData = state.data.filter(d =>
      d.values.filter(v => v === state.selectedCType)
    );
  }

  // + UPDATE SCALE(S), if needed
  // yScale.domain([0, d3.max(filteredData, d => d.complaint)]);

  // + UPDATE AXIS/AXES, if needed
  // d3.select("g.y-axis")
  //   .transition()
  //   .duration(1000)
  //   .call(yAxis.scale(yScale)); // this updates the yAxis' scale to be our newly updated one

  // + DRAW CIRCLES, if you decide to

  // const dot = svg
  //   .selectAll(".dot")
  //   .data(state.data, d => d.key) // use `d.year` as the `key` to match between HTML and data elements
  //   .join(
  //     enter =>
  //       // enter selections -- all data elements that don't have a `.dot` element attached to them yet
  //       enter
  //         .append("circle")
  //         .attr("class", "dot") // Note: this is important so we can identify it in future updates
  //         .attr("r", radius)
  //         .attr("cy", d => yScale(d.values.length)) // initial value - to be transitioned
  //         .attr("cx", d => xScale(d.key)),
  //     update => update,
  //     exit =>
  //       exit.call(exit =>
  //         // exit selections -- all the `.dot` element that no longer match to HTML elements
  //         exit
  //           .transition()
  //           .delay(d => d.key)
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
  //         .attr("cy", d => yScale(d.values.COMPLAINT_TYPE)) // started from the bottom, now we're here
  //   );

  // + DRAW LINE AND AREA
  const lineFunc = d3
    .line()
    .x(d => xScale(d.key))
    .y(d => yScale(d.values.length));

  const line = svg
    .selectAll("path.trend")
    .data(nestedData)
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("opacity", 1),
      update => update,
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc(d))
    );
}
