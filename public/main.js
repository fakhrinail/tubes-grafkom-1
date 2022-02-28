import getColorDataFromInput from "./getColorData.js";
import initShaders from "./initShaders.js";

const canvas = document.querySelector("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl");

const program = initShaders(gl, "vertex-shader", "fragment-shader");

let helperText = document.getElementById("helperText");

let isPolygonBtnClicked = false;
let isRectangleBtnClicked = false;
let isLineBtnClicked = false;
let isSquareBtnClicked = false;
let isSelectBtnClicked = false;
let isResizeBtnClicked = false;
let isResizeLineClicked = false;
let isLengthFilled = false;
let isLineLengthFilled = false;
let isOptionValid = false;
let isLineOptionValid = false;
let squareOption = -1;
let lineOption = -1;
let squareLength;
let lineLength;

const line = {
  coordinates: []
}

const polygon = {
  coordinates: [],
  color: []
}

const square ={
  coordinates: [],
  center: [],
  color: []
}

const rectangle = {
  coordinates: [],
  color: []
}

let tempCoordinates = [];
let tempCenter = [];

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
    return index%3===0 ? coordinates.slice(index,index+3) : null; 
  }).filter(function(e){ return e; });

  return points;
}

const getDistance = (x1, y1, x2, y2) => {
  let y = x2 - x1;
  let x = y2 - y1;
    
  return Math.sqrt(x * x + y * y);
}

