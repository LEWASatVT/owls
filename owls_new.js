//Go over limitPoints method
//Can I just include another js file in the head section? Should I just make another file for helper methods? 
//Should we have one drawChart method?


// Points to the API host and header
var host = "http://lewaspedia.enge.vt.edu:8080";
var header = "/sites/stroubles1/metricgroups";	

// Stores all the data parameters
var data_items = [];

// Contains the number of days that should be queried
var query_time = 14;

//Initializes currentIndex
var currentIndex = [0, 1, 2];

//var parentHeight = document.getElementById("#graph").clientHeight;
var margin = {left: 60, right: 108, top: 70, bottom: 60};

var width = 720 - margin.left - margin.right;
var height = 460 - margin.top - margin.bottom;

//Provides the scales for the axes and the actual data	   
var x = d3.time.scale().range([0, width]);
var y = [];
y[0] = d3.scale.linear().range([height, 0]);
y[1] = d3.scale.linear().range([height, 0]);
y[2] = d3.scale.linear().range([height, 0]);

formatTime = d3.time.format("%a %I:%M %p");
//sets the x axis structure and scales it.  		
var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(3)
					.tickFormat(formatTime)
					//adds the grid lines
					.innerTickSize(-height) 
					.outerTickSize(0)
					.tickPadding(10);

var yAxis = [];
var yLabel = [];
//sets the y1 axis structure.
var yAxis[0] = d3.svg.axis()
					.scale(y1)
					.orient("left")
					.ticks(10)
					//adds the grid lines
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(10);
					
//sets the y2 axis structure.
var yAxis[1] = d3.svg.axis()
					.scale(y2)
					.orient("right")
					.ticks(10);

//sets the y3 axis structure.
var yAxis[2] = d3.svg.axis()
					.scale(y3)
					.orient("right")
					.ticks(10);		
// Define the div tooltips
var div = d3.select("div#graph").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

//Creates the canvas. 
var canvas = d3.select("div#graph").append("svg")
						.style("background-color", "white")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		
//Defines circles1, 2, and 3
var circles = [];

//Defines the colors used for the dots and tooltips
var colors = ["steelblue", "red", "green"];
var altColors = ["#42C0FB", "#FF8300", "#66FF66"];
	
canvas.append("text")
		.attr("class", "title")
		.attr("text-anchor", "middle")
		.attr("x", (width) / 2)
		.attr("y", -margin.top * 1/2)
		.text("Live LEWAS Data");	
	

//Maybe use a while loop?
//for loop to scroll through the header requests...
/*
for (var i = 0; i <= 2; i++)
{
	console.log(i);
	// Queries the API header for parameter 1
	var header_request = new XMLHttpRequest();
	header_request.onreadystatechange = function() {
		if (header_request.readyState == 4 && header_request.status == 200) {
			var response = JSON.parse(header_request.responseText);						
			// Parse the header
			for (var j in response) {
				// Push the metric header to the dropdown only if there is at least one metric
				if (response[j]._embedded.metrics.length > 0) {
					addDropdownHeader(response[j], i, function() {
						var result = "";
						var value = 0;
						for (var k in response[j]._embedded.metrics) {
							var item = response[j]._embedded.metrics[k];
							console.log(i);
							if (i == 0) {
								data_items.push(item);
							}
							// Add item to the first dropdown list
							result += addDropdownItem(item, value);
							value++;
						}
						return result;
					});
				}
			}
			console.log(data_items);
			// Render the first data parameters
			renderData(data_items[currentIndex[i]], i);
		}
	}
	header_request.open("GET", host + header, true);
	header_request.send();
}
*/

//Read through this one more time. I believe you will
//have to increment a value each time to get this to work. 
//http://www.html5rocks.com/en/tutorials/es6/promises/
/*
function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => {
      if (req.status == 200) {
        resolve(JSON.parse(req.response));
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error("Network Error"));
    };
    req.send();
  });
}
*/
function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = () => {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error("Network Error"));
    };
    req.send();
  });
}
//Allows you skip the process of returning the response first. 
function getJSON(url) {
  return get(url).then(JSON.parse);
}

getJSON('http://lewaspedia.enge.vt.edu:8080/sites/stroubles1/metrics')
  .then((response) => {
    console.log("Success!", response);
  }, (error) => {
    console.error("Failed!", error);
});


