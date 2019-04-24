
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

function abbr_to_name(abbr) {
    mapper = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FL": "Florida",
        "GA": "Georgia",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    }

    return mapper[abbr]
}

function name_to_abbr(name) {
    mapper = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "District Of Columbia": "DC",
        "Florida": "FL",
        "Georgia": "GA",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Puerto Rico": "PR",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY"

    }

    return mapper[name]
}

function createMap(geoJson) {
    d3.select("#svgdiv").select("svg").remove();

    valuemap = mapValues(geoJson);
    color = d3.scaleQuantize()
        .domain([valuemap[0], valuemap[valuemap.length - 1]])
        .range(colorscheme)

    var svgextent = [600, 600];

    var projection = d3.geoAlbersUsa();

    var geoGenerator = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#svgdiv").append("svg")
        .attr("width", svgextent[0])
        .attr("height", svgextent[1]);

    // BACKGROUND
    d3.select("#svgdiv").select("svg").append("rect")
        .attr("width", svgextent[0])
        .attr("height", svgextent[1])
        .style("fill", "#66aaaa")
        .style("stroke", "black")
        .style("stroke-width", "2px");

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
            updateText(this, d, i);
            changeSelection(this, d, i);
            drawState(d);
        })
        .attr("class", "chloropleth_g");

    // legend very slightly modified from https://beta.observablehq.com/@mbostock/d3-choropleth

    // cleanup any old legends
    d3.select(".legend").remove();
    svg.append("g").attr("class", "legend");

    let legendtranslate = "(" + (svgextent[0] - 280) + ", " + (svgextent[1] - 50) + ")";
    var legend = svg.selectAll("g.legend");
    var legendText = "Percent of Total Fires"

    const x = d3.scaleLinear()
        .domain(d3.extent(color.domain()))
        .rangeRound([0, 260]);

    legend.selectAll("rect")
        .data(color.range().map(d => color.invertExtent(d)))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("fill", d => color(d[0]))
        ;

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
