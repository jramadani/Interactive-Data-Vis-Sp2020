d3.csv("../data/top50.csv").then(data => {
  const table = d3.select("table");

  const thead = table.append("thead");
  thead
    .append("tr")
    .append("th")
    .attr("colspan", "15")
    .text("By Popularity");

  thead
    .append("tr")
    .selectAll("th")
    .data(data.columns)
    .join("td")
    .text(d => d);

  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .join("tr");

  rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    .attr("class", d => (+d.includes("pop") ? "pop" : null))
    .text(d => d);
});
