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
let isSelectBtnClicked = false;

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

const getPoints = (coordinates) => {
  const points = coordinates.map( function(element,index){ 
    return index%3===0 ? tempCoordinates.slice(index,index+3) : null; 
  }).filter(function(e){ return e; });

  return points;
}

const getDistance = (x1, y1, x2, y2) => {
  let y = x2 - x1;
  let x = y2 - y1;
    
  return Math.sqrt(x * x + y * y);
}

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

const selectBtnClickHandler = () => {
  if (isSelectBtnClicked) {
    isSelectBtnClicked = false;

    helperText.innerHTML = "point selected";

    // divide temp coordinates to selected points and target points
    const points = getPoints(tempCoordinates);

    if (points.length % 2 !== 0) {
      helperText.innerHTML = "amount of selected and target points don't match";
      points.pop();
    }

    const selectedPoints = points.filter((element,index) => {
      if (index % 2 == 0) {
        return element;
      }
    })

    const targetPoints = points.filter((element,index) => {
      if (index % 2 !== 0) {
        return element;
      }
    })

    // divide available coordinates to points
    
    const currentLinePoints = getPoints(line.coordinates);
    const currentPolygonPoints = getPoints(polygon.coordinates);

    // swap matching current point with target point
    let selectLinePointIndex = 0;
    for (let index = 0; index < currentLinePoints.length; index++) {
      const [x1, y1] = currentLinePoints[index];
      const [x2, y2] = selectedPoints[selectLinePointIndex];

      if (getDistance(x1, y1, x2, y2) <= 0.05) {
        currentLinePoints[index] = targetPoints[selectLinePointIndex];
        selectLinePointIndex++;
      }
    }

    let selectPolygonPointIndex = 0;
    for (let index = 0; index < currentPolygonPoints.length; index++) {
      const [x1, y1] = currentPolygonPoints[index];
      const [x2, y2] = selectedPoints[selectPolygonPointIndex];

      if (getDistance(x1, y1, x2, y2) <= 0.05) {
        currentPolygonPoints[index] = targetPoints[selectPolygonPointIndex];
        selectPolygonPointIndex++;
      }
    }


  } else {
    isSelectBtnClicked = true;

    helperText.innerHTML = "click on a point to select it, then click a spot you want it to move to";
  }
}


function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// set event listener and handler
document
  .getElementById("btnChangeColor")
  .addEventListener("click", (event) => {
    setColorData(vertexData) 
  });

document
  .getElementById("btnPolygon")
  .addEventListener("click", (event) => {
    polygonBtnClickHandler()
  });

document
  .getElementById("btnLine")
  .addEventListener("click", (event) => {
    lineBtnClickHandler()
  });

document.
  getElementById("btnSelect").
  addEventListener("click", (event) => {
  selectBtnClickHandler()
});

canvas.addEventListener("click", (event) => {
  const {x, y} = getMousePosition(canvas, event);

  if (isPolygonBtnClicked || isLineBtnClicked || isSelectBtnClicked) {
    console.log("Determine points");
    tempCoordinates.push(x, y, 0);
  } else {
    console.log("Click the button to begin operation");
  }
})

if (!gl) {
  throw new Error("WebGL not supported");
}

function render() {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(program);
  
  const positionLocation = gl.getAttribLocation(program, `position`);
  const colorLocation = gl.getAttribLocation(program, `color`);

  let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

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

    const count = Math.floor(vertexData.length / 2);

    gl.drawArrays(gl.LINES, 0, count);
  })

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

  requestAnimationFrame(render);
}

render();
