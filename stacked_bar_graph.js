/* Stacked bar graph representing water quantity parameters. Outputs past seven days of data */
//Make it go to grouped
 
// Points to the API host and header
var host = "http://lewaspedia.enge.vt.edu:8080";
var header = "/sites/stroubles1/metricgroups";	

var dataItems = []; //Stores the water quantity parameters
var dayData = []; //Stores all the JSON data for each day
var dataItemsCtr = 0; 
var query_time = 7; //Default number of days to be querried
var endTime = new Date();
var dayDifference = 7;
var yStackMax = 100;
var rect, legend; //Initializes rect as a global because it will be used in both draw and update functions
/* margin, width, and height of graph */
var margin = {left: 60, right: 108, top: 70, bottom: 60};
var width = 720 - margin.left - margin.right;
var height = 460 - margin.top - margin.bottom;

/* Sets up x, y and color scales */
var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .05);
var y = d3.scale.linear()
				.domain([0, yStackMax])
				.range([height, 0]);

var colors = d3.scale.linear()
					.range(["orange", "purple"]);
var tooltipTime = d3.time.format("%x");

/* Defines Axes */
var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
	
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");
/* Defines canvas for graph and its title */
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
		.attr("y", -margin.top * 1/2)
		.text("Water Quantity Data for the Past Week");	

//Tooltip to display data when hovering
var tooltip = d3.select("#box").append("div")	
									.attr("class", "tooltip") 			
									.style("opacity", 0);
/* Initial API request to retrieve water quantity parameters */
d3.xhr((host + header), function(error, data) {
		if (error) throw error;
		var response = JSON.parse(data.response);
		for (var j in response) {
			// Push the metric header to the dropdown only if there is at least one metric
			if (response[j].name == "water quantity") {
				for (var k in response[j]._embedded.metrics) {
					//Intensity will not be included in dataItems
					if (response[j]._embedded.metrics[k].name != "intensity") {
						var item = response[j]._embedded.metrics[k];
						//Orders each item 
						if (item.name == "duration") {
							dataItems[0] = item;
						}
						else if (item.name == "accumulation") {
							dataItems[1] = item;
						}
						else {
							dataItems[2] = item;
						}	
					}
				}
			}
		}
		//I can't figure out how to use callbacks properly
		secondFunction(0, function () {
			console.log("first");
			secondFunction(1, function () {
				console.log("second");
				secondFunction(2, function () {
					console.log("third");
					secondFunction(function () {
						console.log("last");
						drawStacked()
					})
				})
			})
		});
		/*
		// Render the first data parameters
		for (var i in dataItems) {
			//renderData(Number(i));
			
		}
*/		
});
function secondFunction (index, callback) {
	renderData(index);
	callback();
}
/////////////////////////////////////////// Main Functions///////////////////////////////////////////
//Requests API based on dataItem [index]
function renderData(index) {
	var request = host + dataItems[index]._links.timeseries.href + '?since=' + getDateSince(query_time).toISOString();
    d3.xhr(request, function(error, data) {
		if (error) throw error;
		var response = JSON.parse(data.response);
		rawData = response;

		console.log(rawData);
		var formattedData = setTimeInt(formatData((rawData.data).reverse())); 	
		console.log("rawData",rawData);
		//Converts downstream velocity to volume in m^3
		if (rawData._embedded.metric.name == "duration") {
			formattedData = addRain(formattedData);
		}
		else if (rawData._embedded.metric.name == "accumulation") {
			formattedData = addRain(formattedData);
		}
		else {
			formattedData = convertVelToVol(formattedData);
		}
	
		//Calculates the average for each day (works a week of data) 
		var dayParamValTotal = 0; //parameter value total 
		var weekTotal = 0; //Aggregates the parameter value for the week
		var currDay = formattedData[0][0].getDay();
		var tempDay = formattedData[0][0].getDay();
		var dayParamValTotalArray = []; 
		for (var i = 0; i < formattedData.length; i++) {
			if (currDay == tempDay) {
				if (!isNaN(formattedData[i][1])) {
					dayParamValTotal += formattedData[i][1];
				}
			}
			else {
				currDay = tempDay; 
				dayParamValTotalArray.push({total: dayParamValTotal, date: formattedData[i - 1][0]}); //Total for each day
				weekTotal += dayParamValTotal;
				dayParamValTotal = 0; //Set to zero as next day is calculated
			}
			tempDay = formattedData[i][0].getDay();
		}
		currDay = tempDay; 
		dayParamValTotalArray.push({total: dayParamValTotal, date:  formattedData[i - 1][0]}); //Total for each day
		weekTotal += dayParamValTotal;

		//Initializes dayData with JSON
		dayData[index] = {param: rawData._embedded};
		for (var i in dayParamValTotalArray) {
			//Stores the total and percentange of each day respective to the past week
			(dayData[index])["Day " + (Number(i) + 1) + " total"] = dayParamValTotalArray[i].total; 
			(dayData[index])["Day " + (Number(i) + 1) + " perc"] = (dayParamValTotalArray[i].total / weekTotal * 100); 
			(dayData[index])["Day " + (Number(i) + 1) + " date"] = dayParamValTotalArray[i].date; 
		}
		/*
		//Only drawStacked() when all dataItems have been through processData()
		if (dataItemsCtr == (dataItems.length - 1)) {
			dataItemsCtr = 0;
			drawStacked();
		}
		dataItemsCtr++;
		*/
		
	});
}

