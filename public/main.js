import getColorDataFromInput from "./getColorData.js";
import initShaders from "./initShaders.js";

const canvas = document.querySelector("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl");

const program = initShaders(gl, "vertex-shader", "fragment-shader");

let helperText = document.getElementById("helperText");

let isPolygonBtnClicked = false;
let isLineBtnClicked = false;

const line = {
  coordinates: []
}

const polygon = {
  coordinates: [],
  color: []
}

let tempCoordinates = [];

let vertexData = polygon.coordinates.length !== 0 ? 
  polygon.coordinates : [
  100, 200, 0,
  600, 200, 0,
  100, 300, 0,
  100, 300, 0,
  600, 200, 0,
  600, 300, 0
];

const setColorData = (vertexData) => {
  const colorData = getColorDataFromInput(vertexData);

  polygon.color = colorData;

  gl.clear(gl.COLOR_BUFFER_BIT);

  const colorLocation = gl.getAttribLocation(program, `color`);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const count = polygon.coordinates.length !== 0 ? Math.floor(polygon.coordinates.length / 3) : vertexData.length / 3;
  gl.drawArrays(gl.TRIANGLES, 0, count);

  render();
};

const lineBtnClickHandler = () => {
  if (isLineBtnClicked) {
    isLineBtnClicked = false;

    line.coordinates.push(tempCoordinates);

    helperText.innerHTML = "drawing line now...";
  } else {
    helperText.innerHTML = "click on the canvas to determine points";
    isLineBtnClicked = true
  }
}

const polygonBtnClickHandler = () => {
  if (isPolygonBtnClicked) {
    isPolygonBtnClicked = false;

    helperText.innerHTML = "drawing polygon now...";
    
    polygon.coordinates.push(tempCoordinates);
    tempCoordinates = [];
  } else {
    helperText.innerHTML = "click on the canvas to determine points";
    isPolygonBtnClicked = true
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

document
  .getElementById("btnPolygon")
  .addEventListener("click", (event) => {
    polygonBtnClickHandler(vertexData)
  });

document
  .getElementById("btnLine")
  .addEventListener("click", (event) => {
    lineBtnClickHandler(vertexData)
  });

canvas.addEventListener("click", (event) => {
  if (isPolygonBtnClicked || isLineBtnClicked) {
    console.log("Determine point");
    const {x, y} = getMousePosition(canvas, event);
    console.log(x, y);

    tempCoordinates.push(x, y, 0);
  } else {
    console.log("Click the button to begin operation");
  }
})

if (!gl) {
  throw new Error("WebGL not supported");
}

function render() {
  console.log("render");
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);
  
  const positionLocation = gl.getAttribLocation(program, `position`);
  const colorLocation = gl.getAttribLocation(program, `color`);

  let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  polygon.coordinates.forEach(shape => {
    vertexData = shape;
    const colorData = getColorDataFromInput(vertexData);
  
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  
    gl.useProgram(program);
  
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    const count = Math.floor(vertexData.length / 3);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
  })

  line.coordinates.forEach(shape => {
    vertexData = shape;
    const colorData = getColorDataFromInput(vertexData);
  
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  
    gl.useProgram(program);
  
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    const count = Math.floor(vertexData.length / 3);

    gl.drawArrays(gl.LINES, 0, count);
  })

  requestAnimationFrame(render);
}

render();
