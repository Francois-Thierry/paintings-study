var container, camera, scene, renderer, controls;
var uniforms = {
            color:     { value: new THREE.Color( 0xffffff ) },
            // about:config set security.fileuri.strict_origin_policy to False
            // texture:   { value: new THREE.TextureLoader().load( "ball.png" ) }
        };

var vertexshader = "attribute float size; attribute vec3 color; varying vec3 vColor; void main() {vColor=color; gl_PointSize=size; vec4 mvPosition=modelViewMatrix*vec4(position, 1.0); gl_Position = projectionMatrix*mvPosition;}"
var fragmentshader = "varying vec3 vColor; void main() {gl_FragColor = vec4(vColor, 1.0);}"

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Three-js 

function init3D(id) {
    // get the container div
    container = document.getElementById(id);
    // init renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor(new THREE.Color('#9E9E9E'));
    renderer.setPixelRatio(window.devicePixelRatio);
    // put the renderer in the container
    container.appendChild(renderer.domElement);
    // init camera
    camera = new THREE.PerspectiveCamera(45, 1, 0.01, 5);
    // set the camera outside of the cube so that the user sees red, green,
    // blue, black and white
    camera.position.set(-1.5, 0.5, -0.5);
    // look at the center of the RGB color cube
    camera.lookAt(new THREE.Vector3(0.5, 0.5, 0.5));
    // init scene
    scene = new THREE.Scene();
    // init the controls to rotate the view
    initControls(camera);
    // force resize of canvas to the image width
    var LimitSize = $(".column-6").width();
    renderer.setSize(LimitSize, LimitSize);

    // Start drawing
    animate();
    render();
}

function initControls(camera) {
    // set the origin of the world to the center of a unitary cube
    var origin = new THREE.Vector3(.5, .5, .5);
    // create controls and target origin
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.copy(origin);
    // custom controls tweaking
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.06;

    // We need this to not call render() in animate() (which is called many
    // times per second)
    controls.addEventListener('change', render);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
// ht;
//     camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));
//     camera.position.x = window.innerWidth / 2;
//     camera.position.y = window.innerHeight / 2;
    camera.updateProjectionMatrix();
    // If we have dynamic movement, we need to call render every frame.
    if(!controls.staticMoving) render();
}

function render() {
    // render the scene
    renderer.render(scene, camera);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Histograms function

function computeHistogram(pixels) {
    var results = {};
    var color_key = "";
    // compute histogram
    for (var i=0; i<pixels.length/4; i++) {
        color_key = pixels[4*i+0]+","+pixels[4*i+1]+","+pixels[4*i+2];
        if (!(color_key in results)) {
            results[color_key] = 1;
        } else {
            results[color_key] += 1;
        }
    }
    return results;
}

function histogram3D(histogram) {
    // add color wheel box-plot axis
    scene.add(buildAxes(1.));
    // instanciate buffer attributes
    var positions = new Float32Array(Object.keys(histogram).length*3);
    var colors = new Float32Array(Object.keys(histogram).length*3);
    var sizes = new Float32Array(Object.keys(histogram).length);
    // get colors from histogram keys
    var keys = Object.keys(histogram).map(function (key) {return key});

    for (var i=0; i<keys.length; i++) {

        var key = keys[i];

        var r = parseInt(key.split(",")[0])/255.;
        var g = parseInt(key.split(",")[1])/255.;
        var b = parseInt(key.split(",")[2])/255.;

        if (histogram[key]>1) {
            colors[3*i+0] = r;
            colors[3*i+1] = g;
            colors[3*i+2] = b;
            
            // colors are also positions
            positions[3*i+0] = r;
            positions[3*i+1] = g;
            positions[3*i+2] = b;

            sizes[i] = histogram[key];
        }
    };
    // find the maximum pixel count
    var maxCounts = Math.max.apply(Math, sizes);
    // normalize the sizes
    sizes = sizes.map(function(v) {
        return Math.round(1+49*v/maxCounts);
    });
    // Create a new buffer geometry with precomputed attributes
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    // Prepare a new material from custom GLSL shader (at the top of the file)
    var shaderMaterial = new THREE.ShaderMaterial({uniforms:uniforms,
        vertexShader:vertexshader, fragmentShader:fragmentshader});
    // create the particules and add it to the scene
    var particles = new THREE.Points(geometry, shaderMaterial);
    var object = new THREE.Mesh( new THREE.CircleGeometry(50, 20, 0, Math.PI*2), shaderMaterial);
    scene.add(particles);
    // render the histogram
    render();
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// RGB Boxplot outline: color-wheel

function createAxisLine(position0, position1, color0, color1, dashed) {
    // From: http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
    var geom = new THREE.Geometry();
    var mat;
    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: 0xffffff, vertexColors: THREE.VertexColors, dashSize: 10/255., gapSize: 5/255. });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 2, color: 0xffffff, vertexColors: THREE.VertexColors });
    }
    // Lines blend colors.
    // From: http://threejs.org/examples/webgl_lines_colors.html
    geom.colors = [ color0.clone(), color1.clone() ];
    geom.vertices.push(position0.clone());
    geom.vertices.push(position1.clone());
    // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
    geom.computeLineDistances(); 
    var axis = new THREE.Line(geom, mat, THREE.LineSegments);
    return axis;
}

function buildAxes(length) {
    // From: http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
    var axes = new THREE.Object3D();
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), new THREE.Color(0x000000), new THREE.Color(0xFF0000), false)); // +X
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), new THREE.Color(0x000000), new THREE.Color(0x00FF00), false)); // +Y
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), new THREE.Color(0x000000), new THREE.Color(0x0000FF), false)); // +Z
    // XY
    axes.add(createAxisLine(new THREE.Vector3(length, 0, 0), new THREE.Vector3(length, length, 0), new THREE.Color(0xFF0000), new THREE.Color(0xFFFF00), false));
    axes.add(createAxisLine(new THREE.Vector3(0, length, 0), new THREE.Vector3(length, length, 0), new THREE.Color(0x00FF00), new THREE.Color(0xFFFF00), false));
    // YZ
    axes.add(createAxisLine(new THREE.Vector3(0, length, 0), new THREE.Vector3(0, length, length), new THREE.Color(0x00FF00), new THREE.Color(0x00FFFF), false));
    axes.add(createAxisLine(new THREE.Vector3(0, 0, length), new THREE.Vector3(0, length, length), new THREE.Color(0x0000FF), new THREE.Color(0x00FFFF), false));
    // XZ
    axes.add(createAxisLine(new THREE.Vector3(length, 0, 0), new THREE.Vector3(length, 0, length), new THREE.Color(0xFF0000), new THREE.Color(0xFF00FF), false));
    axes.add(createAxisLine(new THREE.Vector3(0, 0, length), new THREE.Vector3(length, 0, length), new THREE.Color(0x0000FF), new THREE.Color(0xFF00FF), false));
    // XY from 1,1,1
    axes.add(createAxisLine(new THREE.Vector3(length, length, length), new THREE.Vector3(length, length, 0), new THREE.Color(0xFFFFFF), new THREE.Color(0xFFFF00), false));
    // YZ from 1,1,1
    axes.add(createAxisLine(new THREE.Vector3(length, length, length), new THREE.Vector3(0, length, length), new THREE.Color(0xFFFFFF), new THREE.Color(0x00FFFF), false));
    // XZ from 1,1,1
    axes.add(createAxisLine(new THREE.Vector3(length, length, length), new THREE.Vector3(length, 0, length), new THREE.Color(0xFFFFFF), new THREE.Color(0xFF00FF), false));
    return axes;
}
