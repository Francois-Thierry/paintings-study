var container;
var camera, scene, renderer, controls;
var particleSystem;
 
// For picking
var picking_data = {};

function uniquePixels(data, skip_transparent)
{
    if(skip_transparent===undefined) skip_transparent = true;   
    /*
    Given an array of RGBA unsigned char values, every four of which represent
    the next pixel, returns an array of unique values.
    */
    var unique = {};
    var num_pixels = data.length/4;
    for(var i = 0; i < num_pixels; ++i)
    {
        // Skip transparent pixels
        if(skip_transparent && data[ 4*i + 3 ] == 0)
        {
            continue;
        }
        unique[ [
            data[ 4*i + 0 ],
            data[ 4*i + 1 ],
            data[ 4*i + 2 ],
            data[ 4*i + 3 ]
            ] ] = true;
    }
    /*
    /// Chrome reads the RGB channels of 100% transparent pixels as 0,0,0.
    /// I didn't test other browsers.
    */
    var result = [];
    for(var k in unique)
    {
        var color = JSON.parse('[' + k + ']');
        // Push color[0], color[1], ... to the end of result.
        result.push.apply(result, color);
    }
    // console.log(result.length/4 + " / " + data.length/4 + " = " + (100*result.length/data.length) + "% unique pixels");
    return result;
}

function histogram3D(params)
{
    init3D();
    onWindowResize();

    if(params === undefined) params = {};
    // // By default, only create particles for unique colors.
    // if(!('only_unique_pixels' in params)) params.only_unique_pixels = true;
    
    if(particleSystem !== undefined) scene.remove(particleSystem);
    
    // Get the particles from the image's pixels.
    // From: http://stackoverflow.com/questions/1041399/how-to-use-javascript-or-jquery-to-read-a-pixel-of-an-image
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    // getImageData returns an RGBA byte array.
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // about:config set security.fileuri.strict_origin_policy to False
    var uniforms = {
                color:     { value: new THREE.Color( 0xffffff ) },
                // texture:   { value: new THREE.TextureLoader().load( "ball.png" ) }
            };

    var vertexshader = "attribute float size; attribute vec3 customColor; varying vec3 vColor; void main() { vColor = customColor; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_PointSize = size * ( 1.0 / -mvPosition.z ); gl_Position = projectionMatrix * mvPosition; }"
    var fragmentshader = "uniform vec3 color; uniform sampler2D texture; varying vec3 vColor; void main() { gl_FragColor = vec4( color * vColor, 1.0 ); gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); }"
    
    var vertexshader = "attribute float size; attribute vec3 color; varying vec3 vColor; void main() { vColor = color; gl_PointSize = size; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_Position = projectionMatrix * mvPosition; }"
    var fragmentshader = "varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }"

    var shaderMaterial = new THREE.ShaderMaterial( {
        uniforms:       uniforms,
        vertexShader:   vertexshader,
        fragmentShader: fragmentshader
    });


    // if(params.only_unique_pixels) {
    //     // Only take unique colors.
        // pixels = uniquePixels(pixels); // ~ 0.4 sec
    // }
    
    var particles = pixels.length / 4;

    var geometry = new THREE.BufferGeometry();

    // var positions = new Float32Array(particles * 3);
    // var colors = new Float32Array(particles * 3);

    var color = new THREE.Color();

    var results = {};
    var color_key = "";
    // var counts = new Float32Array(particles);

    // compute histogram
    for (var i = 0; i < particles; i += 1) {
        color_key = pixels[4*i+0]+","+pixels[4*i+1]+","+pixels[4*i+2];
        if (!(color_key in results)) {
            results[color_key] = 1
        } else {
            results[color_key] += 1
        }
    }

    var positions = new Float32Array(Object.keys(results).length*3);
    var colors = new Float32Array(Object.keys(results).length*3);
    var custom_colors = new Float32Array(Object.keys(results).length*3);
    var counts = new Float32Array(Object.keys(results).length);

    var keys = Object.keys(results).map(function (key) {return key});

    for (var i=0; i<keys.length; i++) {

        var key = keys[i];

        var r = parseInt(key.split(",")[0])/255.;
        var g = parseInt(key.split(",")[1])/255.;
        var b = parseInt(key.split(",")[2])/255.;
        
        // colors are also positions
        positions[3*i+0] = r;
        positions[3*i+1] = g;
        positions[3*i+2] = b;

        colors[3*i+0] = r;
        colors[3*i+1] = g;
        colors[3*i+2] = b;

        // counts[i] = 20;
        counts[i] = ((results[key] > 50) ? 50 : results[key]);

    };

    // console.log(keys)

    // ~0.03 sec
    // var counts = Object.keys(results).map(function (key) {return results[key]});
    // counts = new Uint8Array(counts)

    var material = new THREE.PointsMaterial({size:5/255, vertexColors:THREE.VertexColors});

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(custom_colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(counts, 1));

    geometry.computeBoundingSphere();

    //

    // material.size = new THREE.BufferAttribute(counts, 1);
    particles = new THREE.Points(geometry, shaderMaterial);
    // particles = new THREE.Points(geometry, material);
    // return particles;
    scene.add(particles);
    
    render();
}


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
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
    
    var axis = new THREE.Line(geom, mat, THREE.LineSegments);
    
    return axis;
}

