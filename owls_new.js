//Add the bottom bar 
//Add an option to view picture of specific parameter.
//Figure out why refresh button cannot be defined outside header functions. 

//Ask if you can make an algorithm to limit points shown for SPECIFIC parameters.
//Ask James what API to use.

//I didn't use the limitPoints function because it produced some errors. 

// Points to the API host and header
var host = "http://lewaspedia.enge.vt.edu:8080";
var header = "/sites/stroubles1/metricgroups";	

//ctrs required to tell whether to drawChart or updateChart
var ctr = 0;
var ctr2 = 0;
var ctr3 = 0;

// Stores all the data parameters
var data_items = [];
var data_items2 = [];
var data_items3 = [];

//Values for each data_item
var number1 = 0;
var number2 = 0;
var number3 = 0;

var dropdownWidth = 210;
var dropdownGap = 60;
var labelPadding = 40;


// Contains the number of days that should be queried
var query_time = 14;

//Initializes currentIndex
var currentIndex1 = 0;
var currentIndex2 = 1;
var currentIndex3 = 2;

var margin = {left: 60, right: 108, top: 70, bottom: 60};
var width = 720 - margin.left - margin.right;
var height = 460 - margin.top - margin.bottom;


//Provides the scales for the axes and the actual data	   
var x = d3.time.scale().range([0, width]);
var y1 = d3.scale.linear().range([height, 0]);
var y2 = d3.scale.linear().range([height, 0]);
var y3 = d3.scale.linear().range([height, 0]);

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

//sets the y1 axis structure.
var y1Axis = d3.svg.axis()
					.scale(y1)
					.orient("left")
					.ticks(10)
					//adds the grid lines
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(10);
					
//sets the y2 axis structure.
var y2Axis = d3.svg.axis()
					.scale(y2)
					.orient("right")
					.ticks(10);

//sets the y3 axis structure.
var y3Axis = d3.svg.axis()
					.scale(y3)
					.orient("right")
					.ticks(10);		
					
//Defines line1 and line 2
var line1 = d3.svg.line()
				.x(function (d) { return x(d.x); })
				.y(function (d) { return y1(d.y); });					
var line2 = d3.svg.line()
				.x(function (d) { return x(d.x); })
				.y(function (d) { return y2(d.y); });	
var line3 = d3.svg.line()
				.x(function (d) { return x(d.x); })
				.y(function (d) { return y3(d.y); });	

// Define the div tooltips
var div = d3.select("div#graph").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

	
//In case we want a legend
var lineLegend = "_____";

//Creates the canvas. 
var canvas = d3.select("div#graph").append("svg")
						//.attr("transform", "translate(400,0)")
						.style("background-color", "white")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		
//Defines circles1,2, and 3
var circles1, circles2, circles3;
	
canvas.append("text")
		.attr("class", "title")
		.attr("text-anchor", "middle")
		.attr("x", (width) / 2)
		.attr("y", -margin.top * 1/2)
		.text("Live LEWAS Data");	


		
// Queries the API header for line1
var header_request = new XMLHttpRequest();
header_request.onreadystatechange = function() {
    if (header_request.readyState == 4 && header_request.status == 200) {
        var response = JSON.parse(header_request.responseText);						
        // Parse the header
        for (var i in response) {
            // Push the metric header to the dropdown only if there is at least one metric
            if (response[i]._embedded.metrics.length > 0) {
                addDropdownHeader(response[i], function() {
                    var result = "";
                    for (var k in response[i]._embedded.metrics) {
                        var item = response[i]._embedded.metrics[k];
                        data_items.push(item);
						
                        // Add item to the first dropdown list
                        result += addDropdownItem(item, number1);
						number1++;
                    }
	                return result;
                });
            }
        }
        // Render the first data parameters
        renderData(data_items[currentIndex1]);
	}
}
header_request.open("GET", host + header, true);
header_request.send();
	
