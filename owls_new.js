/* Updated version of OWLS Live Data Graph */
/*
Latest Update: 11/8/16
Overview:
	The 10 different parameters are stored in data_items
	and whenever the user wants to output that data, 
	renderData will be called to query data from the server. 
	
	There are three possible graphs, so an array, currentItem, is 
	used to keep track of which data set is currently being outputted.
*/

// Points to the API host and header
var host = "http://lewaspedia.enge.vt.edu:8080";
var header = "/sites/stroubles1/metricgroups";	

var data_items = []; //stores data parameters
var y = []; //stores three y scales for the data
var yAxis = []; //stores definitions of the three y axes
var yLabel = []; //stores three y labels
var circles = []; //stores three circle types
var encodedURI = []; //stores three encodedURIs for .csv data download

var commonUS = 0; //0 when units are SI, 1 when units are commonUS
//var queryTime = 1; //Default number of days to be querried
var startTime = parseStartDate(getYesterdaysDate());
var endTime = new Date();
//current index of data_items for each set of data points (changes when dropdown item is chosen)
var currentItem = [0, 1, 2]; 
var margin = {left: 60, right: 125, top: 70, bottom: 60}; 
var width = 720 - margin.left - margin.right; 
var height = 460 - margin.top - margin.bottom;	

//Provides the scales for the axes and the actual data	   
var x = d3.time.scale().range([0, width]);
y[0] = d3.scale.linear().range([height, 0]);
y[1] = d3.scale.linear().range([height, 0]);
y[2] = d3.scale.linear().range([height, 0]);

//Sets format for date output for x axis
var xAxisTime = d3.time.format("%I:%M %p");
var xAxisTicks = 4;
var tooltipTime = d3.time.format("%a %I:%M %p");

//sets the x and y axes structures and scales them  		
var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.innerTickSize(-height) //Adds grid lines
					.outerTickSize(0)
					.tickPadding(10);
yAxis[0] = d3.svg.axis()
					.scale(y[0])
					.orient("left")
					.ticks(10)
					.innerTickSize(-width) //Adds grid lines
					.outerTickSize(0)
					.tickPadding(10);
yAxis[1] = d3.svg.axis()
					.scale(y[1])
					.orient("right")
					.ticks(10);
yAxis[2] = d3.svg.axis()
					.scale(y[2])
					.orient("right")
					.ticks(10);		
//Provides the positions of the three y axes and respective labels				
var yAxisPos = [0, width, width + margin.right / 2];
var yLabelPos = [-3 * margin.left / 4, width / 2, width + margin.right - 10];
//Creates the tooltips used for hovering
var div = d3.select("div#graph").append("div")	
    .attr("class", "tooltip") 			
    .style("opacity", 0);
//Defines the colors used for the data points and tooltips
var colors = ["steelblue", "red", "green"];
var altColors = ["#42C0FB", "#FF8300", "#66FF66"];

//Creates the abbreviated units arrays
var unitsArray = [];
var USUnits = [ {abbv: "F", conv: 9/5}, 
				{abbv: "mg/l", conv: null}, //left null because OWLS doesn't change it
				{abbv: "NTU", conv: null}, 
				{abbv: "%", conv: null}, 
				{abbv:"mS/in", conv: 2.54},
				{abbv: "pH", conv: null},
				{abbv: "in", conv: .3937},
				{abbv: "in/hr", conv: .03937},
				{abbv: "s", conv: null},
				{abbv: "in/s", conv: .3937} ];
var SIUnits = [ {abbv: "C", conv: 5/9}, 
				{abbv: "mg/l", conv: null}, 
				{abbv: "NTU", conv: null}, 
				{abbv: "%", conv: null}, 
				{abbv:"mS/cm", conv: .3937},
				{abbv: "pH", conv: null},
				{abbv: "cm", conv: 2.54},
				{abbv: "mm/hr", conv: 25.4},
				{abbv: "s", conv: null},
				{abbv: "cm/s", conv: 2.54} ];

//Defines the canvas. 
var canvas = d3.select("div#graph").append("svg")
						.style("background-color", "white")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");				
canvas.append("text")
		.attr("class", "title")
		.attr("text-anchor", "middle")
		.attr("x", (width) / 2)
		.attr("y", -margin.top * 3 / 5)
		.text("Interactive Live LEWAS Data");	
