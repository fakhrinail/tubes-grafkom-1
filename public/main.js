import getColorDataFromInput from "./getColorData.js";
import initShaders from "./initShaders.js";

let isPolygonBtnClicked = false;

const polygon = {
  coordinates: [],
  color: []
}

const vertexData = polygon.coordinates.length !== 0 ? 
  polygon.coordinates : [
  100, 200, 0,
  600, 200, 0,
  100, 300, 0,
  100, 300, 0,
  600, 200, 0,
  600, 300, 0
];


const setColorData = (vertexData) => {
  console.log("test");
  const colorData = getColorDataFromInput(vertexData);

  gl.clear(gl.COLOR_BUFFER_BIT);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
};


const polygonBtnClickHandler = () => {
  if (isPolygonBtnClicked) {
    isPolygonBtnClicked = false;

    console.log(polygon.coordinates);
    console.log("drawing polygon now...");
  } else {
    isPolygonBtnClicked = true
    console.log("click on the canvas to determine points");
  }
}

function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// get elements
document
  .getElementById("btnChangeColor")
  .addEventListener("click", (event) => {
    setColorData(vertexData) 
  });
  
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

document
  .getElementById("btnPolygon")
  .addEventListener("click", polygonBtnClickHandler);

canvas.addEventListener("click", (event) => {
  if (isPolygonBtnClicked) {
    console.log("Determine point");
    const {x, y} = getMousePosition(canvas, event);
    console.log(x, y);

    polygon.coordinates.push(x);
    polygon.coordinates.push(y);
    polygon.coordinates.push(0);
  } else {
    console.log("Click the button to begin operation");
  }
})

if (!gl) {
  throw new Error("WebGL not supported");
}

const colorData = getColorDataFromInput(vertexData);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

const program = initShaders(gl, "vertex-shader", "fragment-shader");
gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

gl.useProgram(program);

function render() {
  requestAnimationFrame(render);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

render();