// Queries the API header for line2
var header_request2 = new XMLHttpRequest();
header_request2.onreadystatechange = function() {
	if (header_request2.readyState == 4 && header_request2.status == 200) {
		var response2 = JSON.parse(header_request2.responseText);						
		// Parse the header
		for (i in response2) {
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
		renderData2(data_items[currentIndex2]);
		//Access the DOM to make the initial dropdown value the second option. 
		document.getElementById("dropdown2").options[currentIndex2].selected = true;
	}
}
header_request2.open("GET", host + header, true);
header_request2.send();	
	
// Queries the API header for line3
var header_request3 = new XMLHttpRequest();
header_request3.onreadystatechange = function() {
    if (header_request3.readyState == 4 && header_request3.status == 200) {
        var response3 = JSON.parse(header_request3.responseText);						
        // Parse the header
        for (i in response3) {

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
        renderData3(data_items[currentIndex3]);
		//Access the DOM to make the initial dropdown value the third option. 
		document.getElementById("dropdown3").options[currentIndex3].selected = true;
	}
}
header_request3.open("GET", host + header, true);
header_request3.send();	

///////////////////////////////////////////Functions///////////////////////////////////////////

//addDropdownHeaders	
function addDropdownHeader(item, callback) {
    // Items must be a parameter and cannot be read from globally-scoped variable
    var element = document.getElementById('dropdown');
	// Construct the options inside the dropdown, set the value equal to the array index for loading
    // Call the callback, adding the elements
    // Add the last element	
    element.innerHTML += "<optgroup label=\"" + item.name.capitalize() + "\">" + callback() + "</optgroup>";
}

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

//loads
//renders data for the specified dropdown option
function load(selected) {
	currentIndex1 = selected.value;
    renderData(data_items[selected.value]);
}	

function load2(selected) {	
	currentIndex2 = selected.value;
	var chbx2 = document.getElementById("chbx2");
	if (chbx2.checked) {
		renderData2(data_items[selected.value]);
	}
}

function load3(selected) {
	currentIndex3 = selected.value;
	var chbx3 = document.getElementById("chbx3");
	if (chbx3.checked) {
		renderData3(data_items[selected.value]);
	}
}

//addDropDownItems
function addDropdownItem(item, number) {
    // Construct the options inside the dropdown, set the value equal to the array index for loading
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}	

function addDropdownItem2(item, number) {
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}	
	
function addDropdownItem3(item, number) {
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}		

//renderDatas	
function renderData(data_item) {
    // Creates a new XMLHttpRequest to get detailed from header object
    var data_request = new XMLHttpRequest();
    data_request.onreadystatechange = function() {
        if (data_request.readyState == 4 && data_request.status == 200) {
            var response = JSON.parse(data_request.responseText);
			
            // Handles response array versus response object
            if (response[0]) {
				if (ctr == 0) {
					drawChart(response[0]);
					ctr++;
				} else {
					updateChart(response[0]);
				}
            } else {
				if (ctr == 0) {
					drawChart(response);
					ctr++;
				} else {
					updateChart(response);
				}
            }
        }
    }
	
    data_request.open("GET", host + data_item._links.timeseries.href + '?since=' + getDateSince(query_time).toISOString(), true);
    data_request.send();
	
}

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

//drawCharts
function drawChart(raw_data) {
	//Chart Title
	console.log("drawChart1");

	//Sets the y1 axis title
	var y1Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	
	var formattedData = (formatData(raw_data.data));		
	
	//JSON data for line1 and corresponding circles
	var dataJSON = [];
	var circleData = [];
	//Stores the dates and data from the API in JSON at
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		//There shouldn't be too many circles on the graph
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y1 axis) min and max.
	y1.domain([bufferMin, bufferMax]);

	
	//Appends line1 with data from the array - dataJSON
	canvas.append("path")
			.attr("id", "line1")
			.attr("d", line1(dataJSON));
	console.log(dataJSON.length);
	
	//Adds the hover circles and the tooltips
	circles1 = canvas.selectAll("dot1")	
					.data(dataJSON);
		
	
		circles1.enter()
			.append("circle")
			.style("fill", "steelblue")
			//.style("stroke", "steelblue")
			//.style("stroke-width", 1)
			.attr("r", 2.5	)		
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
					.duration(0)
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
					.style("fill", "#42C0FB")
					.style("stroke", "black")
					.style("stroke-width", 2)
					.duration(0)
					.attr("r", 10);
				//showVid(d.x);
				})	
			.on("mouseout", function() {	
				d3.select(this)
					.transition()
					.delay(250)
					.duration(1000)
					.attr("r", .75)
					.style("fill", "steelblue")
					.style("stroke", "steelblue");
				div.transition()		
					.duration(3000)		
					.style("opacity", 0)
			});	
	
    //Appends the y1 axis
    canvas.append("g")
        .attr("class", "y1 axis")
        .call(y1Axis);	 
	
	//Appends the x axis
    canvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
		
	//Appends the x axis label
	canvas.append("text")
		.attr("class", "xLabel")
		.attr("transform", "translate(" + (width / 2) + "," + (height + (3 * margin.bottom / 4))  + ")")
		.text("Time (EDT)");	

	//Appends the y1 axis label
	canvas.append("text")
		.attr("class", "y1Label")
		.attr("transform", "translate(" + (margin.left / 8) + "," + (-margin.top / 8) + ")")
		.text(y1Label);
	/*	
	//Adds the line indicator for the y1 label in case we want this option
	canvas.append("text")
		.attr("class", "y1Label")
		.attr("transform", "translate(" + (width / 4) + "," + (height + margin.bottom * (3 / 4)) + ")")
		.text(y1Label);
	
	canvas.append("text")
		.attr("class", "y1Label")
		.attr("transform", "translate(" + ((width / 4) - 130) + "," + (height + margin.bottom * (3 / 4) - 10) + ")")
		.style("font-size", "200%")
		.text(lineLegend);
	*/
}	

