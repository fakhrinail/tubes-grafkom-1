const computePolygonPositions = (sides, radius) => {
  let positions = [];

  for (let i = 0; i < sides; i++) {
    let i0 = i;
    let i1 = (i + 1) % sides;

    let theta0 = (2.0 * Math.PI * i0) / sides;
    let theta1 = (2.0 * Math.PI * i1) / sides;

    let x0 = radius * Math.cos(theta0);
    let y0 = radius * Math.cos(theta0);

    let x1 = radius * Math.cos(theta1);
    let y1 = radius * Math.cos(theta1);

    positions.push(0, 0);
    positions.push(x0, y0);
    positions.push(x1, y1);
  }

  return positions;
};

const computePolygonCoordinates = (sides, radius) => {
  for (let i = 0; i < sides; i++) {
    console.log(
      radius * Math.cos((2 * Math.PI * i) / sides),
      radius * Math.sin((2 * Math.PI * i) / sides)
    );
  }
};

console.log(computePolygonCoordinates(4, 0.1));
console.log(computePolygonPositions(4, 1));
