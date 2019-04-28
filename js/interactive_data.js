/*
 For the most part this is a file that has some helper functions. 

 The exception is the methods that draw a state and a line chart for that state
*/

// this method will draw a given state on an svg (TAKES THE STATE ABBREVIATION)
function drawState(svg, geoJson, state) {
    statefpath = "dataset/interactive_"+state+".json";

    d3.json(statefpath, function(data) {
        // first remove the old state map if it exists
        clearStateMap(svg);

        // now redraw it
        // create svg
        let stateextent = [475, 300];
        // statemap = svg.append("svg")
        //     .attr("width", stateextent[0])
        //     .attr("height", stateextent[1])
        //     .attr("id", "statemap");
          
        // statemap.append("rect")
        //     .attr("width", stateextent[0])
        //     .attr("height", stateextent[1])
        //     .style("fill", "#66aaaa")
        //     .style("stroke", "black")
        //     .style("stroke-width", "2px");

        // get the state we want
        statefeature = null;
        features = geoJson.features;
        stateName = abbr_to_name(state);
        for(i = 0; i < features.length; i++) {
            if(features[i].properties.NAME == stateName) {
                statefeature = features[i];
                break;
            }
        }

        // now draw the state
        var projection = d3.geoAlbersUsa();
        var geoGenerator = d3.geoPath()
            .projection(projection);

        projection.fitExtent([[0,0], stateextent], statefeature);

        statemap.append("g")
            .selectAll('path')
            .data([statefeature])
            .enter()
            .append('path')
            .attr('d', geoGenerator)
            .style("fill", "white")
            .style("stroke", "black")
            .style("stroke-width", "1px");

        // now draw the fire data on it
        // Only draw ones greater than the average
        let minfiresize = d3.mean(data.map(n=> {return n.size}));
        data = data.filter(n => n.size > minfiresize); // filters out ones smaller than average
        let max = d3.max(data.map(n=> {return n.size}));
        statemap.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function(d) {
                let coef = 0.7;
                return coef+coef*(d.size/max);
            })
            .style("fill", function(d) {
                return "red";
            })
    });
}

function clearStateMap(svg) {
    svg.select('#statemap').remove();
    let stateextent = [475, 300];
        statemap = svg.append("svg")
            .attr("width", stateextent[0])
            .attr("height", stateextent[1])
            .attr("id", "statemap");
          
        statemap.append("rect")
            .attr("width", stateextent[0])
            .attr("height", stateextent[1])
            .style("fill", "#66aaaa")
            .style("stroke", "black")
            .style("stroke-width", "2px");
}

/* Slice array into even sub arrays
from: https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
*/
function chunkify(a, n, balanced) {
    
    if (n < 2)
        return [a];

    var len = a.length,
            out = [],
            i = 0,
            size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }

    else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));

    }
    return out;
}

function clearStateLineChart(svg) {
    svg.select("#timegraph").remove();
}

function drawStateLineChart(svg, state) {
    statefpath = "dataset/interactive_"+state+".json";

    clearStateLineChart(svg);
    nsvg = svg.append("svg").attr("id", "timegraph");

    d3.json(statefpath, function(data) {
        yearly = {}

        for(i = 0; i < data.length; i++) {
            yearly[data[i].year] = yearly[data[i].year]+1 || 1;
        }

        drawGraph(nsvg, yearly);
    });
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