//Creates the stacked bar graph
function drawStacked() {
	console.log("drawStacked"); 
	var days = [];
	for (var i = 0; i < dayDifference; i++) {
		days[i] = "Day " + (i + 1);
	}
	//Defines the data for each layer of stacked bar graph
	var layers = d3.layout.stack()(days.map(function(c) {
		return dayData.map(function(d) {
			if (d.param.metric.name == "downstream velocity") {
				return {date: c + ": " + tooltipTime(d[c + " date"]), total: d[c + " total"], abbv: "m^3", x: "Volumetric Flow of Water", y: d[c + " perc"]};
			}
			else {
				var name = (d.param).metric.medium.capitalize() + " " + (d.param).metric.name.capitalize();
				return {date: c + ": " + tooltipTime(d[c + " date"]), total: d[c + " total"], abbv: (d.param).units.abbv, x: name, y: d[c + " perc"]};
			}
		});
	}));
	dayData.length = 0;
	x.domain(layers[0].map(function(d) { return d.x; })); //Domain consists of the parameter names
	colors.domain([0, query_time - 1]);
	
	//Defines each layer of the stacked bar graph based on data from layers
	var layer = canvas.selectAll(".layer")
						.data(layers)
							.enter()
								.append("g")
								.attr("class", "layer")
								.style("fill", function(d, i) { console.log(i);return colors(i); });
	rect = layer.selectAll("rect")
				.data(function(d) { return d; })
					.enter()
						.append("rect")
						.attr("x", function(d) { return x(d.x); })
						.attr("y", function(d) { 
							if (isNaN(d.y)) {
								console.log("Error with y data values");
								return y(d.y0);
							}
							else {
								return y(d.y + d.y0); 
							} 
						})
						.attr("height", function(d) { 
							if (isNaN(d.y)) {
								console.log("Error with y data values");
								return 0;
							} else {
								return y(d.y0) - y(d.y + d.y0);
							}
						})
						.attr("width", x.rangeBand() - 1)
						.on("mouseover", function() { 
							tooltip.transition()		
								.duration(200)		
								.style("opacity", .4); 
							d3.select(this)
								.style("stroke", "black")
								.style("stroke-width", 2);
						}) 
						.on("mousemove", function(d, i) {
							//Sets the tooltip location right by mouse
							var xPosition = d3.mouse(this)[0] - 70;
							var yPosition = d3.mouse(this)[1] + 25;
							d3.select(".tooltip")
								.style("top", yPosition + "px")
								.style("left", xPosition + "px");	
							tooltip.html("<b>" + d.date + "<br/>" + "Parameter Value: "
								+ (d.total).toFixed(1) +  " " + d.abbv 
								+ "<br/>" + "% of Weekly Total: " + (d.y).toFixed(1) + "%" + "</b>");
						})
						.on("click", function(d, i) {
							tooltip.transition()		
								.duration(200)		
								.style("opacity", .8);
							d3.select(this).transition()
								.style("stroke", "black")
								.style("stroke-width", 5); //Acts as a highlighter on click
						})
						.on("mouseout", function() { 
							tooltip.transition()		
								.duration(3000)		
								.style("opacity", 0);
							d3.select(this).transition()
									.delay(200)
									.style("stroke", "none");
						});
	//Appends axes and axes labels 
	canvas.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
	canvas.append("text")
			.attr("class", "axisLabel")
			.attr("transform", "translate(" + (width / 2) + "," + (height + (3 * margin.bottom / 4))  + ")")
			.text("Water Quantity Parameters");	
	canvas.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + width + ",0)")
			.call(yAxis); 
	canvas.append("text")
			.attr("class", "axisLabel")
			.attr("transform", "translate(" + (width + margin.right / 2) + "," + (height / 2) + ")rotate(90)")
			.text("% of Data for the Week");
	//Legend 
	var barProp = document.getElementById("sidebar");
	var sidebar = d3.select("div#sidebar").append("svg")
					.attr("width", barProp.offsetWidth)
					.attr("height", barProp.offsetHeight);
	//Legend Title
	sidebar.append("text")
		.attr("class", "title")
		.attr("text-anchor", "middle")
		.attr("x", barProp.offsetWidth / 2)
		.attr("y", margin.top)
		.text("Days");
	console.log("made it here");
	//Defines legend	
	legend = sidebar.selectAll(".legend")
					.data(layers)
					.enter()
						.append("g")
						.attr("class", "legend")
						.attr("transform", function(d, i) { 
							return "translate(0," + (i * 20 + margin.top + 25) + ")"; 
						});
	legend.append("rect")
			.attr("x", barProp.offsetWidth / 2)
			.attr("width", 70)
			.attr("height", 18)
			.style("fill", function (d, i) { return colors(i); });
	legend.append("text")
			.attr("x", barProp.offsetWidth / 2 - 10)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("fill", function (d, i) { return colors(i); })
			.text(function(d, i) { return "Day " + (Number(i) + 1); });
}
//Transitions graph on a change in the stacked and grouped input
function change(selected) {
	if (selected.value === "grouped") {
		transitionGrouped();
	} else {
		transitionStacked();
	}
}
//Transitions to a grouped bar graph
function transitionGrouped() {
	rect.transition() //transitions between the x location change. Increases space for each bar to the queryTime
			.duration(500)
			.delay(function(d, i) { return i * 10; })
			.attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / query_time * j; })
			.attr("width", x.rangeBand() / query_time)
		.transition() //transitions between the y location change. Height is now based only on d.y
			.attr("y", function(d) { 
				if (isNaN(d.y)) {
					return y(0);
				} else {
					return y(d.y); 
				}
			})
			.attr("height", function(d) {
				if (isNaN(d.y)) {
					return height - y(0);
				} else {
					return height - y(d.y); 
				}
			});
}
//Transitions to a stacked bar graph
function transitionStacked() {
	//Updates to the stacked bar graph
	rect.transition()
			.duration(500)
			.delay(function(d, i) { return i * 10; })
			.attr("y", function(d) { 
				if (isNaN(d.y)) {
					console.log("Error with y data values");
					return y(d.y0);
				}
				else {
					return y(d.y + d.y0); 
				} 
			})
			.attr("height", function(d) { 
				if (isNaN(d.y)) {
					console.log("Error with y data values");
					return 0;
				} else {
					return y(d.y0) - y(d.y + d.y0);
				}
			})
		.transition()
			.attr("x", function(d) { return x(d.x); })
			.attr("width", x.rangeBand());
}
/////////////////////////////////////////// Helper Functions///////////////////////////////////////////
// Switches the X and Y axis; converts the UTC data string to a Date object
function formatData(array) {
	for (var i in array) {
        var a = array[i][0];
        array[i][0] = new Date(array[i][1]);
        array[i][1] = a;
    }
    return array;
}
//Parses date to get full days between current hour
function parseDate(str) {
    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0]-1, mdy[1], (new Date()).getHours());
}
//Calculates number of days between two dates
function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}
function setTimeInt(data) {
	for (var i = 0; i < data.length; i++) {
		if (data[i][0] > endTime) {
			data.length = i; 
			break;
		}
	}
	return data;
}
//Sets the queryTime and the endTime based on datepickers
function removeGraph() {
	var pseudoCanvas = d3.select("div#graph").transition();
	pseudoCanvas.select(".axis").duration(750).remove();
	pseudoCanvas.select(".axisLabel").duration(750).remove();
	rect.transition().remove().duration(500);
	legend.transition().remove().duration(500);
	
	query_time = daydiff(parseDate($('#datepicker1').val()), new Date());	
	endTime = parseDate($('#datepicker2').val());
	dayDifference = daydiff(parseDate($('#datepicker1').val()), endTime);
	for (var i in dataItems) {
		renderData(Number(i));
	}
}

