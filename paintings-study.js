// update header github link
$(".header-button.github").attr("href", "https://github.com/Francois-Thierry/paintings-study/tree/gh-pages")

////////////////////////////////////////////////////////////////////////////////
//                                                          Row-Plot actions  //
////////////////////////////////////////////////////////////////////////////////

$(".fullscreen-action").on("click", function(){
    plot = $(this).parent().parent();
    image = plot.find("#image");
    histogram = plot.find("#container canvas");

    // console.log(histogram)

    if (plot.hasClass("fullscreen")) {
        plot.removeClass("fullscreen");
        $("body").css("overflow", "auto");

        plot.css("position", "relative");
        plot.css("max-width", "961px");
        plot.css("width", "auto");
        plot.css("height", "auto");
        plot.css("z-index", 1);
        plot.css("margin", "1em 0");

        // histogram.css("width", "100%");
        // histogram.css("height", "auto");

      } else {
        plot.addClass("fullscreen");
        $("body").css("overflow", "hidden");

        // var oldWidth = plot.width();
        // var oldHeight = plot.height();

        // var oldContainerWidth = histogram.width();
        // var oldContainerHeight = histogram.height();

        plot.css("max-width", $(document).width()-30);
        plot.css("margin", "1em");
        plot.css("position", "fixed");
        plot.css("top", 0);
        plot.css("left", 0);
        plot.css("bottom", 0);
        plot.css("right", 0);
        plot.css("z-index", 2000);

        // animate();

        histogram.css("width", "100%")

        // var newWidth = plot.width();
        // var newHeight = plot.height();

        // console.log(oldWidth, newWidth, oldHeight, newHeight)
        // console.log(oldContainerWidth, histogram.width(), oldContainerHeight, histogram.height())

        // if (newWidth > newHeight) {
        //     histogram.css("width", plot.height()-plot.find("#image_info").height());
        //     histogram.css("height", plot.height()-plot.find("#image_info").height());
        //     // histogram.css("height", newHeight);
        //     // image.css("height", image.height()*oldHeight/newHeight);
        //     // image.css("width", "auto");
        // } else {
        //     // image.css("width", image.width()*oldWidth/newWidth);
        //     // image.css("height", "auto");
        // }

      }
})

////////////////////////////////////////////////////////////////////////////////
//                                                                    Figures //
////////////////////////////////////////////////////////////////////////////////

// Figure 1
d3.json("data/paintings.json",function (json) {
    
    figure1();

    $(".refresh-action").on("click", function(){
        figure1();
    })

    function figure1() {
        // reset the plot
        document.getElementById('image').src = "";
        $("#image_info p").html("");
        $("#container").html("");
        // pick a random item from the dataset
        var item = json[Math.floor(Math.random()*json.length)];
        // update satus
        $(".status").html("<p>Downloading painting</p>")
        // load the image of the painting and draw histograms
        loadImage(item);
    }
});


function makeHistograms(item)
{
    // display caption
    // document.getElementById("caption1").style.display = "block";
    $(".status").html("<p>Computing histogram</p>")

    // fill painting information
    loadPaintingInformations(item);

    // Get the particles from the image's pixels.
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    // getImageData returns an RGBA byte array.
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // compute the histogram
    var histogram = computeHistogram(pixels);

    // var start = new Date().getTime();
    // histogram2D();
    // var end = new Date().getTime();
    // var time = end - start;
    // console.log("histogram2D - Execution time: "+time/1000+" sec")
    
    // initiate a 3D scene
    init3D("container");
    // render the 3D histogram
    histogram3D(histogram);
    // add color-wheel box-plot axis
    // scene.add(buildAxes(1.0))
    $(".status").html("")

}

function loadPaintingInformations (item) {
    var item_info_string = "<div id='image_info'><p class='info'>";
    item_info_string += "<b>Artist: </b>"+item["artist"]+"<br>";
    item_info_string += "<b>Title: </b>"+item["title"]+"<br>";
    item_info_string += "<b>Genre: </b>"+item["genre"].replace("-", " ")+"<br>";
    item_info_string += "<b>Style: </b>"+item["style"].replace("-", " ")+"<br>";
    item_info_string += "<b>Year: </b>"+item["year"]+"</p></div>";
    $("#image_holder").append(item_info_string);
};

function loadImage(item) {
    // Create wikiart link from painting url               
    document.getElementById('img_link').href = item["url"];
    // Go through another proxy to circumvent the CORS limitation
    // var url = "https://crossorigin.me/"+item["url"];
    var url = "https://cors-anywhere.herokuapp.com/"+item["url"];
    // Get image DOM element from figure 1
    img = document.getElementById('image');
    // Set the crossOrigin property.
    img.crossOrigin = 'Anonymous';

    // Try to load the painting with Blog size (~50kb)
    $.ajax({
        type: 'HEAD',
        url: url+'!Blog.jpg',
        success: function() {img.src = url+"!Blog.jpg";},
        // If it fails load default size
        error: function() {img.src = url;}
    });

    // img.src = "local/flow.jpg";

    // Wait until image is fully loaded to compute histogram
    img.onload = function() {makeHistograms(item)};
    // Error function
    img.onerror = function() { 
        alert('Error loading image: ', url);
        console.error('Error loading image:');
        console.error(url) 
    };
}


// // Figure 2

// // load data from the histogram dataset
// d3.json("data/histograms.json",function (json) {
//     alert();
//     // load the histogram
//     var histogram2 = json;
//     // initiate a 3D scene in the "histogram_all" div
//     init3D("histogram_all");
//     // render the 3D histogram
//     histogram3D(histogram2);
// });


// Bibliography

$.get('paintings_study.bib', function(data) {
var biblio = bibtexParse.toJSON(data);
for (i=0; i<biblio.length; i++) {
    var citation = biblio[i]["entryTags"];
    var bibentry = citation["author"]+"<br/>"
    bibentry += "<a target='_blank' href='"+citation["url"]+"' style='text-decoration:none'>"+citation["title"]+"</a><br/>"
    bibentry += citation["journal"]+", "+citation["year"]
    $(".bibliography").append('<div class="column-12 bibentry"><div style="margin-right:0.5em;">['+(i+1).toString()+']</div><div id="bibitem'+i.toString()+'">'+bibentry+'</div></div>')
}
}, 'text');

$( document ).ready(function() {
$(".ref").each(function(i, e) {
    this.href = $("#bibitem"+i.toString()+" a").attr("href");
});
});