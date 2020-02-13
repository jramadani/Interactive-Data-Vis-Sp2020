d3.csv("../data/appStore.csv", d3.autoType).then(data => {
  //CONSTANTS
  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.9;
  (paddingInner = 0.2), (margin = { top: 50, bottom: 40, left: 40, right: 40 });

  //SCALES
  const yScale = d3
    .scaleBand()
    .domain(data.map(d => d.agerating))
    .range([0, 225])
    .paddingInner(0.2);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([margin.left, width - margin.right]);

  const xAxis = d3.axisBottom(xScale).ticks(data.length);
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(data.agerating)
    .tickSizeOuter(1);

  //DRAW
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d => yScale(d.agerating))
    .attr("x", xScale(0))
    //.attr("x", d => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.count) - xScale(0))
    .attr("fill", "gold");

  const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    .attr("y", d => yScale(d.agerating) + yScale.bandwidth() / 2)
    .attr("x", xScale(75))
    .text(d => d.count)
    .attr("dy", "5 em")
    .attr("color", "white");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, 275)`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);
});
