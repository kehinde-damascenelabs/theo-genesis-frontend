const fns = {
  fetchWeatherForecast: async ({ zipCode }) => {
    try {
      const response = await fetch(`http://localhost:3000/getWeatherForecast?zipCode=${zipCode}`); //DEV
      const json = await response.json();
      console.log('_____________json________________:', json);
      return json;
    } catch (error) {
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }
  },
};
                                                                                                    
module.exports = fns;