/////////////////////////////////////////// Main Functions///////////////////////////////////////////
//Initialize the dropdown headers
function initDropdownHeader(index) {
	d3.xhr((host + header), function(error, data) {
		if (error) throw error;
		var response = JSON.parse(data.response);
		var value = 0;
		for (var j in response) {
			// Push the metric header to the dropdown only if there is at least one metric
			if (response[j]._embedded.metrics.length > 0) {
				addDropdownHeader(response[j], index, function() {
					var result = "";
					
					for (var k in response[j]._embedded.metrics) {
						var item = response[j]._embedded.metrics[k];
						data_items.push(item);
						
						// Add item to the first dropdown list
						result += addDropdownItem(item, value);
						value++;
					}
					return result;
				});
			}
		}
		// Render the first data parameters
		document.getElementById("dropdown" + (index + 1)).options[currentItem[index]].selected = true;
		renderData(data_items[currentItem[index]], index);
	});
}
//Creates three dropdown headers
for (var i in currentItem) {
	initDropdownHeader(currentItem[i]); 
}
//Requests API based on data_item and specific index value input
function renderData(data_item, index) {
	var request = host + data_item._links.timeseries.href + '?since=' + startTime.toISOString();
    d3.xhr(request, function(error, data) {
		if (error) throw error;
		var response = JSON.parse(data.response);
            // Handles response array versus response object
            if (response[0]) {
					drawChart(response[0], index);
			} else {
					drawChart(response, index);
			}
        });
}
//renders data for the specified dropdown option 
function load(selected, index) {
	currentItem[index] = selected.value;
	if (index == 0) {
		renderData(data_items[selected.value], index);
	} else {
		var chbx = document.getElementById("chbx" + (index + 1));
		if (chbx.checked) {
			renderData(data_items[selected.value], index);
		}
	}	
}	