/*
// Queries the API header for parameter 2
var header_request2 = new XMLHttpRequest();
header_request2.onreadystatechange = function() {
	if (header_request2.readyState == 4 && header_request2.status == 200) {
		var response2 = JSON.parse(header_request2.responseText);						
		// Parse the header
		for (var i in response2) {
			// Push the metric header to the dropdown only if there is at least one metric
			if (response2[i]._embedded.metrics.length > 0) {
				addDropdownHeader2(response2[i], function() {
				var result2 = "";
				for (var k in response2[i]._embedded.metrics) {
					var item = response2[i]._embedded.metrics[k];

					// Add item to the second dropdown list
					result2 += addDropdownItem2(item, number2);
					number2++;
				}		
				return result2;
				});
			}
		}
		// Render the first data parameters
		renderData2(data_items[currentIndex[1]]);
		//Access the DOM to make the initial dropdown value the second option. 
		document.getElementById("dropdown2").options[currentIndex[1]].selected = true;
	}
}
header_request2.open("GET", host + header, true);
header_request2.send();	
	
// Queries the API header for parameter 3
var header_request3 = new XMLHttpRequest();
header_request3.onreadystatechange = function() {
    if (header_request3.readyState == 4 && header_request3.status == 200) {
        var response3 = JSON.parse(header_request3.responseText);						
        // Parse the header
        for (var i in response3) {

            // Push the metric header to the dropdown only if there is at least one metric
            if (response3[i]._embedded.metrics.length > 0) {
                addDropdownHeader3(response3[i], function() {
                    var result3 = "";
                    for (var k in response3[i]._embedded.metrics) {
                        var item = response3[i]._embedded.metrics[k];

                        // Add item to the second dropdown list
                        result3 += addDropdownItem3(item, number3);
						number3++;
                    }		
                    return result3;
                });
            }
        }
        // Render the first data parameters
        renderData3(data_items[currentIndex[2]]);
		//Access the DOM to make the initial dropdown value the third option. 
		document.getElementById("dropdown3").options[currentIndex[2]].selected = true;
	}
}
header_request3.open("GET", host + header, true);
header_request3.send();	
*/
///////////////////////////////////////////Functions///////////////////////////////////////////

//addDropdownHeaders	
function addDropdownHeader(item, index, callback) {
    // Items must be a parameter and cannot be read from globally-scoped variable
    var element = document.getElementById("dropdown" + index);
	// Construct the options inside the dropdown, set the value equal to the array index for loading
    // Call the callback, adding the elements
    // Add the last element	
    element.innerHTML += "<optgroup label=\"" + item.name.capitalize() + "\">" + callback() + "</optgroup>";
}
/*
function addDropdownHeader2(item, callback) {
    // Items must be a parameter and cannot be read from globally-scoped variable
    var element = document.getElementById('dropdown2');
    element.innerHTML += "<optgroup label=\"" + item.name.capitalize() + "\">" + callback() + "</optgroup>";
}

function addDropdownHeader3(item, callback) {
    // Items must be a parameter and cannot be read from globally-scoped variable
    var element = document.getElementById('dropdown3');
    element.innerHTML += "<optgroup label=\"" + item.name.capitalize() + "\">" + callback() + "</optgroup>";
}
*/

//renders data for the specified dropdown option
function load(selected, index) {
	currentIndex[index] = selected.value;
	if (index == 0) {
		renderData(data_items[selected.value], index);
	} else {
		var chbx = document.getElementById("chbx" + index);
		if (chbx.checked) {
			renderData(data_items[selected.value], index);
		}
	}	
}	

/*
function load2(selected) {	
	currentIndex[1] = selected.value;
	var chbx2 = document.getElementById("chbx2");
	if (chbx2.checked) {
		renderData2(data_items[selected.value]);
	}
}

function load3(selected) {
	currentIndex[2] = selected.value;
	var chbx3 = document.getElementById("chbx3");
	if (chbx3.checked) {
		renderData3(data_items[selected.value]);
	}
}
*/

//addDropDownItems
function addDropdownItem(item, number) {
    // Construct the options inside the dropdown, set the value equal to the array index for loading
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}	