const setNewPoint = (coordinates, oldPoint, newPoint) => {
  coordinates.forEach(shape => {
    const oldXIndex = shape.indexOf(oldPoint[0]);
    const oldYIndex = shape.indexOf(oldPoint[1]);
    if (oldXIndex !== -1 && oldYIndex !== -1) {
      shape[oldXIndex] = newPoint[0];
      shape[oldYIndex] = newPoint[1];
    }
  })
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
    addLineOption(line.coordinates.length-1);
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

const squareBtnClickHandler = () =>{
  if (isSquareBtnClicked){
    isSquareBtnClicked = false;

    helperText.innerHTML = "drawing square now...";

    square.coordinates.push(tempCoordinates);
    square.center.push(tempCenter);
    addOption(square.center.length-1);
    tempCoordinates = [];
    tempCenter = [];
  } else{
    helperText.innerHTML = "click on the canvas to determine center point";
    isSquareBtnClicked = true
  }
}

const rectangleBtnClickHandler = () => {
  if (isRectangleBtnClicked) {
    isRectangleBtnClicked = false;

    helperText.innerHTML = "drawing rectangle now...";

    if (tempCoordinates.length % 6 !== 0) {
      helperText.innerHTML = "amount of start points and end points don't match";
      tempCoordinates.splice(-3);
    }

    const tempPoints = getPoints(tempCoordinates);
    const rectangleCoordinates = [];
    tempPoints.forEach((point, index) => {
      if (index % 2 == 0) {
        rectangleCoordinates.push(
          point[index], point[index+1], 0,
          tempPoints[index+1][0], point[index+1], 0,
          point[index], tempPoints[index+1][1],  0, // first triangle
          point[index], tempPoints[index+1][1], 0,
          tempPoints[index+1][0], point[index+1],  0,
          tempPoints[index+1][0], tempPoints[index+1][1],  0, // second triangle
        )
      }
    })

    rectangle.coordinates.push(rectangleCoordinates);
    tempCoordinates = [];
  } else {
    helperText.innerHTML = "click on the canvas to determine points";
    isRectangleBtnClicked = true
  }
}

const resizeBtnClickHandler = () =>{
  if(isLengthFilled && isOptionValid){
    var index = document.getElementById("squareOption").value;
    var newSize = (document.getElementById("length").value)/2;
    isResizeBtnClicked = false;
    helperText.innerHTML = "resizing square now...";
    let tempCoord=[];
    var x = square.center[index][0];
    var y = square.center[index][1];
    tempCoord.push(x-newSize,y+newSize,0);
    tempCoord.push(x-newSize,y-newSize,0);
    tempCoord.push(x+newSize,y-newSize,0);
    tempCoord.push(x+newSize,y+newSize,0);
    square.coordinates[index] = tempCoord;
  }
}

const resizeLineClickHandler = () => {
  if (isLineLengthFilled && isLineOptionValid) {
    console.log("test");
    var index = document.getElementById("lineOption").value;
    var newSize = document.getElementById("length").value;
    isResizeBtnClicked = false;
    helperText.innerHTML = "resizing line now...";

    newSize -= 100.0;
    newSize /= 100.0;
    const [
      oldX1, oldY1, oldZ1,
      oldX2, oldY2, oldZ2,
    ] = line.coordinates[index];
    const V = [oldX1-oldX2, oldY1-oldY2];

    console.log(V);

    const factor = newSize;
    const newPosition = [oldX1 + (V[0] * factor), oldY1+ (V[1] * factor)];
    const newX = oldX1 + (V[0] * factor);
    const newY = oldY1 + (V[0] * factor);
    console.log(newPosition);
    
    // const newX = oldX2 + newSize * (oldX2 - oldX1);
    // const newY = oldY2 + newSize * (oldY2 - oldY1);

    console.log("lama", line.coordinates[index]);
    
    console.log(oldX2, oldY2);
    console.log(newPosition[0], newPosition[1]);
    
    line.coordinates[index] = [oldX1, oldY1, oldZ1, newX, newY, oldZ2];
    console.log("baru", line.coordinates[index]);
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
    let currentLinePoints = [];
    line.coordinates.forEach(shape => {
      const currentPoints = getPoints(shape);
      currentLinePoints.push(...currentPoints);
    })

    let currentPolygonPoints = [];
    polygon.coordinates.forEach(shape => {
      const currentPoints = getPoints(shape);
      currentPolygonPoints.push(...currentPoints);
    })

    let currentSquarePoints = [];
    square.coordinates.forEach(shape => {
      const currentPoints = getPoints(shape);
      currentSquarePoints.push(...currentPoints);
    })

    let currentRectanglePoints = [];
    rectangle.coordinates.forEach(shape => {
      const currentPoints = getPoints(shape);
      currentRectanglePoints.push(...currentPoints);
    })

    // swap matching current point with target point
    let selectLinePointIndex = 0;
    for (let index = 0; index < currentLinePoints.length; index++) {
      const [x1, y1] = currentLinePoints[index];
      const [x2, y2] = selectedPoints[selectLinePointIndex];

      if (getDistance(x1, y1, x2, y2) <= 0.05) {
        setNewPoint(line.coordinates, currentLinePoints[index], targetPoints[selectLinePointIndex]);
        selectLinePointIndex++;
      }

      // all selected and target points already resolved
      if (selectedPoints.length <= selectLinePointIndex && targetPoints.length <= selectLinePointIndex) {
        console.log("finish");
        break;
      }
    }

    let selectPolygonPointIndex = 0;
    for (let index = 0; index < currentPolygonPoints.length; index++) {
      const [x1, y1] = currentPolygonPoints[index];
      const [x2, y2] = selectedPoints[selectPolygonPointIndex];

      const distance = getDistance(x1, y1, x2, y2);
      if (distance <= 5) {
        setNewPoint(polygon.coordinates, currentPolygonPoints[index], targetPoints[selectPolygonPointIndex]);
        selectPolygonPointIndex++;
      }

      // all selected and target points already resolved
      if (selectedPoints.length <= selectPolygonPointIndex && targetPoints.length <= selectPolygonPointIndex) {
        console.log("finish");
        break;
      }
    }

    let selectSquarePointIndex = 0;
    for (let index = 0; index < currentSquarePoints.length; index++) {
      const [x1, y1] = currentSquarePoints[index];
      const [x2, y2] = selectedPoints[selectSquarePointIndex];

      const distance = getDistance(x1, y1, x2, y2);
      if (distance <= 5) {
        setNewPoint(square.coordinates, currentSquarePoints[index], targetPoints[selectSquarePointIndex]);
        selectSquarePointIndex++;
      }

      // all selected and target points already resolved
      if (selectedPoints.length <= selectSquarePointIndex && targetPoints.length <= selectSquarePointIndex) {
        console.log("finish");
        break;
      }
    }

    let selectRectanglePointIndex = 0;
    for (let index = 0; index < currentRectanglePoints.length; index++) {
      const [x1, y1] = currentRectanglePoints[index];
      const [x2, y2] = selectedPoints[selectRectanglePointIndex];

      const distance = getDistance(x1, y1, x2, y2);
      if (distance <= 5) {
        setNewPoint(rectangle.coordinates, currentRectanglePoints[index], targetPoints[selectRectanglePointIndex]);
        selectRectanglePointIndex++;
      }

      // all selected and target points already resolved
      if (selectedPoints.length <= selectRectanglePointIndex && targetPoints.length <= selectRectanglePointIndex) {
        console.log("finish");
        break;
      }
    }

    tempCoordinates = [];
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

document.
  getElementById("btnRectangle").
  addEventListener("click", (event) => {
  rectangleBtnClickHandler()
});

document
  .getElementById("squareOption")
  .addEventListener("click", (event) => {
    squareOption = document.getElementById("squareOption").value; 
    if (document.getElementById("squareOption").value == -1){
      isOptionValid = false;
      helperText.innerHTML = "No square selected";
    }else{
      isOptionValid = true;
    }
});

document
  .getElementById("lineOption")
  .addEventListener("click", (event) => {
    lineOption = document.getElementById("lineOption").value; 
    if (document.getElementById("lineOption").value == -1){
      isLineOptionValid = false;
      helperText.innerHTML = "No square selected";
    }else{
      isLineOptionValid = true;
    }
  });

document
  .getElementById("btnSquare")
  .addEventListener("click", (event) => {
    squareBtnClickHandler()
  });

document.
  getElementById("resizeSquare").
  addEventListener("click", (event) => {
    helperText.innerHTML="click resize";
  resizeBtnClickHandler()
});

document.
  getElementById("resizeLine").
  addEventListener("click", (event) => {
    helperText.innerHTML="click resize";
  resizeLineClickHandler()
});

document.
  getElementById("length").
  addEventListener("change", (event) => {
  if(document.getElementById("length").value > 0 && document.getElementById("length").value!= null){
    squareLength = document.getElementById("length").value/2;
    isLengthFilled = true;
  }
});

document.
  getElementById("lineLength").
  addEventListener("change", (event) => {
  if(document.getElementById("lineLength").value > 0 && document.getElementById("lineLength").value!= null){
    lineLength = document.getElementById("lineLength").value;
    isLineLengthFilled = true;
  }
});

canvas.addEventListener("click", (event) => {
  const {x, y} = getMousePosition(canvas, event);

  if (isPolygonBtnClicked || isLineBtnClicked || isSelectBtnClicked || isRectangleBtnClicked) {
    console.log("Determine points");
    tempCoordinates.push(x, y, 0);
  } else {
    if (isSquareBtnClicked){
      console.log("Determine points");
      
      if(isLengthFilled){
        tempCenter.push(x, y, 0);
        tempCoordinates.push(x-squareLength,y+squareLength,0);
        tempCoordinates.push(x-squareLength,y-squareLength,0);
        tempCoordinates.push(x+squareLength,y-squareLength,0);
        tempCoordinates.push(x+squareLength,y+squareLength,0);
      }else{
        console.log("Length value is not filled")
      }
    }
    else{
      console.log("Click the button to begin operation");
    }
  }
})

function addOption(idx) {
  var sq = document.getElementById("squareOption");
  var option = document.createElement("OPTION");
  option.innerHTML = "Square "+(idx+1);
  option.value = idx;
  sq.options.add(option);
}

function addLineOption(idx) {
  var ln = document.getElementById("lineOption");
  var option = document.createElement("OPTION");
  option.innerHTML = "Line "+(idx+1);
  option.value = idx;
  ln.options.add(option);
}

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

    const count = Math.floor(vertexData.length / 3);

    gl.drawArrays(gl.LINES, 0, count);
  })

  rectangle.coordinates.forEach(shape => {
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

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(vertexData.length / 3));
  })

  polygon.coordinates.forEach(shape => {
    console.log(shape);
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

  square.coordinates.forEach(shape => {
    vertexData = shape;
    const colorData = getColorDataFromInput(vertexData);
  
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  
    var indices = [3, 2, 1, 3, 1, 0];

    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  
    gl.useProgram(program);
  
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,Index_Buffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  })

  requestAnimationFrame(render);
}

render();
