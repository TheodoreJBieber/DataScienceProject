let svgextent = [1200, 600];

var svg = d3.select("#heat_div").append('svg')
        .attr("width", svgextent[0])
        .attr("height", svgextent[1]);

var path = d3.geoPath();

// var projection = d3.geoAlbersUsa();

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  // path.projection(projection);
  // projection.fitExtent([[0,0],svgextent], topojson.feature(us, us.objects.counties).features);
  d3.json("", function(error, counties){

  });
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d){console.log(d)});

  svg.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));
});