/*
function addDropdownItem2(item, number) {
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}	
	
function addDropdownItem3(item, number) {
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}		
*/
function renderData(data_item, index) {
    // Creates a new XMLHttpRequest to get detailed from header object
    var data_request = new XMLHttpRequest();
    data_request.onreadystatechange = function() {
        if (data_request.readyState == 4 && data_request.status == 200) {
            var response = JSON.parse(data_request.responseText);
			console.log(response);
            // Handles response array versus response object
            if (response[0]) {
					drawChart(response[0], index);
			} else {
					drawChart(response, index);
			}
        }
    }
	console.log(data_item);
    data_request.open("GET", host + data_item._links.timeseries.href + '?since=' + getDateSince(query_time).toISOString(), true);
    data_request.send();
}
	
}
/*
function renderData2(data_item) {
    // Creates a new XMLHttpRequest to get detailed from header object
    var data_request = new XMLHttpRequest();
    data_request.onreadystatechange = function() {
        if (data_request.readyState == 4 && data_request.status == 200) {
            var response = JSON.parse(data_request.responseText);
			
            // Handles response array versus response object
            if (response[0]) {
				if (ctr2 == 0) {
					drawChart2(response[0]);
					ctr2++;
				} else {
					updateChart2(response[0]);
				}
            } else {
				if (ctr2 == 0) {
					drawChart2(response);
					ctr2++;
				} else {
					updateChart2(response);
				}
				
            }
        }
    }
    data_request.open("GET", host + data_item._links.timeseries.href + '?since=' + getDateSince(query_time).toISOString(), true);
    data_request.send();
}

function renderData3(data_item) {
    // Creates a new XMLHttpRequest to get detailed from header object
    var data_request = new XMLHttpRequest();
    data_request.onreadystatechange = function() {
        if (data_request.readyState == 4 && data_request.status == 200) {
            var response = JSON.parse(data_request.responseText);
			
            // Handles response array versus response object
            if (response[0]) {
				if (ctr3 == 0) {
					drawChart3(response[0]);
					ctr3++;
				} else {
					updateChart3(response[0]);
				}
            } else {
				if (ctr3 == 0) {
					drawChart3(response);
					ctr3++;
				} else {
					updateChart3(response);
				}
				
            }
        }
    }
	console.log(host + data_item._links.timeseries.href);
    data_request.open("GET", host + data_item._links.timeseries.href + '?since=' + getDateSince(query_time).toISOString(), true);
    data_request.send();
}	
*/
function drawChart(raw_data, index) {
	console.log("drawChart");
	//Sets the y label for the specified index
	yLabel[index] = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	
	//Limits points and changes the date format
	var formattedData = limitPoints(formatData(raw_data.data));		
		
	//JSON data (x: date, y: value) 
	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
		
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y axis) min and max.
	y[index].domain([bufferMin, bufferMax]);
	
	//Attempt to check if specified y axis is there to determine whether to draw or update. 
	//Not sure if this will work. 
	if (d3.select(".y" + (index + 1) + "Axis") {
		circles[index].transition().remove().duration(500);
	}
	
	//Adds the hover circles and the tooltips
	circles[index] = canvas.selectAll("dot1")	
						.data(dataJSON);
	circles[index].enter()
				.append("circle")
				.style("fill", colors[index])
				.attr("r", 2)		
				.attr("cx", function(d) { return x(d.x); })		 
				.attr("cy", function(d) { return y[index](d.y); })		
				.on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)	
						.style("background", altColors[index])
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.duration(0)
						.attr("r", 8);
					})	
				.on("click", function (d) {
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.duration(0)
						.style("fill", altColors[index])
						.style("stroke", "black")
						.style("stroke-width", 2)
						.attr("r", 10);
					})	
				.on("mouseout", function() {	
					div.transition()		
						.duration(3000)		
						.style("opacity", 0)
					d3.select(this)
						.transition()
						.delay(250)
						.duration(1000)
						.attr("r", 2)
						.style("fill", colors[index])
						.style("stroke", colors[index]);
				});	
		if (d3.select(".y" + (index + 1) + "Axis") {
			//Updates 
			var pseudoCanvas = d3.select("body").transition();
			pseudoCanvas.select(".xAxis")
            .duration(750)
            .call(xAxis);
			pseudoCanvas.select(".y" + (index + 1) + "Axis")
            .duration(750)
            .call(y1Axis);
			pseudoCanvas.select(".y" + (index + 1) + "Label")
			.duration(750)
			.text(yLabel[index]);
		} else {
			//Draws first time
			//Appends the y axis
			canvas.append("g")
				.attr("class", "y" + (index + 1) "Axis")
				.call(yAxis[index]);	
			//Appends the y axis label
			canvas.append("text")
				.attr("class", "y" + (index + 1) + "Label")
				.attr("transform", "translate(" + (margin.left / 8) + "," + (-margin.top / 8) + ")")
				.text(yLabel[index]);
			//Appends the x axis
			canvas.append("g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);
			//Appends the x axis label
			canvas.append("text")
				.attr("class", "xLabel")
				.attr("transform", "translate(" + (width / 2) + "," + (height + (3 * margin.bottom / 4))  + ")")
				.text("Time (EDT)");	
		}
}	

/*
function drawChart2(raw_data) {
	console.log("drawChart2");
	//Sets the y2 axis title
	var y2Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = limitPoints(formatData(raw_data.data));		
	
	//JSON data (x: date, y: value) for parameter 2 
	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	console.log(dataJSON.length);
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y2.domain([bufferMin, bufferMax]);
	
	//Adds the hover circles and the tooltips
	circles2 = canvas.selectAll("dot2")	
					.data(dataJSON);
					
    circles2.enter().append("circle")
					.style("fill", "red")
					.style("stroke", "#FF8300")
					.style("stroke-width", 1)
					.attr("r", 3)		
					.attr("cx", function(d) { return x(d.x); })		 
					.attr("cy", function(d) { return y2(d.y); })		
					.on("mouseover", function(d) {		
						div.transition()		
							.duration(200)		
							.style("opacity", .9);		
						div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)
							.style("background", "#ff7f7f")
							.style("left", (d3.event.pageX + 10) + "px")		
							.style("top", (d3.event.pageY - 60) + "px");	
						d3.select(this)
							.transition()
							.duration(500)
							.attr("r", 8);
						})	
					.on("click", function (d) {
						div.transition()		
							.duration(200)		
							.style("opacity", .9);		
						div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
							.style("background", "#FF8300")
							.style("left", (d3.event.pageX + 12) + "px")		
							.style("top", (d3.event.pageY - 60) + "px");
						d3.select(this)
							.transition()
							.style("fill", "black")
							.duration(500)
							.attr("r", 12);
						})	
					.on("mouseout", function(d) {		
						d3.select(this)
							.transition()
							.delay(250)
							.duration(1000)
							.attr("r", 3)
							.style("fill", "red");
						div.transition()		
							.duration(3000)		
							.style("opacity", 0)
					});	

    //Appends the y2 axis
    canvas.append("g")
        .attr("class", "y2 axis")
		.attr("transform", "translate(" + width + ",0)")
        .call(y2Axis);	
	
	//Appends the y2 axis label
	canvas.append("text")
		.attr("class", "y2Label")
		.attr("transform", "translate(" + (width / 2) + "," + (-margin.top / 8) + ")")
		.text(y2Label);		
}	

function drawChart3(raw_data) {
	console.log("drawChart3");
	
	//Sets the y3 axis title
	var y3Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = limitPoints(formatData(raw_data.data));		

	//JSON data (x: date, y: value) for parameter 3
	var dataJSON = [];	
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	console.log(dataJSON.length);
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y3.domain([bufferMin, bufferMax]);
	
	//Adds the hover circles and the tooltips
	circles3 = canvas.selectAll("dot3")	
					.data(dataJSON);			
	circles3.enter()
				.append("circle")
				.style("fill", "green")
				.style("stroke", "#66FF66")
				.style("stroke-width", 1)
				.attr("r", 3)		
				.attr("cx", function(d) { return x(d.x); })		 
				.attr("cy", function(d) { return y3(d.y); })		
				.on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)	
						.style("background", "lightgreen")
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.duration(500)
						.attr("r", 8);
					})
				.on("click", function (d) {
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
						.style("background", "#66FF66")
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.style("fill", "black")
						.duration(500)
						.attr("r", 12);
						})	
				.on("mouseout", function(d) {		
					d3.select(this)
						.transition()
						.delay(250)
						.duration(1000)
						.attr("r", 3)
						.style("fill", "green");
					div.transition()		
						.duration(3000)		
						.style("opacity", 0)
				});	
				
    //Appends the y2 axis
    canvas.append("g")
        .attr("class", "y3 axis")
		.attr("transform", "translate(" + (width + margin.right / 2) + ",0)")
        .call(y3Axis);	
	
	//Appends the y2 axis label
	canvas.append("text")
		.attr("class", "y3Label")
		.attr("transform", "translate(" + (width + margin.right / 4) + "," + (-margin.top / 8) + ")")
		.text(y3Label);		
}	
*/
/*
//Updates based on an option picked in the dropdown option bar
function updateChart(raw_data, index) {
	console.log("updateChart");
	circles[index].transition().remove().duration(500);
	
	var yLabel[index] = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = limitPoints(formatData(raw_data.data));		
	
	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y1 axis) min and max.
	y[index].domain([bufferMin, bufferMax]);
	
	circles1 = canvas.selectAll("dot1")	
					.data(dataJSON);
	circles1.enter()
			.append("circle")
			.style("fill", "steelblue")
			.style("stroke", "#42C0FB")
			.style("stroke-width", 1)
			.attr("r", 3)		
			.attr("cx", function(d) { return x(d.x); })		 
			.attr("cy", function(d) { return y1(d.y); })		
			.on("mouseover", function(d) {		
				div.transition()		
					.duration(200)		
					.style("opacity", .9);		
				div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)	
					.style("background", "lightsteelblue")
					.style("left", (d3.event.pageX + 10) + "px")		
					.style("top", (d3.event.pageY - 60) + "px");
				d3.select(this)
					.transition()
					.duration(500)
					.attr("r", 8);
				})	
			.on("click", function (d) {
				div.transition()		
					.duration(200)		
					.style("opacity", .9);		
				div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
					.style("background", "#42C0FB")
					.style("left", (d3.event.pageX + 10) + "px")		
					.style("top", (d3.event.pageY - 60) + "px");
				d3.select(this)
					.transition()
					.style("fill", "black")
					.duration(500)
					.attr("r", 12);
				})	
			.on("mouseout", function() {	
				d3.select(this)
					.transition()
					.delay(250)
					.duration(1000)
					.attr("r", 3)
					.style("fill", "steelblue");
				div.transition()		
					.duration(3000)		
					.style("opacity", 0)
			});	
	
	
	//Provides an interesting transition to the next graph
	var pseudoCanvas = d3.select("body").transition();
        pseudoCanvas.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        pseudoCanvas.select(".y1.axis") // change the y1 axis
            .duration(750)
            .call(y1Axis);
		pseudoCanvas.select(".y1Label")
			.duration(750)
			.text(y1Label);
}	

function updateChart2(raw_data) {
	console.log("updateChart2");
	circles2.transition().remove().duration(500);
	
	var y2Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = limitPoints(formatData(raw_data.data));		

	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y2.domain([bufferMin, bufferMax]);
		
	circles2 = canvas.selectAll("dot2")	
					.data(dataJSON);
					
    circles2.enter().append("circle")
					.style("fill", "red")
					.style("stroke", "#FF8300")
					.style("stroke-width", 1)
					.attr("r", 3)		
					.attr("cx", function(d) { return x(d.x); })		 
					.attr("cy", function(d) { return y2(d.y); })		
					.on("mouseover", function(d) {		
						div.transition()		
							.duration(200)		
							.style("opacity", .9);		
						div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)
							.style("background", "#ff7f7f")
							.style("left", (d3.event.pageX + 10) + "px")		
							.style("top", (d3.event.pageY - 60) + "px");	
						d3.select(this)
							.transition()
							.duration(500)
							.attr("r", 8);
						})	
					.on("click", function (d) {
						div.transition()		
							.duration(200)		
							.style("opacity", .9);		
						div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
							.style("background", "#FF8300")
							.style("left", (d3.event.pageX + 10) + "px")		
							.style("top", (d3.event.pageY - 60) + "px");
						d3.select(this)
							.transition()
							.style("fill", "black")
							.duration(500)
							.attr("r", 12);
						})	
					.on("mouseout", function(d) {		
						d3.select(this)
							.transition()
							.delay(250)
							.duration(1000)
							.attr("r", 3)
							.style("fill", "red");
						div.transition()		
							.duration(3000)		
							.style("opacity", 0)
					});	
	
	//Provides an interesting transition to the next graph
	var pseudoCanvas = d3.select("body").transition();
        pseudoCanvas.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        pseudoCanvas.select(".y2.axis") // change the y2 axis
            .duration(750)
            .call(y2Axis);
		pseudoCanvas.select(".y2Label")
			.duration(750)
			.text(y2Label);
}	

function updateChart3(raw_data) {
	console.log("updateChart3");
	circles3.transition().remove().duration(500);
	
	var y3Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = limitPoints(formatData(raw_data.data));		

	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the points doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y3 axis) min and max.
	y3.domain([bufferMin, bufferMax]);
	
	circles3 = canvas.selectAll("dot3")	
					.data(dataJSON);			
	circles3.enter()
				.append("circle")
				.style("fill", "green")
				.style("stroke", "#66FF66")
				.style("stroke-width", 1)
				.attr("r", 3)		
				.attr("cx", function(d) { return x(d.x); })		 
				.attr("cy", function(d) { return y3(d.y); })		
				.on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(formatTime(d.x) + "<br/>"  + d.y + " " + raw_data._embedded.units.abbv)	
						.style("background", "lightgreen")
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.duration(500)
						.attr("r", 8);
					})
				.on("click", function (d) {
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html("<b>" + formatTime(d.x) + "</b>" + "<br/>"  + "<b>" + d.y + " " + raw_data._embedded.units.abbv + "</b>")	
						.style("background", "#66FF66")
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.style("fill", "black")
						.duration(500)
						.attr("r", 12);
						})	
				.on("mouseout", function(d) {		
					d3.select(this)
						.transition()
						.delay(250)
						.duration(1000)
						.attr("r", 3)
						.style("fill", "green");
					div.transition()		
						.duration(3000)		
						.style("opacity", 0)
				});	
				
	//Provides an interesting transition to the next graph
	var pseudoCanvas = d3.select("body").transition();
        pseudoCanvas.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        pseudoCanvas.select(".y3.axis") // change the y3 axis
            .duration(750)
            .call(y3Axis);
		pseudoCanvas.select(".y3Label")
			.duration(750)
			.text(y3Label);
}	
*/
function refreshGraph() {
	for (var i in currentIndex) {
		renderData(data_items[currentIndex[i]], i);
	}
}	

function onCheck(chbx, index) {
	if (chbx.checked) {
		renderData(data_items[currentIndex[index]], index);
	}
	else {
		clearLine(index);
	}
}
/*
function onCheck3(chbx) {
	if (chbx.checked) {
		ctr3 = 0;
		renderData3(data_items[currentIndex[2]]);
	}
	else {
		clearLine3();
	}
}
*/
//removes all of the specified y axis if it is there.
function clearLine(index) {
	if (d3.select(".y" + (index + 1) + "Axis")) {
		var pseudoCanvas = d3.select("body").transition();
		pseudoCanvas.select(".y" + (index + 1) + ".axis").duration(750).remove();
		pseudoCanvas.select(".y" + (index + 1) + "Label").duration(750).remove();
		circles2.transition().remove().duration(500);
	}
}
/*
function clearLine3() {
	if (ctr3) {
		//removes line3, y3axis, y3label
		var pseudoCanvas = d3.select("body").transition();
		pseudoCanvas.select(".y3.axis").duration(750).remove();
		pseudoCanvas.select(".y3Label").duration(750).remove();
		//removes the circles (dots)
		circles3.transition().remove().duration(500);
	}
}
*/
//Does date calculation for the since parameter in the request
function getDateSince(days) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
}

// Switches the X and Y axis; converts the UTC data string to a Date object
function formatData(array) {
	for (var i in array) {
        var a = array[i][0];
        array[i][0] = new Date(array[i][1]);
        array[i][1] = a;
    }
    return array;
}

function limitPoints(array) {
    var result = [];
    for (var i in array) {
        if (i % Math.floor((array.length - 2000) / 2000) == 0) {
            result.push(array[i]);
        }
    }
    return result;
}

// Capitalizes all the words in a string
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};	