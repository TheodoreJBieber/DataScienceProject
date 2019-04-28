// FILE IS TODO: 
// geo json data taken from http://eric.clst.org/tech/usgeojson/

var totalfires = 0; // keep a count of the total # of fires. Might get rid of this eventually

function mergeData(geoJson, state_counts) {
    console.log("Merging data...");

    // TODO: delete Puerto Rico, DC ?
    geoJson.features.splice(26, 1);
    geoJson.features.splice(16, 1);

    for (var i = 0; i < geoJson.features.length; i++) {
        // geoJson.features[i].properties
        var state = geoJson.features[i].properties["NAME"];

        count = state_counts[name_to_abbr(state)]

        geoJson.features[i].properties['firecount'] = count;

        totalfires += count;
    }

    console.log("Done merging data.");
}

d3.json("../dataset/state_counts.json", function (fire_data) {
    d3.json("usa_high_res.json", function (data) {
        console.log("Starting usa_high_res...");
        mergeData(data, fire_data); // merge fire data with geoJson 
        console.log(data);
        drawDefaultTimeChart(d3.select("#time_div"));
        clearStateMap(d3.select("#state_div"));
        createMap(data); // draw the map!
    });// end geojson data read in
});//end fire_data read in


// variables for styling
let defaultcolor = "black";
let defaultwidth = "1px";

let valuemap = [];
var colorscheme = d3.schemeReds[9];
var color = null;

function mapValues(geoJson) {
    let answer = geoJson.features.map(d => {
        var max = totalfires;
        var val = d.properties.firecount;

        return val / max;
    });
    answer.sort();
    return answer;
}

function createMap(geoJson) {
    d3.select("#us_div").select("svg").remove();

    valuemap = mapValues(geoJson);
    color = d3.scaleQuantize()
        .domain([valuemap[0], valuemap[valuemap.length - 1]])
        .range(colorscheme)

    var svgextent = [700, 720];

    var projection = d3.geoAlbersUsa();

    var geoGenerator = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#us_div").append("svg")
        .attr("width", svgextent[0])
        .attr("height", svgextent[1]);

    // BACKGROUND
    d3.select("#us_div").select("svg").append("rect")
        .attr("width", svgextent[0])
        .attr("height", svgextent[1])
        .style("fill", "#66aaaa")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .on("click", function (d, i) { // let users select a state
            clearStateMap(d3.select("#state_div"));
            clearStateLineChart(d3.select("#time_div"));
            drawDefaultTimeChart(d3.select("#time_div"));
        });

    projection.fitExtent([[0, 0], svgextent], geoJson);


    svg.append("g")
        .selectAll('path')
        .data(geoJson.features)
        .enter()
        .append('path')
        .attr('d', geoGenerator)
        .style("fill", function (d, i) {
            var max = totalfires;
            var val = d.properties.firecount;

            return color(val / max);
        })
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .on("click", function (d, i) { // let users select a state
            drawState(d3.select("#state_div"),geoJson, name_to_abbr(d.properties.NAME));
            drawStateLineChart(d3.select("#time_div"), name_to_abbr(d.properties.NAME));
        })
        .attr("class", "chloropleth_g");

    // legend very slightly modified from https://beta.observablehq.com/@mbostock/d3-choropleth

    // cleanup any old legends
    d3.select(".legend").remove();
    svg.append("g").attr("class", "legend");

    let legendtranslate = "(" + (svgextent[0] - 280) + ", " + (svgextent[1] - 50) + ")";
    var legend = svg.selectAll("g.legend");
    var legendText = "Percent of Total Fires";

    const x = d3.scaleLinear()
        .domain(d3.extent(color.domain()))
        .rangeRound([0, 260]);

    legend.selectAll("rect")
        .data(color.range().map(d => color.invertExtent(d)))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("fill", d => color(d[0]));

    legend.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(legendText);

    legend.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.range().slice(1).map(d => color.invertExtent(d)[0])))
        .select(".domain")
        .remove();

    // move the legend to the bottom right
    legend
        .attr("transform", "translate" + legendtranslate);
}
