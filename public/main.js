import getColorDataFromInput from "./getColorData.js";
import initShaders from "./initShaders.js";

const setColorData = () => {
  const colorData = getColorDataFromInput();

  gl.clear(gl.COLOR_BUFFER_BIT);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
};

// get elements
document
  .getElementById("btnChangeColor")
  .addEventListener("click", setColorData);

const { mat4, mat3, vec3 } = glMatrix;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

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
  1, 0, -0.4999999999999998, 0.8660254037844387, -0.5000000000000004,
  -0.8660254037844385,
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

gl.useProgram(program);

function render() {
  requestAnimationFrame(render);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

render();
