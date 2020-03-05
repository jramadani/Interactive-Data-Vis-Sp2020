/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let hoverData;

/**
 * APPLICATION STATE
 * */
let state = {
  // + SET UP STATE
  geojson: [],
  shootings: [],
  hover: {
    latitude: null,
    longitude: null,
    borough: null
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/borough-boundaries.geojson", d3.autoType),
  d3.csv("../data/shootings.csv", d3.autoType)
]).then(([geojson, shootings]) => {
  // + SET STATE WITH DATA
  state.geojson = geojson;
  state.shootings = shootings;
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + SET UP PROJECTION
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson);
  // + SET UP GEOPATH
  const path = d3.geoPath().projection(projection);

  // + DRAW BASE MAP PATH
  svg
    .selectAll(".borough")
    .data(state.geojson.features)
    .join("path")
    .attr("d", path)
    .attr("class", "borough")
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .on("mouseover", d => {
      state.hover["Borough"] = d.properties.boro_name;
      draw();
    });

  svg
    .selectAll("circle")
    .data(state.shootings)
    .join("circle")
    .attr("r", 3)
    .attr("fill", d => {
      if (d.STATISTICAL_MURDER_FLAG === "TRUE") return "#A32528";
      else return "white";
    })
    .attr("fill-opacity", 0.3)
    .attr("transform", d => {
      const [x, y] = projection([d.longitude, d.latitude]);
      return `translate(${x}, ${y})`;
    })
    .on("mouseover", d => {
      state.hover["Date"] = d.OCCUR_DATE;
      draw();
    });

  // + ADD EVENT LISTENERS (if you want)
  svg.on("mousemove", () => {
    // we can use d3.mouse() to tell us the exact x and y positions of our cursor
    const [mx, my] = d3.mouse(svg.node());
    // projection can be inverted to return [lat, long] from [x, y] in pixels
    const proj = projection.invert([mx, my]);
    state.hover["Longitude"] = proj[0];
    state.hover["Latitude"] = proj[1];
    draw();
  });
  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  hoverData = Object.entries(state.hover);
  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(d => (d[1] ? `${d[0]}: ${d[1]}` : null));
}

//Addition to test github pages load fail