function showVid(date) {
	console.log("showVid");
	var time = date.getTime();
	// Creates a new XMLHttpRequest to get detailed from header object
    var data_request = new XMLHttpRequest();
    data_request.onreadystatechange = function() {
        if (data_request.readyState == 4 && data_request.status == 200) {
			console.log(data_request.responseText);
            var response = JSON.parse(data_request.responseText);
			console.log(response);
			/*
            // Handles response array versus response object
            if (response[0]) {
				if (ctr == 0) {
					drawChart(response[0]);
					ctr++;
				} else {
					updateChart(response[0]);
				}
            } else {
				if (ctr == 0) {
					drawChart(response);
					ctr++;
				} else {
					updateChart(response);
				}
            } */
        }
    }
	//Why doesn't this work?
	//No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access.
    data_request.open("GET", "http://lewaspedia.enge.vt.edu:8080/videos/stroubles1" , true);
    data_request.send();
	
}
function drawChart2(raw_data) {
	console.log("drawChart2");
	
	//Sets the y2 axis title
	var y2Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = (formatData(raw_data.data));		
	
	
	var i = 0;	
	//JSON data for line2 and corresponding circles
	var dataJSON = [];
	var circleData = [];
	//Stores the dates and data from the API in JSON format
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		//There shouldn't be too many circles on the graph
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	console.log(dataJSON.length);
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y2.domain([bufferMin, bufferMax]);

	
	//Appends line1 with data from the array - dataJSON
	canvas.append("path")
			.attr("id", "line2")
			.attr("d", line2(dataJSON));
	
	//Adds the hover circles and the tooltips
	circles2 = canvas.selectAll("dot2")	
					.data(circleData);
					
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
	var formattedData = (formatData(raw_data.data));		
	
	
	var i = 0;
	//JSON data for line3 and corresponding circles
	var dataJSON = [];
	var circleData = [];	
	//Stores the dates and data from the API in JSON format
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		//There shouldn't be too many circles on the graph
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	console.log(dataJSON.length);
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y3.domain([bufferMin, bufferMax]);

	
	//Appends line3 with data from the array - dataJSON
	canvas.append("path")
			.attr("id", "line3")
			.attr("d", line3(dataJSON));
	
	//Adds the hover circles and the tooltips
	circles3 = canvas.selectAll("dot3")	
					.data(circleData);			
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

//updateCharts
//Updates based on an option picked in the dropdown option bar
function updateChart(raw_data) {
	console.log("updateChart1");
	
	circles1.transition().remove().duration(500);
	
	var y1Label = raw_data._embedded.units.type.capitalize() + " [" + raw_data._embedded.units.abbv + "]";
	var formattedData = (formatData(raw_data.data));		
	console.log(formattedData.length);
	var dataJSON = [];
	var circleData = [];
	//Stores the dates and data from the API in JSON format
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y1 axis) min and max.
	y1.domain([bufferMin, bufferMax]);
	
	circles1 = canvas.selectAll("dot1")	
					.data(circleData);
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
		pseudoCanvas.select("path#line1")
			.duration(750)
            .attr("d", line1(dataJSON));
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
	var formattedData = (formatData(raw_data.data));		

	var i = 0;
	var dataJSON = [];
	var circleData = [];
	//Stores the dates and data from the API in JSON format
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y2 axis) min and max.
	y2.domain([bufferMin, bufferMax]);
		
	circles2 = canvas.selectAll("dot2")	
					.data(circleData);
					
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
		pseudoCanvas.select("path#line2")
			.duration(750)
            .attr("d", line2(dataJSON));
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
	var formattedData = (formatData(raw_data.data));		

	
	var i = 0;
	var dataJSON = [];
	var circleData = [];
	//Stores the dates and data from the API in JSON format
	for (i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
		if (i % 30 == 0) {
			circleData[(i/30)] = { x: formattedData[i][0], y: formattedData[i][1] };
		}
	}
	var minDate = dataJSON[dataJSON.length - 1].x;
	var maxDate = dataJSON[0].x;	

	//Sets a buffer so that the line doesn't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);
	
	//Sets the domain (what's on the x axis) min and max. 
	x.domain([minDate, maxDate]);
	//Sets the domain (what's on the y3 axis) min and max.
	y3.domain([bufferMin, bufferMax]);
	
	circles3 = canvas.selectAll("dot3")	
					.data(circleData);			
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
		pseudoCanvas.select("path#line3")
			.duration(750)
            .attr("d", line3(dataJSON));
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

