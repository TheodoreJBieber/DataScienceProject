// Draw a line chart
// Code adapted from: https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89

function drawDefaultTimeChart(svg) {
    nsvg = svg.append("svg").attr("id", "timegraph");
    d3.json("dataset/yearly_counts.json", function (yearly_counts) {
        drawGraph(nsvg, yearly_counts);
    });
}

function drawGraph(svg, data) {

    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var years = []
    for (var property in data) {
        if(data.hasOwnProperty(property)) {
            years.push(parseInt(property))
        }
    }

    var values = []
    for (var property in data) {
        if(data.hasOwnProperty(property)) {
            values.push(parseInt(data[property]))
        }
    }

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // Scale the range of the data
    x.domain([d3.min(years)-1,d3.max(years)+1]);
    y.domain([0, d3.max(values)*1.2]);

    // define the line
    var valueline = d3.line()
        .x(function(d,i) { return x(years[i]); })
        .y(function(d,i) { return y(d); })
        .curve(d3.curveMonotoneX);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    var graph = svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("id", "graph")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add the valueline path.
    graph.append("path")
        .data([values])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", valueline);

    // 12. Appends a circle for each datapoint 
    graph.selectAll(".dot")
        .data(values)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) { return x(years[i]) })
        .attr("cy", function(d) { return y(d) })
        .attr("r", 2)
        .attr("fill", "steelblue")

    // Add the X Axis
    graph.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    graph.append("g")
        .call(d3.axisLeft(y));

    graph.attr("transform", "translate(" + margin.left + "," + 0 + ")")

}
