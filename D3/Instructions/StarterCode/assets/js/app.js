var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}
function renderTextCircles(circlesTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesTextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))

  return circlesTextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var Xlabel;
  var Ylabel;

  if (chosenXAxis === "poverty") {
    Xlabel = "Poverty:";
  }
  else if (chosenXAxis === "income") {
    Xlabel = "Income";
  }
  else {
    Xlabel = "Age";
  }

  if (chosenYAxis === "healthcare") {
    Ylabel = "healthcare";
  }
  else if (chosenYAxis === "obesity"){
    Ylabel === "Obesity"
  }
  else {
    Ylabel = "Smokes"
  }
  
  var toolTip = d3.tip()
    .offset([80, -60])
    .attr("class", "d3-tip")
    .html(function(d) {
      return (`${d.state}<br>${Xlabel} ${d[chosenXAxis]}<br>${Ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    // .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "#89bdd3")
    .attr("opacity", ".75")
    .attr("stroke", "#e3e3e3");
    
    var circlesTextGroup = chartGroup.selectAll("text")
    .data(healthData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em")
    .classed("stateText", true)
    .text(d => d.abbr)


    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width/2}, ${height+20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty(%)");

      var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age(Median)");
      
      var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income(median)");

      var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

      var healthLabel = ylabelsGroup.append("text")
      .attr("y", 60 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare(%)");

      var obeseLabel = ylabelsGroup.append("text")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese(%)");

      var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes(%)");




  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        chosenXAxis = value;

        // console.log(chosenXAxis)

        xLinearScale = xScale(healthData, chosenXAxis);

        xAxis = renderXAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesTextGroup = renderTextCircles(circlesTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      }
    });

    ylabelsGroup.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        // console.log(chosenXAxis)

        yLinearScale = yScale(healthData, chosenYAxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesTextGroup = renderTextCircles(circlesTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      }
  });
}).catch(function(error) {
  console.log(error);
});
