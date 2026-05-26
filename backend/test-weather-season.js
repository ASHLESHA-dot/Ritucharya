const engine = require('./recommendationEngine.js');

// Test different weather scenarios
const scenarios = [
  { name: 'Hot Summer', temp: 35, humidity: 40, temperature: 35, condition: 'Sunny', description: 'clear sky' },
  { name: 'Rainy Monsoon', temp: 25, humidity: 85, temperature: 25, condition: 'Rain', description: 'moderate rain' },
  { name: 'Cold Winter', temp: 10, humidity: 50, temperature: 10, condition: 'Clear', description: 'clear sky' },
  { name: 'Spring', temp: 25, humidity: 55, temperature: 25, condition: 'Partly Cloudy', description: 'partly cloudy' },
  { name: 'Cool Hemanta', temp: 22, humidity: 45, temperature: 22, condition: 'Clear', description: 'clear sky' }
];

console.log('\n=== Weather-Based Season Detection Test ===\n');

scenarios.forEach(scenario => {
  const weatherObj = {
    temperature: scenario.temperature,
    humidity: scenario.humidity,
    condition: scenario.condition,
    description: scenario.description
  };
  const season = engine.getCurrentSeason(weatherObj);
  console.log(`${scenario.name.padEnd(20)} (T:${scenario.temperature}°C H:${scenario.humidity}% C:${scenario.condition}) => ${season}`);
});

console.log('\n=== Test Recommendations with Detected Season ===\n');

const weatherData = { temperature: 35, humidity: 40, condition: 'Sunny', description: 'Clear sky' };
const rec = engine.getRecommendations('Vata', weatherData);
if (rec) {
  console.log(`Vata recommendations detected for season: ${rec.season}`);
  console.log(`Prakriti: ${rec.prakriti}`);
} else {
  console.log('No recommendations found');
}

