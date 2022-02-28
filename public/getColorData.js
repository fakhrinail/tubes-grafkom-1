const getColorDataFromInput = (vertexData) => {
  const redValue = document.getElementById("red").value || 0;
  const greenValue = document.getElementById("green").value || 0;
  const blueValue = document.getElementById("blue").value || 0;

  return [redValue, greenValue, blueValue, 1];
};

export default getColorDataFromInput;
