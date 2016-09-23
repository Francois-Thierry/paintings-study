////////////////////////////////////////////////////////////////////////////////
// D3 Heatmap
////////////////////////////////////////////////////////////////////////////////

function histogram2D() {

////////////////////////////////////////////////////////////////////////////////
// Prepare data

// Get the particles from the image's pixels.
// From: http://stackoverflow.com/questions/1041399/how-to-use-javascript-or-jquery-to-read-a-pixel-of-an-image
var canvas = document.createElement('canvas');
canvas.width = img.naturalWidth;
canvas.height = img.naturalHeight;
var ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

// getImageData returns an RGBA byte array.
var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

var bins = {
	h: d3.scaleQuantize().domain([0, 360]).range(d3.range(0, 32, 1/32)),
	s: d3.scaleQuantize().domain([0, 1]).range(d3.range(0, 32, 1/32)),
	l: d3.scaleQuantize().domain([0, 1]).range(d3.range(0, 32, 1/32)),
};

function toMatrix(data) {
	var matrix = new Array(data.length);
	for (var i = 0; i < data.length; i += 4) {
	    matrix[i/4] = data.subarray(i, i+4);
	}
	return matrix;
}
function binHSL(pixels, bins) {

	var color = toMatrix(pixels)
	.map(function(d) {
	    return d3.hsl("rgb(" + d[0] + "," + d[1] + "," + d[2] + ")");
	}).filter(function(d) { return d !== undefined; });

	var S_median = Math.round(d3.median(color, function(d) {return d.s})*100)/100;

	color = d3.nest()
    .key(function(d) {
		return "h" + bins.h(d.h) + "-l" + bins.l(d.l);
	})
    .key(function(d) {
        return "s" + bins.s(d.s);
    })
    .rollup(function(d) { return d.length; })
    .entries(color)
    .map(function(hl) {
        var h = +hl.key.split("-")[0].slice(1),
            l = +hl.key.split("-")[1].slice(1),
            count = hl.values.reduce(function(a, b) {
            	return { values: a.values + b.values };
        	}).values;
        return {
            // key: hl.key,
            hour: Math.floor(h),
            day: Math.floor(l),
            count: hl.values.length,
            color: d3.hsl(h, S_median, l)
            // values: hl.values.map(function(d) {
            //     var s = +d.key.slice(1),
            //         freq = d.values,
            //         color = d3.hsl(
            //             d3.mean(bins.h.invertExtent(h)),
            //             d3.mean(bins.s.invertExtent(s)),
            //             d3.mean(bins.l.invertExtent(l))
            //         ).toString();
            //     return { h:h, s:s, l:l, freq:freq, color:color };
            // })
        };
    });

    return color;
	
}





// var rgb = [];
// var hsl = [];

// var r, g, b, color_rgb, color_hsl;
// for (var i=0; i<pixels.length; i=i+4){
//     // 4 bytes blocks : RGBA
//     r = pixels[i];
//     g = pixels[i+1];
//     b = pixels[i+2];
//     color_rgb = d3.rgb(r, g, b);
//     rgb.push(color_rgb);
//     color_hsl = d3.hsl(color_rgb);
//     if (isNaN(color_hsl.s)) color_hsl.s = 0;
//     if (isNaN(color_hsl.h)) color_hsl.h = 0;
//     hsl.push(color_hsl);
// }

// //return an array of objects according to key, value, or key and value matching
// function getObjects(obj, key, val) {
//     var objects = [];
//     for (var i in obj) {
//         if (!obj.hasOwnProperty(i)) continue;
//         if (typeof obj[i] == 'object') {
//             objects = objects.concat(getObjects(obj[i], key, val));    
//         } else 
//         //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
//         if (i == key && obj[i] == val || i == key && val == '') { //
//             objects.push(obj);
//         } else if (obj[i] == val && key == ''){
//             //only add if the object is not already in the array
//             if (objects.lastIndexOf(obj) == -1){
//                 objects.push(obj);
//             }
//         }
//     }
//     return objects;
// }

// // Find the median of the Saturation values
// var S_median = Math.round(d3.median(hsl, function(d) {return d.s})*100)/100;

// // Compute HL histogram
// var accidents = [];

// var h_range = d3.range(0, 360, 1/180);
// var l_range = d3.range(0, 1, 1/100);

// h_range.forEach(function(dh, i) {
// 	l_range.forEach(function(dl, j) {
// 		accidents.push({day:dh, hour:dl, count:0});
// 	});
// });

// var h, l, h_objects, hl_objects;
// hsl.forEach(function(d) {
// 	h = d.h;
// 	l = Math.round(d.l*100)/100;
// 	h_objects = getObjects(accidents, "day", 300);
// 	hl_objects = getObjects(h_objects, "hour", l);
// })
// alert(accidents[15])


var accidents = [{day:2,hour:1,count:127},{day:4,hour:1,count:141},{day:1,hour:1,count:134},{day:5,hour:1,count:174},{day:3,hour:1,count:131},{day:6,hour:1,count:333},{day:7,hour:1,count:311},{day:2,hour:2,count:79},{day:4,hour:2,count:99},{day:1,hour:2,count:117},{day:5,hour:2,count:123},{day:3,hour:2,count:92},{day:6,hour:2,count:257},{day:7,hour:2,count:293},{day:2,hour:3,count:55},{day:4,hour:3,count:73},{day:1,hour:3,count:107},{day:5,hour:3,count:89},{day:3,hour:3,count:66},{day:6,hour:3,count:185},{day:7,hour:3,count:262},{day:2,hour:4,count:39},{day:4,hour:4,count:67},{day:1,hour:4,count:59},{day:5,hour:4,count:83},{day:3,hour:4,count:45},{day:6,hour:4,count:180},{day:7,hour:4,count:220},{day:2,hour:5,count:48},{day:4,hour:5,count:57},{day:1,hour:5,count:73},{day:5,hour:5,count:76},{day:3,hour:5,count:72},{day:6,hour:5,count:168},{day:7,hour:5,count:199},{day:2,hour:6,count:129},{day:4,hour:6,count:102},{day:1,hour:6,count:129},{day:5,hour:6,count:140},{day:3,hour:6,count:117},{day:6,hour:6,count:148},{day:7,hour:6,count:193},{day:2,hour:7,count:314},{day:4,hour:7,count:284},{day:1,hour:7,count:367},{day:5,hour:7,count:270},{day:3,hour:7,count:310},{day:6,hour:7,count:179},{day:7,hour:7,count:192},{day:2,hour:8,count:806},{day:4,hour:8,count:811},{day:1,hour:8,count:850},{day:5,hour:8,count:609},{day:3,hour:8,count:846},{day:6,hour:8,count:208},{day:7,hour:8,count:144},{day:2,hour:9,count:1209},{day:4,hour:9,count:1214},{day:1,hour:9,count:1205},{day:5,hour:9,count:960},{day:3,hour:9,count:1073},{day:6,hour:9,count:286},{day:7,hour:9,count:152},{day:2,hour:10,count:750},{day:4,hour:10,count:808},{day:1,hour:10,count:610},{day:5,hour:10,count:655},{day:3,hour:10,count:684},{day:6,hour:10,count:482},{day:7,hour:10,count:253},{day:2,hour:11,count:591},{day:4,hour:11,count:593},{day:1,hour:11,count:573},{day:5,hour:11,count:695},{day:3,hour:11,count:622},{day:6,hour:11,count:676},{day:7,hour:11,count:326},{day:2,hour:12,count:653},{day:4,hour:12,count:679},{day:1,hour:12,count:639},{day:5,hour:12,count:736},{day:3,hour:12,count:687},{day:6,hour:12,count:858},{day:7,hour:12,count:402},{day:2,hour:13,count:738},{day:4,hour:13,count:749},{day:1,hour:13,count:631},{day:5,hour:13,count:908},{day:3,hour:13,count:888},{day:6,hour:13,count:880},{day:7,hour:13,count:507},{day:2,hour:14,count:792},{day:4,hour:14,count:847},{day:1,hour:14,count:752},{day:5,hour:14,count:1033},{day:3,hour:14,count:942},{day:6,hour:14,count:983},{day:7,hour:14,count:636},{day:2,hour:15,count:906},{day:4,hour:15,count:1031},{day:1,hour:15,count:954},{day:5,hour:15,count:1199},{day:3,hour:15,count:1014},{day:6,hour:15,count:1125},{day:7,hour:15,count:712},{day:2,hour:16,count:1101},{day:4,hour:16,count:1158},{day:1,hour:16,count:1029},{day:5,hour:16,count:1364},{day:3,hour:16,count:1068},{day:6,hour:16,count:1062},{day:7,hour:16,count:736},{day:2,hour:17,count:1303},{day:4,hour:17,count:1426},{day:1,hour:17,count:1270},{day:5,hour:17,count:1455},{day:3,hour:17,count:1407},{day:6,hour:17,count:883},{day:7,hour:17,count:666},{day:2,hour:18,count:1549},{day:4,hour:18,count:1653},{day:1,hour:18,count:1350},{day:5,hour:18,count:1502},{day:3,hour:18,count:1507},{day:6,hour:18,count:830},{day:7,hour:18,count:652},{day:2,hour:19,count:998},{day:4,hour:19,count:1070},{day:1,hour:19,count:787},{day:5,hour:19,count:1027},{day:3,hour:19,count:1019},{day:6,hour:19,count:575},{day:7,hour:19,count:519},{day:2,hour:20,count:661},{day:4,hour:20,count:756},{day:1,hour:20,count:596},{day:5,hour:20,count:730},{day:3,hour:20,count:648},{day:6,hour:20,count:494},{day:7,hour:20,count:486},{day:2,hour:21,count:431},{day:4,hour:21,count:539},{day:1,hour:21,count:430},{day:5,hour:21,count:509},{day:3,hour:21,count:457},{day:6,hour:21,count:443},{day:7,hour:21,count:421},{day:2,hour:22,count:352},{day:4,hour:22,count:428},{day:1,hour:22,count:362},{day:5,hour:22,count:462},{day:3,hour:22,count:390},{day:6,hour:22,count:379},{day:7,hour:22,count:324},{day:2,hour:23,count:329},{day:4,hour:23,count:381},{day:1,hour:23,count:293},{day:5,hour:23,count:393},{day:3,hour:23,count:313},{day:6,hour:23,count:374},{day:7,hour:23,count:288},{day:2,hour:24,count:211},{day:4,hour:24,count:249},{day:1,hour:24,count:204},{day:5,hour:24,count:417},{day:3,hour:24,count:211},{day:6,hour:24,count:379},{day:7,hour:24,count:203}];
var accidents = binHSL(pixels, bins)
// console.log(JSON.stringify(accidents));

// alert(accidents.map(function(d) {return d.day}).length);
// alert(accidents.map(function(d) {return d.hour}).length);

	////////////////////////////////////////////////////////////////////////////////
	// Set up and initiate svg containers

	var xRange = d3.range(d3.max(accidents, function(d) {return d.hour}));
	var yRange = d3.range(d3.max(accidents, function(d) {return d.day}));

	var width = $("#histogram2D").width(),
		gridSize = Math.floor(width/xRange.length),
		height = gridSize * (yRange.length);

	//SVG container
	var svg = d3.select('#histogram2D')
		.append("svg")
		//responsive SVG needs these 2 attributes and no width and height attr
	    .attr("preserveAspectRatio", "xMinYMin meet")
	    .attr("viewBox", "0 0 "+width+" "+height)
	    //class to make it responsive
	    // .classed("svg-content-responsive", true)
		.append("g")
		.attr("width", width)
		.attr("height", height);
		// .attr("transform", "translate(1, 0.5)");

	////////////////////////////////////////////////////////////////////////////////
	// Draw Heatmap
		
	// Based on the heatmap example of 
	// http://bl.ocks.org/nbremer/62cf60e116ae821c06602793d265eaf6

	var colorScale = d3.scaleLinear()
		.domain([0, d3.max(accidents, function(d) {return d.count; })/2, d3.max(accidents, function(d) {return d.count; })])
		.range(["#FFFFDD", "#3E9583", "#1F2D86"])
		// .interpolate(d3.interpolateHcl);

	var heatMap = svg.selectAll(".hour")
	    .data(accidents)
	    .enter().append("rect")
	    .attr("x", function(d) { return (d.hour-1) * gridSize; })
	    .attr("y", function(d) { return (d.day-1) * gridSize; })
	    .attr("class", "hour bordered")
	    .attr("width", gridSize)
	    .attr("height", gridSize)
	    .style("stroke", "white")
	    .style("stroke-opacity", 0.6)
	    .style("fill", function(d) { return colorScale(d.count); });

}