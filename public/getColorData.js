const getColorDataFromInput = () => {
  const redValue = document.getElementById("red").value || 0;
  const greenValue = document.getElementById("green").value || 0;
  const blueValue = document.getElementById("blue").value || 0;
  console.log(redValue, greenValue, blueValue);

  const colorData = [
    redValue,
    greenValue,
    blueValue,
    redValue,
    greenValue,
    blueValue,
    redValue,
    greenValue,
    blueValue,
  ];

  return colorData;
};

export default getColorDataFromInput;
