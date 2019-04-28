let svgextent = [1200, 600];

var svg = d3.select("#heat_div").append('svg')
        .attr("width", svgextent[0])
        .attr("height", svgextent[1]);

var path = d3.geoPath();

// var projection = d3.geoAlbersUsa();

var toolTip = d3.select('body').append('div');
toolTip.classed('tooltip', true);

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  // path.projection(projection);
  // projection.fitExtent([[0,0],svgextent], topojson.feature(us, us.objects.counties).features);
  d3.json("dataset/county_counts.json", function(error, counties){
    let min = -1;
    let max = -1;
    console.log(counties)
    for(let county in counties){
      county = counties[county];
      if(county.count == undefined){
        continue;
      }
      if(min == -1 || county.count < min){
        min = county.count;
      }
      if(max == -1 || county.count > max){
        max = county.count;
      }
    }
    console.log('min' + min)
    let colorscheme = d3.schemeRdYlBu[0];
    let col = d3.interpolateRdYlBu;//d3.scaleQuantize().domain([min, max]).range(colorscheme);
    svg.append("g")
        .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d){return counties[d.id] ? col(0.5 -(counties[d.id].count-min)/(max-min)) : col(0.8)})
        .style("stroke", "#303133")
        .on("mouseover", function(d) {    
            toolTip.transition()    
                .duration(200)    
                .style("opacity", .9);    
            toolTip.html("# Fires: " + (counties[d.id] ? counties[d.id].count : 0))  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            toolTip.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
  });

  // svg.append("path")
  //     .attr("class", "county-borders")
  //     .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));
});