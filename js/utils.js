function generateRandomValues(Z, V, X, Y) {
    // Check if the input parameters are valid
    if (Z <= 0 || X <= 0 || Y <= 0 || Y <= X || V < 0) {
      console.error("Invalid input parameters");
      return [];
    }
  
    // Initialize an array to store the generated values
    let randomValues = [];
  
    // Generate the first random value greater than V
    let currentValue = V + Math.random() * (Y - V);
  
    // Generate Z-1 more values with the specified distance
    for (let i = 0; i < Z; i++) {
      randomValues.push(currentValue);
  
      // Calculate the next random value with the specified distance
      currentValue += X + Math.random() * (Y - X);
    }
  
    return randomValues;
}

function generateIntenseColor() {
  const minSaturation = 70; // Set a minimum saturation value for intense colors

  const hue = Math.random() * 360; // Random hue between 0 and 360
  const saturation = Math.random() * (100 - minSaturation) + minSaturation; // Ensure minimum saturation
  const lightness = Math.random() * 50 + 50; // Random lightness between 50 and 100 for a bright color

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return color;
}

export {generateRandomValues, generateIntenseColor}