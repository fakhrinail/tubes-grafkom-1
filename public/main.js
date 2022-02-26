import getColorDataFromInput from "./getColorData.js";
import initShaders from "./initShaders.js";

const setColorData = () => {
  const colorData = getColorDataFromInput();

  gl.clear(gl.COLOR_BUFFER_BIT);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
};

let isPolygonBtnClicked = false;

const polygonBtnClickHandler = () => {
  if (isPolygonBtnClicked) {
    console.log("drawing polygon now...");
  } else {
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
  .addEventListener("click", setColorData);
  
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

document.getElementById("btnPolygon").addEventListener("click", polygonBtnClickHandler);

canvas.addEventListener("click", (event) => {
  const mousePosition = getMousePosition(canvas, event);
  console.log(mousePosition);

  if (isPolygonBtnClicked) {
    console.log("Points determined, drawing polygon....");
  } else {
    console.log("Click to determine points in polygon");
  }
})

if (!gl) {
  throw new Error("WebGL not supported");
}

// const vertexData = [
//   0,
//   1,
//   0, // V1.position
//   1,
//   -1,
//   0, // V2.position
//   -1,
//   -1,
//   0, // V3.position
// ];

const vertexData = [
  100, 200, 0,
  600, 200, 0,
  100, 300, 0,
  100, 300, 0,
  600, 200, 0,
  600, 300, 0
];

const colorData = getColorDataFromInput();

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