//Handles drawing and updating the three data plots
function drawChart(raw_data, index) {
	console.log(data_items[0]);
	var formattedData = setTimeInt(formatData((raw_data.data).reverse()));	
	var unitLabel, unitAbbr;
	[formattedData, unitLabel, unitAbbr] = unitConversion(formattedData, raw_data._embedded.units, index);
	//Make a button.
	yLabel[index] = unitLabel + "[" + unitAbbr + "]";
	//JSON data (x: date, y: value) 
	var dataJSON = [];
	for (var i in formattedData) {
		dataJSON[i] = { x: formattedData[i][0], y: formattedData[i][1] };
	}
	loadCSV(dataJSON, unitLabel, unitAbbr, index); // converts dataJSON to .csv format
	var minDate = dataJSON[0].x; 
	var maxDate = dataJSON[dataJSON.length - 1].x; 
	

	//Sets a buffer so that the points don't touch the x axis
	var bufferMin = d3.min(dataJSON, function (d) { return d.y }) - (d3.min(dataJSON, function (d) { return d.y }) / 50); 
	var bufferMax = d3.max(dataJSON, function (d) { return d.y }) + (d3.max(dataJSON, function (d) { return d.y }) / 50);

	x.domain([minDate, maxDate]); //Sets the domain (output) for the x values
	y[index].domain([bufferMin, bufferMax]); //Sets the domain (output) for the y values
	//Checks if specified y axis is there to determine whether to draw or update. 
	if (d3.select(".y" + (index + 1) + "Axis").size()) {
		circles[index].transition().remove().duration(500);
	}
	//Adds the data points and the tooltips
	circles[index] = canvas.selectAll("dot1")	
						.data(dataJSON);
	circles[index].enter()
				.append("circle")
				.style("fill", colors[index]) //Color based on index
				.attr("r", 2)		
				.attr("cx", function(d) { return x(d.x); })		 
				.attr("cy", function(d) { return y[index](d.y); })		
				.on("mouseover", function(d) {		
					div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					div.html(tooltipTime(d.x) + "<br/>"  + d.y + " " + unitAbbr)	
						.style("background", altColors[index])
						.style("left", (d3.event.pageX + 10) + "px")		
						.style("top", (d3.event.pageY - 60) + "px");
					d3.select(this)
						.transition()
						.duration(250)
						.attr("r", 8);
					})	
				.on("click", function (d) {	
					div.html("<b>" + tooltipTime(d.x) + "<br/>"  + d.y + " " + unitAbbr + "</b>")	
					d3.select(this).moveToFront()
						.transition()
						.duration(100)
						//Data point color is emphasized on click
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
		if (d3.select(".y" + (index + 1) + "Axis").empty()) {
			//Checks if x axis has been called
			if (d3.select(".xAxis").empty()) {
				//Appends x axis
				canvas.append("g")
					.attr("class", "xAxis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis.ticks(xAxisTicks).tickFormat(xAxisTime));
				//Appends x axis label
				canvas.append("text")
					.attr("class", "xLabel")
					.attr("transform", "translate(" + (width / 2) + "," + (height + (3 * margin.bottom / 4))  + ")")
					.text("Time (EDT)");	
			}
			//Appends y axis
			canvas.append("g")
				.attr("class", "y" + (index + 1) + "Axis")
				.attr("transform", "translate(" + yAxisPos[index] + ",0)")
				.call(yAxis[index]);	
			//Appends y axis label
			canvas.append("text")
				.attr("class", "y" + (index + 1) + "Label")
				.attr("transform", "translate(" + yLabelPos[index] + "," + (-margin.top / 4) + ")")
				.text(yLabel[index]);
		} else {
			//Updates chart
			xAxis.ticks(xAxisTicks).tickFormat(xAxisTime);
			var pseudoCanvas = d3.select("body").transition();
			pseudoCanvas.select(".xAxis")
				.duration(1500)
				.call(xAxis);
			pseudoCanvas.select(".y" + (index + 1) + "Axis")
				.duration(1500)
				.call(yAxis[index]);
			pseudoCanvas.select(".y" + (index + 1) + "Label")
				.duration(1500)
				.text(yLabel[index]);
		}
		//Adds the live camera picture
		document.getElementById("camera").src = "http://128.173.156.152:3580/nph-jpeg.cgi?0?" + (new Date()).getTime();
}	



//Refreshes all plots 
function refreshGraph() {
	for (var i in currentItem) {
		if (d3.select(".y" + (Number(i) + 1) + "Axis").size()) {
			renderData(data_items[currentItem[i]], Number(i));
		}
	}
}	
//Flashes datepicker2 on change in datepicker1
function flashEndDate() {
	d3.select("#datepickerLabel2").transition().delay(500).style("background", "red").style("color", "black")
		.transition().delay(4000).duration(2000).style("background", "white").style("color", "#ff0000");
	d3.select("#datepicker2").transition().style("background", "red")
		.transition().delay(4000).duration(2000).style("background", "white");
}
//Sets the queryTime and the endTime based on datepickers
function setQuery() {
	startTime = parseStartDate($('#datepicker1').val());
	if ( (new Date()).getDate() == (parseStartDate($('#datepicker2').val())).getDate() ) {
		endTime = new Date();
	}
	else {
		endTime = parseEndDate($('#datepicker2').val());
	}
	var daysOutputted = daysDisplayed(startTime, endTime);
	setTimeTicks(daysOutputted);
	for (var i in currentItem) {
		if (d3.select(".y" + (Number(i) + 1) + "Axis").size()) {
			renderData(data_items[currentItem[i]], Number(i));
		}
	}
}
//Sets the xAxis time format and tick number. Also sets tooltip time format.
function setTimeTicks(daysOutputted) {
	if (daysDisplayed(startTime, new Date()) <= 1) {
		xAxisTime = d3.time.format("%I:%M %p");
		xAxisTicks = 4;
		tooltipTime = d3.time.format("%a %I:%M %p");
	}
	else if (daysDisplayed(startTime, new Date()) <= 7) {
		xAxisTime = d3.time.format("%A");
		xAxisTicks = daysOutputted;
		tooltipTime = d3.time.format("%a %I:%M %p");
	}
	else {
		xAxisTime = d3.time.format("%b %d");
		if (daysOutputted <= 7) {
			xAxisTicks = daysOutputted;
		}
		else {
			xAxisTicks = 4;
		}
		tooltipTime = d3.time.format("%b %d, %I:%M %p");
	}
}
//Changes to commonUS or SI based on dropdown
function onUnitChange(selected) {
	commonUS = Number(selected.value);
	refreshGraph();
}
//Renders data when checked and clears plot when unchecked
function onCheck(chbx, index) {
	if (chbx.checked) {
		renderData(data_items[currentItem[index]], index);
	}
	else {
		clearLine(index);
	}
}
//removes all specified data points if the specified axis is there
function clearLine(index) {
	if (d3.select(".y" + (index + 1) + "Axis").size()) {
		var pseudoCanvas = d3.select("body").transition();
		pseudoCanvas.select(".y" + (index + 1) + "Axis").duration(750).remove();
		pseudoCanvas.select(".y" + (index + 1) + "Label").duration(750).remove();
		circles[index].transition().remove().duration(500);
	}
}
// Loads csv data baesd on JSON data for graphs
function loadCSV(data, unitLabel, unitAbbr, index) {
	var csvContent = "data:text/csv;charset=utf-8,";
	csvContent += "Date and Time, " + unitLabel + "[" + unitAbbr + "]\n";
	// Adds a new line for each time value pair in the data
	data.forEach(function(timeValueObj, i){
		dataString = timeValueObj.x + ", " + timeValueObj.y;
		// checks when the end of the data is reached
		csvContent += i < data.length ? dataString + "\n" : dataString;
	}); 
	encodedURI[index] = encodeURI(csvContent); //sets the encodedURI based on its index (0-2)
}
// Download the csv data when user clicks "Data Download" button
function outputCSV()
{
	for (var i in encodedURI) {
		var link = document.createElement("a");
		link.setAttribute("href", encodedURI[i]);
		link.setAttribute("download", data_items[currentItem[i]].medium + data_items[currentItem[i]].name + ".csv");
		document.body.appendChild(link); 
		link.click(); // download the data file
	}
}
/////////////////////////////////////////// Helper Functions///////////////////////////////////////////
//addDropdownHeaders	
function addDropdownHeader(item, index, callback) {
    var element = document.getElementById("dropdown" + (index + 1));
	// Construct the options inside the dropdown
    element.innerHTML += "<optgroup label=\"" + item.name.capitalize() + "\">" + callback() + "</optgroup>";
}
//addDropDownItems
function addDropdownItem(item, number) {
    // Construct the options inside the dropdown, set the value equal to the array index for loading
    return "<option value=\"" + number + "\">" + item.medium.capitalize() + " " + item.name.capitalize() + "</option>";
}	
//Does date calculation for the since parameter in the request
function getDateSince(days) {
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
}
//Parses to the beginning of given day
function parseStartDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1], 0, 0);
}
//Parses to the end of given day
function parseEndDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1], 23, 59);
}
//Calculates number of days to be outputted
function daysDisplayed(first, second) {
    return Math.ceil((second-first)/(1000*60*60*24));
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
function setTimeInt(data) {
	for (var i = 0; i < data.length; i++) {
		if (data[i][0] > endTime) {
			data.splice(i);
			break;
		}
	}
	return data;
}
//Converts to specified units each time drawChart is called
function unitConversion(data, units, index) {
		var unitAbbr, unitLabel;
		if (commonUS) {
			unitAbbr = USUnits[currentItem[index]].abbv;
			unitLabel = units.type.capitalize();
		} else {
			unitAbbr = SIUnits[currentItem[index]].abbv;
			unitLabel = units.type.capitalize();
		}
		for (var i in data) {
			if (commonUS) {
				if (units.abbv != unitAbbr)  {
					if (unitAbbr != "F") {
						data[i][1] *= USUnits[currentItem[index]].conv;
					} else {
						data[i][1] = data[i][1] * USUnits[currentItem[index]].conv + 32;
					}
				}	
			} else {
				if (units.abbv != unitAbbr)  {
					if (unitAbbr != "C") {
						data[i][1] *= SIUnits[currentItem[index]].conv;
					}
					else {
						data[i][1] = SIUnits[currentItem[index]].conv * (data[i][1] - 32);
					}
				}	
			}
			data[i][1] = Number((data[i][1]).toFixed(2));
			
		}
		return [data, unitLabel, unitAbbr];
}
// Capitalizes all the words in a string
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};	
//Moves the clicked point to the front
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


//Returns yesterdays date as Month/Day/Year
function getYesterdaysDate() {
    var date = new Date();
    date.setDate(date.getDate()-1);
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}
//Jquery for datepicker
$( function() {
	$( "#datepicker1" ).datepicker();
	$( "#datepicker1" ).datepicker("setDate", getYesterdaysDate()); //Sets initial val to yesterday's date
	$( "#datepicker2" ).datepicker();
	$( "#datepicker2" ).datepicker("setDate", new Date()); //Sets initial val to today's date
});