import getColorDataFromInput from "./getColorData.js";

const setColorData = () => {
  const colorData = getColorDataFromInput();

  gl.clear(gl.COLOR_BUFFER_BIT);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(animate);
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

const vertexData = [
  0,
  1,
  0, // V1.position
  1,
  -1,
  0, // V2.position
  -1,
  -1,
  0, // V3.position
];

// const vertexData = [
//   0, 0, 1, 1, -0.4999999999999998, -0.4999999999999998, 0, 0,
//   -0.4999999999999998, -0.4999999999999998, -0.5000000000000004,
//   -0.5000000000000004, 0, 0, -0.5000000000000004, -0.5000000000000004, 1, 1,
// ];

const colorData = getColorDataFromInput();

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vertexShader,
  `
precision mediump float;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;
uniform mat4 matrix;
void main() {
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
}
`
);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  fragmentShader,
  `
precision mediump float;
varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1);
}
`
);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, `matrix`),
};

const matrix = mat4.create();

mat4.translate(matrix, matrix, [0.2, 0.5, 0]);

mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

function animate() {
  requestAnimationFrame(animate);
  mat4.rotateZ(matrix, matrix, Math.PI / 2 / 70);
  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

animate();