function buildAxes(length)
{
    // From: http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
    var axes = new THREE.Object3D();
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), new THREE.Color(0x000000), new THREE.Color(0xFF0000), false)); // +X
    // axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), new THREE.Color(0x000000), new THREE.Color(0x00FF00), false)); // +Y
    // axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), new THREE.Color(0x000000), new THREE.Color(0x0000FF), false)); // +Z
    // axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z
    
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

function mouseFromEvent(event) {
    var mouse = new THREE.Vector2();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    return mouse;
}
var mouseActionHandler = {};
function onDocumentMouseDown(event) {
    // TODO Q: Should I call event.preventDefault() or are the controls doing that?
    
    // We could miss a mouse up event if the user switches apps in the middle
    // of a drag. Always cleanup first.
    if('cleanup' in mouseActionHandler) mouseActionHandler.cleanup();
    mouseActionHandler = {};
    
    // A function to try the various things we might want to do on mouse down.
    function chooseMouseHandlers(event) {

        // If no one handled it, use an empty handler.
        handler = {};
        
        return handler;
    }
    mouseActionHandler = chooseMouseHandlers(event);
    
    // Render at the end. Something might have happened.
    render();
}
function onDocumentMouseMove(event) {
    // TODO Q: Should I call event.preventDefault() or are the controls doing that?
    
    if('drag' in mouseActionHandler) mouseActionHandler.drag(event);
    
    // Render at the end. Something might have happened.
    render();
}
function onDocumentMouseUp(event) {
    // TODO Q: Should I call event.preventDefault() or are the controls doing that?
    
    if('up' in mouseActionHandler) mouseActionHandler.up(event);
    if('cleanup' in mouseActionHandler) mouseActionHandler.cleanup();
    
    // Reset the mouse action handler.
    mouseActionHandler = {};
    
    // Render at the end. Something might have happened.
    render();
}

function getLookVector() {
    // normalize(controls.target - camera.position)
    return controls.target.clone().sub(camera.position).normalize();
}
function initControls(camera)
{
    var origin = new THREE.Vector3(.5, .5, .5);
    
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.copy(origin);
    
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 2;
    controls.panSpeed = 0.8;

    // controls.noZoom = true;
    controls.noPan = true;
    // Keep the horizon level? No.
    camera.noRoll = false;

    controls.staticMoving = true;
    // dynamicDampingFactor only has an effect when staticMoving is false.
    // Setting it to 0 allows constant-speed rotation in a loop.
    controls.dynamicDampingFactor = 0.0;

    // We need this because we wouldn't otherwise call render().
    // Namely, we do not call render() in our animate() function called
    // many times per second.
    controls.addEventListener('change', render);
    
    // We need these handlers for interacting with the 3D scene.
    // TODO Q: Why can't I set these on renderer.domElement?
    container = document.getElementById('container');
    container.onmousemove = onDocumentMouseMove;
    container.addEventListener('mousedown', onDocumentMouseDown, false);
    container.addEventListener('mouseup', onDocumentMouseUp, false);
    
    // Prepare for mouse picking. We need a plane and a projector.
    picking_data.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5000, 5000, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    picking_data.plane.visible = false;
    scene.add(picking_data.plane);
    
    picking_data.raycaster = new THREE.Raycaster();
}

function init3D() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 10);
    camera.position.set(-1.5, 0.5, -0.5);
    camera.lookAt(new THREE.Vector3(0.5, 0.5, 0.5));

    scene = new THREE.Scene();
    scene.add(buildAxes(1.));

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor(new THREE.Color('#9E9E9E'));
    renderer.setPixelRatio(window.devicePixelRatio);

    var clientWidth = document.getElementById('image').clientWidth;
    renderer.setSize(clientWidth, clientWidth);

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    
    initControls(camera);
    
    // Start drawing
    animate();
    render();
}

function onWindowResize() {

    var image_holder = document.getElementById('image')

    camera.aspect = image_holder.clientWidth/image_holder.clientWidth;
    camera.updateProjectionMatrix();

    renderer.setSize(image_holder.clientWidth, image_holder.clientWidth);
    
    controls.handleResize();

    render();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // If we have dynamic movement, we need to call render every frame.
    if(!controls.staticMoving) render();
}

function render() {               
    // Always set the plane's orientation to look at the camera.
    // picking_data.plane.lookAt(camera.position);
    // UPDATE: That is not necessarily the look vector.
    picking_data.plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), getLookVector());
    renderer.render(scene, camera);
}