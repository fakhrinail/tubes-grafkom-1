const getColorDataFromInput = (vertexData) => {
  const redValue = document.getElementById("red").value || 0;
  const greenValue = document.getElementById("green").value || 0;
  const blueValue = document.getElementById("blue").value || 0;
  console.log(redValue, greenValue, blueValue);

  const colorData = [];

  console.log(vertexData);

  if (vertexData != undefined) {
      vertexData.forEach(element => {
        colorData.push(redValue, greenValue, blueValue);
      });

      return colorData;
  }

  return [0, 0, 0];
};

export default getColorDataFromInput;