function refreshGraph() {
	//Figure this part out
	var val1 = document.getElementById("dropdown").value;
	var val2 = document.getElementById("dropdown2").value;
	var val3 = document.getElementById("dropdown3").value;

	renderData(data_items[val1]);
	renderData2(data_items[val2]);
	renderData3(data_items[val3]);
}	

function onCheck2(chbx) {
	if (chbx.checked) {
		ctr2 = 0;
		renderData2(data_items[currentIndex2]);
	}
	else {
		clearLine2();
	}
}

function onCheck3(chbx) {
	if (chbx.checked) {
		ctr3 = 0;
		renderData3(data_items[currentIndex3]);
	}
	else {
		clearLine3();
	}
}

function clearLine2() {
	if (ctr2) {
		//removes line2, y2axis, y2label
		var pseudoCanvas = d3.select("body").transition();
		pseudoCanvas.select("path#line2").duration(750).remove();
		pseudoCanvas.select(".y2.axis").duration(750).remove();
		pseudoCanvas.select(".y2Label").duration(750).remove();
		//removes the circles (dots)
		circles2.transition().remove().duration(500);
	}
}

function clearLine3() {
	if (ctr3) {
		//removes line3, y3axis, y3label
		var pseudoCanvas = d3.select("body").transition();
		pseudoCanvas.select("path#line3").duration(750).remove();
		pseudoCanvas.select(".y3.axis").duration(750).remove();
		pseudoCanvas.select(".y3Label").duration(750).remove();
		//removes the circles (dots)
		circles3.transition().remove().duration(500);
	}
}

// Does date calculation for the since parameter in the request
function getDateSince(days) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
}

// Switches the X and Y axis; converts the UTC data string to a Date object
function formatData(array) {
    var d = 0;
	for (d in array) {
        var a = array[d][0];
        array[d][0] = new Date(array[d][1]);
        array[d][1] = a;
    }
    return array;
}

//I am currently not using this function
function limitPoints(array) {
    var result = [];
	var i = 0;
    for (i in array) {
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
	


		