function addRain(formattedData) {
	var temp = [];
	for (var i = 0; i < formattedData.length - 1; i++) {
		var difference = formattedData[i + 1][1] - formattedData[i][1];
		if (difference >= 0) {
			temp[i] = difference;
		} else {
			temp[i] = 0;
		}
	}
	temp[0] = 0;
	
	for (var i in formattedData) {
		formattedData[i][1] = temp[i];
	}
	return formattedData;
}
//Converts velocity data to volume data based on OWLS equation
function convertVelToVol(formattedData) {
	for (var i in formattedData) {
		var velMean =  (0.7896014 * formattedData[i][1] - 0.016046) / 100;
		var flowRate = 2.5715 * Math.pow(velMean, 3) - 1.7058 * Math.pow(velMean, 2) + 1.4465 * velMean - 0.0324;
		formattedData[i][1] = flowRate * 60;		
	}
	return formattedData;
}
//Does date calculation for the since parameter in the request
function getDateSince(days) {
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate;
}
// Capitalizes all the words in a string
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
    });
};	

//Returns yesterdays date as Month/Day/Year
function getLastWeekDate() {
    var date = new Date();
    date.setDate(date.getDate()-7);
	console.log(date);
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}
//Jquery for datepicker
$( function() {
	$( "#datepicker1" ).datepicker();
	$( "#datepicker1" ).datepicker("setDate", getLastWeekDate()); //Sets initial val to yesterday's date
	$( "#datepicker2" ).datepicker();
	$( "#datepicker2" ).datepicker("setDate", new Date()); //Sets initial val to today's date
});