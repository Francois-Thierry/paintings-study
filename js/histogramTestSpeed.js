// prepare arrays to hold images and images data from canvas-context

var images = [];
var contexts = [];

// helper to allow computing a function only when images have finished loading
// from an array of urls

function preloadImages(urls, allImagesLoadedCallback){
	// init number of loaded images
	var loadedCounter = 0;
	// number of images to load
  	var toBeLoadedNumber = urls.length;
  	// for each image url
  	urls.forEach(function(url){
  		preloadImage(url, function(img){
  			// load is complete, add the image to the images array
      		images.push(img);
      		// increment loaded images number
    		loadedCounter++;
    		// create a new canvas element
			var canvas = document.createElement('canvas');
			// reshape the canvas to image size
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			// get the context from canvas
			var ctx = canvas.getContext("2d");
			// paint the image on the canvas
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
			// add the image data to the contexts array
			contexts.push(ctx)
			// if all the images are loaded, execute the callback function
      		if(loadedCounter == toBeLoadedNumber){
      			allImagesLoadedCallback(contexts);
      		}
    	});
  	});

	// load the image from url and paint it on a new canvas when it
	// finished loading

  	function preloadImage(url, anImageLoadedCallback){
  		// create a new image element
      	var img = new Image();
      	// set the crossOrigin property.
		img.crossOrigin = 'Anonymous';
		// load from url
      	img.src = url;
      	// after load complete get image data from canvas-context
      	img.onload = anImageLoadedCallback(img);
      	// log a message if an error occurred with this image
  		img.onerror = function() { 
		    console.error('Error with image: ', img.src); 
		};
  	}
}

// alert the time spent computing the histograms of 1% of the dataset (35
// paintings)

function testSpeed() {
	// initiate timer
    var start = new Date().getTime();
	// load the dataset
	d3.json("data/paintings.json",function (json) {
		// get the 35 first paintings of the dataset
		var paintings = json.slice(0, 35);
		// init array of paintings urls
		var urls = [];
		// for every painting extract the url
		for (var i in paintings) {
			// go through another proxy to circumvent the CORS limitation
			// var url = "https://crossorigin.me/"+ painting["url"];
		    urls.push("https://cors-anywhere.herokuapp.com/"+ paintings[i]["url"]);
		}
		// load paintings images from urls and compute their histograms once
		// they are loaded
		preloadImages(urls, function(contexts){
			// for every image and image data
			for (var i=0; i<contexts.length; i++) {
				var img = images[i];
				var ctx = contexts[i];
				// escape eventual badly loaded painting
				if (img.naturalWidth!=0) {
					// get the color of each pixels (flat RGBA Uint8 array)
					var pixels = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
					//compute the histogram
					var histogram = computeHistogram(pixels);
				}
			}
			// clock the time spent
		    var end = new Date().getTime();
		    // ellapsed time
		    var time = end-start;
		    // alert the result of the speed test
		    alert('Histogram Speed Test - Execution time: '+time/1000+" sec")
		});
	});
};