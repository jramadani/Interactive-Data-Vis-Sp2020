/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.65,
  height = window.innerHeight * 0.65,
  margin = { top: 20, bottom: 50, left: 100, right: 40 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedRating: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.json("../data/aamdor.json", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.review_count))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.word_count))
    .range([height - margin.bottom, margin.top]);

  // + AXES

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selectedRating = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "K", "K+", "T", "M"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

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
    .attr("fill", "white")
    .text("Review Count");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    // .attr("class", "axis-label")
    // .attr("y", "50%")
    // .attr("dx", "-5.5em")
    // .attr("writing-mode", "vertical-rl")
    .attr("fill", "white")
    .text("Word Count");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  let filteredData = state.data;
  // + FILTER DATA BASED ON STATE
  if (state.selectedRating !== "All") {
    filteredData = state.data.filter(d => d.rated === state.selectedRating);
  }

  const dot = svg
    .selectAll("circle")
    .data(filteredData, d => d.story_id)
    .join(
      enter =>
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "white")
          .attr("opacity", 0.5)
          .attr("fill", d => {
            if (d.rated === "K") return "#ffbe56";
            else if (d.rated === "K+") return "#ff8656";
            else if (d.rated === "T") return "#fff7e9";
            else return "#e48d00";
          })
          .attr("cx", d => xScale(d.review_count))
          .attr("cy", d => yScale(d.word_count))
          .attr("r", radius)
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 100 * d.word_count) // delay on each element
              .duration(250)
              .attr("cy", d => yScale(d.word_count))
          ), // + HANDLE ENTER SELECTION,
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(250)
            .attr("stroke", "#e3f5f8")
            .transition()
            .duration(250)
            .attr("fill", "#046391")
        ), // + HANDLE UPDATE SELECTION
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .delay(d => 50 * d.review_count)
            .duration(250)
            .attr("r", radius)
            .remove()
        ) // + HANDLE EXIT SELECTION
    );
}
