// Import all prakriti JSON files
const vataData = require('./vata.json');
const pittaData = require('./pitta.json');
const kaphaData = require('./kapha.json');
const vataPittaData = require('./vata-pitta.json');
const pittaKaphaData = require('./pitta-kapha.json');
const vataKaphaData = require('./vata-kapha.json');
const triDoshaData = require('./Tri-dosha.json');

// Map of all prakriti types to their recommendation data
const prakritiDataMap = {
  'Vata': vataData,
  'Pitta': pittaData,
  'Kapha': kaphaData,
  'Vata-Pitta': vataPittaData,
  'Pitta-Vata': vataPittaData,
  'Pitta-Kapha': pittaKaphaData,
  'Kapha-Pitta': pittaKaphaData,
  'Kapha-Vata': vataKaphaData,
  'Vata-Kapha': vataKaphaData,
  'Vata-Pitta-Kapha': triDoshaData,
  'Tri-dosha': triDoshaData,
  'Tridosha': triDoshaData,
  'tridosha': triDoshaData,
  'tri-dosha': triDoshaData,
  'Triple': triDoshaData
};

/**
 * Determine Ayurvedic season based on weather data (temperature, humidity, condition)
 * Weather patterns are the primary indicator for Ayurvedic seasons
 * 
 * Weather-based characteristics:
 * - Grishma (Hot/Summer): temp > 30°C, low humidity, clear/sunny
 * - Varsha (Monsoon/Rainy): rainy conditions + high humidity (>70%)
 * - Shishira (Cold): temp < 15°C, very cold conditions
 * - Hemanta (Cool/Dewy): temp 15-22°C, cooling weather, dryness
 * - Vasanta (Spring): temp 20-26°C, moderate humidity, pleasant
 * - Sharad (Autumn): temp 24-32°C, moderate-low humidity, post-monsoon
 */
function getSeasonFromWeather(weatherData) {
  if (!weatherData || weatherData.temperature === undefined) {
    return 'Varsha'; // Default fallback season
  }

  const temp = weatherData.temperature;
  const humidity = weatherData.humidity !== undefined ? weatherData.humidity : 50;
  const condition = (weatherData.condition || '').toLowerCase();
  const description = (weatherData.description || '').toLowerCase();
  
  // Check for rain first (highest priority indicator)
  const isRainy = condition.includes('rain') || description.includes('rain') || condition.includes('drizzle') || description.includes('drizzle');
  
  // Very hot (summer) - highest priority for temp > 30°C
  if (temp > 30) {
    if (humidity < 70 && !isRainy) {
      return 'Grishma'; // Hot/Summer season
    }
  }

  // Rainy/Monsoon season - obvious rain indicators
  if (isRainy && humidity > 70) {
    return 'Varsha'; // Monsoon/Rainy season
  }

  // Very cold (winter) - temp < 15°C
  if (temp < 15) {
    return 'Shishira'; // Cold season
  }

  // Cool weather 15-22°C
  if (temp >= 15 && temp < 22) {
    if (humidity < 60) {
      return 'Hemanta'; // Cool/Dewy season
    }
  }

  // Pleasant spring-like 20-26°C with moderate humidity
  if (temp >= 20 && temp <= 26) {
    if (humidity >= 40 && humidity < 65 && !isRainy) {
      return 'Vasanta'; // Spring season
    }
  }

  // Warm autumn-like 24-32°C with moderate-low humidity (post-monsoon)
  if (temp >= 24 && temp <= 32) {
    if (humidity >= 45 && humidity < 70 && !isRainy) {
      return 'Sharad'; // Autumn season
    }
  }

  // Ambiguous weather - return most likely based on temperature
  if (temp > 28) return 'Sharad';
  if (temp > 22) return 'Vasanta';
  if (temp > 18) return 'Hemanta';
  return 'Varsha'; // Default
}

/**
 * Get current season from weather data (wrapper function)
 */
function getCurrentSeason(weatherData) {
  return getSeasonFromWeather(weatherData);
}

/**
 * Get recommendations from JSON files based on prakriti and season
 * Uses weather data to determine the most accurate season
 * Returns exact JSON data from the files
 */
function getRecommendations(prakritiType, weather) {
  try {
    // Use weather data to determine season (more accurate than calendar)
    const season = getCurrentSeason(weather);
    
    // Get the appropriate prakriti data
    const prakritiData = prakritiDataMap[prakritiType];
    
    if (!prakritiData) {
      console.warn(`No data found for prakriti type: ${prakritiType}`);
      return null;
    }

    // Find the recommendation for this season - return exact JSON
    const seasonalRec = prakritiData.find(
      rec => rec.season === season
    );

    if (!seasonalRec) {
      console.warn(`No recommendations found for ${prakritiType} in ${season}`);
      return null;
    }

    // Return exact JSON from the file
    return seasonalRec;
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return null;
  }
}

/**
 * Get all available seasons for a prakriti
 */
function getAvailableSeasons(prakritiType) {
  const data = prakritiDataMap[prakritiType];
  if (!data) return [];
  return data.map(rec => rec.season);
}

/**
 * Get recommendations for a specific season (override current season)
 * Returns exact JSON data from the files
 */
function getRecommendationsForSeason(prakritiType, season, weather) {
  try {
    const prakritiData = prakritiDataMap[prakritiType];

    if (!prakritiData) {
      return null;
    }

    const seasonalRec = prakritiData.find(rec => rec.season === season);

    if (!seasonalRec) {
      return null;
    }

    // Return exact JSON from the file
    return seasonalRec;
  } catch (error) {
    console.error('Error getting recommendations for season:', error);
    return null;
  }
}

// Export functions
module.exports = {
  getRecommendations,
  getRecommendationsForSeason,
  getCurrentSeason,
  getAvailableSeasons,
  prakritiDataMap
};

// // Recommendation templates for each prakriti type
// const prakritiTemplates = {
//   Vata: {
//     morningRoutine: [
//       {
//         title: "Wake up early",
//         description: "6:00-7:00 AM",
//         reason: "Early mornings balance Vata's natural tendency toward excess activity and anxiety"
//       },
//       {
//         title: "Oil massage (Abhyanga)",
//         description: "Use warm sesame or Brahmi oil for 10-15 minutes",
//         reason: "Grounding oils pacify Vata's dry, light qualities and calm the nervous system"
//       },
//       {
//         title: "Gentle warm shower",
//         description: "Follow massage with warm water",
//         reason: "Warmth stabilizes Vata's cold nature"
//       }
//     ],
//     diet: [
//       {
//         title: "Warm, cooked meals",
//         description: "Prefer soups, stews, and warm dishes",
//         reason: "Warm food aids Vata's weak digestion and provides grounding energy"
//       },
//       {
//         title: "Use oils and fats",
//         description: "Ghee, sesame oil, coconut oil in meals",
//         reason: "Oils lubricate Vata's dry digestive tract"
//       },
//       {
//         title: "Avoid raw and cold foods",
//         description: "Minimize salads, cold drinks, raw vegetables",
//         reason: "Raw foods aggravate Vata's dry, light nature"
//       }
//     ],
//     activities: [
//       {
//         title: "Gentle yoga",
//         description: "Slow-paced flows, grounding poses like mountain and tree",
//         reason: "Gentle movement stabilizes Vata without excessive exertion"
//       },
//       {
//         title: "Walking or tai chi",
//         description: "30-45 minutes at moderate pace",
//         reason: "Calming movement that doesn't exhaust nervous system"
//       },
//       {
//         title: "Meditation and pranayama",
//         description: "Focus on deep, slow breathing",
//         reason: "Calms Vata's tendency toward anxiety and scattered mind"
//       }
//     ],
//     sleep: [
//       {
//         title: "Early bedtime",
//         description: "10:00-10:30 PM",
//         reason: "Early sleep prevents Vata insomnia and anxiety"
//       },
//       {
//         title: "Warm milk with spices",
//         description: "Add ashwagandha, cardamom before bed",
//         reason: "Warming herbs promote sound sleep for Vata types"
//       },
//       {
//         title: "Keep bedroom warm and dark",
//         description: "Maintain comfortable temperature",
//         reason: "Warmth and stability support Vata sleep"
//       }
//     ],
//     lifestyle: [
//       {
//         title: "Maintain routine",
//         description: "Consistent daily schedule for meals, work, sleep",
//         reason: "Routine provides grounding that Vata needs"
//       },
//       {
//         title: "Limit stimulation",
//         description: "Reduce excessive screen time, social activity",
//         reason: "Calms Vata's tendency toward overstimulation"
//       }
//     ]
//   },

//   Pitta: {
//     morningRoutine: [
//       {
//         title: "Wake up moderately early",
//         description: "5:30-6:30 AM",
//         reason: "Moderate schedule balances Pitta's driven nature"
//       },
//       {
//         title: "Cooling oil massage",
//         description: "Use coconut oil or brahmi oil, moderate pressure",
//         reason: "Cooling oils pacify Pitta's hot, intense qualities"
//       },
//       {
//         title: "Cool water rinse (not cold shower)",
//         description: "Room temperature or cool water",
//         reason: "Cooling without shocking the system"
//       }
//     ],
//     diet: [
//       {
//         title: "Cooling foods",
//         description: "Favor coconut, cucumber, watermelon, mint",
//         reason: "Cooling foods reduce Pitta's excess heat"
//       },
//       {
//         title: "Reduce spicy, salty, sour foods",
//         description: "Minimize chili, salt, vinegar, citrus",
//         reason: "These aggravate Pitta's heat"
//       },
//       {
//         title: "Milk and ghee in moderation",
//         description: "Include cooling dairy products",
//         reason: "Cooling but not heavy for Pitta"
//       }
//     ],
//     activities: [
//       {
//         title: "Cooling yoga",
//         description: "Moon salutations, hip openers, forward bends",
//         reason: "Cooling poses balance Pitta's heat"
//       },
//       {
//         title: "Swimming or water sports",
//         description: "Cooling activities 30-45 minutes",
//         reason: "Water naturally cools Pitta's fire"
//       },
//       {
//         title: "Breath control (Sitali pranayama)",
//         description: "Cooling breathing technique",
//         reason: "Directly cools internal fire"
//       }
//     ],
//     sleep: [
//       {
//         title: "Moderate sleep schedule",
//         description: "10:30-11:00 PM bedtime",
//         reason: "Pitta sleeps well with consistent schedule"
//       },
//       {
//         title: "Cooling herbs before bed",
//         description: "Chamomile, brahmi tea",
//         reason: "Cooling herbs promote sleep without overheating"
//       },
//       {
//         title: "Cool bedroom environment",
//         description: "Well-ventilated, moderate temperature",
//         reason: "Coolness supports Pitta sleep"
//       }
//     ],
//     lifestyle: [
//       {
//         title: "Work in moderation",
//         description: "Take breaks to prevent burnout",
//         reason: "Prevents Pitta's tendency toward excess ambition"
//       },
//       {
//         title: "Practice patience and forgiveness",
//         description: "Meditation on compassion",
//         reason: "Softens Pitta's sharp, critical nature"
//       }
//     ]
//   },

//   Kapha: {
//     morningRoutine: [
//       {
//         title: "Wake up early",
//         description: "5:30-6:00 AM",
//         reason: "Early waking energizes Kapha's slow nature"
//       },
//       {
//         title: "Dry massage (Garshana)",
//         description: "Use dry brush or wool gloves, vigorous strokes",
//         reason: "Stimulating massage energizes Kapha's heavy, sluggish nature"
//       },
//       {
//         title: "Warm shower",
//         description: "Stimulating and warming",
//         reason: "Warmth and stimulation activate Kapha"
//       }
//     ],
//     diet: [
//       {
//         title: "Light, warm meals",
//         description: "Minimize heavy oils and dairy",
//         reason: "Light food prevents Kapha's tendency toward heaviness"
//       },
//       {
//         title: "Spicy, stimulating foods",
//         description: "Include ginger, black pepper, chili",
//         reason: "Spice stimulates Kapha's sluggish digestion"
//       },
//       {
//         title: "Avoid cold, sweet, heavy foods",
//         description: "Skip desserts, ice cream, wheat excess",
//         reason: "These aggravate Kapha's heaviness"
//       }
//     ],
//     activities: [
//       {
//         title: "Vigorous exercise",
//         description: "Running, high-intensity yoga, dancing",
//         reason: "Strong activity energizes Kapha's heavy nature"
//       },
//       {
//         title: "Sun salutations and standing poses",
//         description: "Dynamic, energizing practice",
//         reason: "Movement stimulates Kapha's sluggish energy"
//       },
//       {
//         title: "Daily movement",
//         description: "45-60 minutes of vigorous activity",
//         reason: "Regular exercise prevents Kapha stagnation"
//       }
//     ],
//     sleep: [
//       {
//         title: "Moderate sleep",
//         description: "10:00-10:30 PM bedtime, 6-7 hours",
//         reason: "Kapha needs less sleep; excess causes sluggishness"
//       },
//       {
//         title: "Stimulating spices before bed",
//         description: "Ginger tea (light)",
//         reason: "Prevents Kapha oversleeping"
//       },
//       {
//         title: "Cool bedroom",
//         description: "Well-ventilated, not too warm",
//         reason: "Coolness prevents Kapha lethargy"
//       }
//     ],
//     lifestyle: [
//       {
//         title: "Seek variety and challenge",
//         description: "New activities, social engagement",
//         reason: "Stimulation prevents Kapha's tendency toward inertia"
//       },
//       {
//         title: "Practice motivation",
//         description: "Set goals and pursue new projects",
//         reason: "Overcomes Kapha's sluggish tendencies"
//       }
//     ]
//   }
// };

// // Weather adjustments
// const weatherModifiers = {
//   Clear: {
//     temperature: 0,
//     impact: "neutral",
//     adjustment: (recs) => recs // No change for clear weather
//   },
//   Rainy: {
//     temperature: -5,
//     impact: "cool_and_wet",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Vata") {
//         return {
//           ...recs,
//           lifestyle: [
//             ...recs.lifestyle,
//             {
//               title: "Extra grounding during rainy season",
//               description: "More frequent warm oil massage",
//               reason: "Rainy weather increases Vata's dry and mobile qualities"
//             }
//           ]
//         };
//       } else if (prakriti === "Kapha") {
//         return {
//           ...recs,
//           activities: [
//             ...recs.activities.slice(0, -1),
//             {
//               title: "More vigorous exercise",
//               description: "60-90 minutes of intense activity",
//               reason: "Rainy weather increases Kapha's heaviness; extra activity needed"
//             }
//           ]
//         };
//       }
//       return recs;
//     }
//   },
//   Cloudy: {
//     temperature: -3,
//     impact: "cool",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Pitta") {
//         return recs; // Pitta benefits from clouds
//       }
//       return recs;
//     }
//   },
//   Stormy: {
//     temperature: -10,
//     impact: "very_cool_and_wet",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Vata") {
//         return {
//           ...recs,
//           diet: [
//             ...recs.diet,
//             {
//               title: "Extra warming foods during storms",
//               description: "Hot soups, warm milk, spiced tea",
//               reason: "Stormy weather severely aggravates Vata; warmth essential"
//             }
//           ]
//         };
//       }
//       return recs;
//     }
//   },
//   Windy: {
//     temperature: -8,
//     impact: "very_cool",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Vata") {
//         return {
//           ...recs,
//           morningRoutine: [
//             ...recs.morningRoutine,
//             {
//               title: "Double oil massage on windy days",
//               description: "Extra 10 minutes with warming oils",
//               reason: "Wind directly aggravates Vata's mobile, dry nature"
//             }
//           ]
//         };
//       }
//       return recs;
//     }
//   },
//   Snowy: {
//     temperature: -20,
//     impact: "very_cold_and_dry",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Vata") {
//         return {
//           ...recs,
//           lifestyle: [
//             ...recs.lifestyle,
//             {
//               title: "Increase all warming practices",
//               description: "More oil, warmer food, more rest",
//               reason: "Snow severely increases cold and dryness - Vata's weak points"
//             }
//           ]
//         };
//       } else if (prakriti === "Kapha") {
//         return {
//           ...recs,
//           activities: [
//             ...recs.activities,
//             {
//               title: "Stay active to generate internal heat",
//               description: "Maintain vigorous exercise",
//               reason: "Cold weather increases Kapha; exercise prevents stagnation"
//             }
//           ]
//         };
//       }
//       return recs;
//     }
//   },
//   Foggy: {
//     temperature: -5,
//     impact: "cool_and_damp",
//     adjustment: (recs, prakriti) => {
//       if (prakriti === "Vata") {
//         return {
//           ...recs,
//           diet: [
//             ...recs.diet.slice(0, 1),
//             {
//               title: "Lighter warm meals",
//               description: "Warm but not too heavy",
//               reason: "Fog increases Vata's lightness; balance with warmth not heaviness"
//             },
//             ...recs.diet.slice(1)
//           ]
//         };
//       } else if (prakriti === "Kapha") {
//         return {
//           ...recs,
//           activities: recs.activities.map((act) =>
//             act.title === "Daily movement"
//               ? {
//                   ...act,
//                   description: "45-60 minutes of vigorous activity in foggy conditions",
//                   reason: "Fog increases Kapha's heaviness; extra activity critical"
//                 }
//               : act
//           )
//         };
//       }
//       return recs;
//     }
//   }
// };

// // Temperature-based adjustments
// function adjustForTemperature(recommendations, temperature, prakriti) {
//   let adjusted = { ...recommendations };

//   if (temperature < 10) {
//     // Cold weather
//     if (prakriti === "Vata") {
//       adjusted.diet = [
//         ...adjusted.diet,
//         {
//           title: "Extra heating spices",
//           description: "Ginger, cumin, black pepper in every meal",
//           reason: "Cold weather compounds Vata's cold nature; warmth critical"
//         }
//       ];
//     } else if (prakriti === "Kapha") {
//       adjusted.activities = adjusted.activities.map((act) => {
//         if (act.title === "Vigorous exercise") {
//           return {
//             ...act,
//             description: "Running, high-intensity yoga, 60+ minutes in cold",
//             reason: "Cold weather increases Kapha heaviness; maximum activity needed"
//           };
//         }
//         return act;
//       });
//     }
//   } else if (temperature > 35) {
//     // Hot weather
//     if (prakriti === "Pitta") {
//       adjusted.lifestyle = [
//         ...adjusted.lifestyle,
//         {
//           title: "Cool down frequently",
//           description: "Take breaks in shade, cool water access",
//           reason: "Extreme heat compounds Pitta's fire nature; cooling essential"
//         }
//       ];
//     } else if (prakriti === "Vata") {
//       adjusted.diet = [
//         ...adjusted.diet,
//         {
//           title: "Increase hydration",
//           description: "Warm (not cold) water regularly throughout day",
//           reason: "Heat increases Vata dryness; hydration important"
//         }
//       ];
//     }
//   }

//   return adjusted;
// }

// // Humidity-based adjustments
// function adjustForHumidity(recommendations, humidity, prakriti) {
//   let adjusted = { ...recommendations };

//   if (humidity > 75) {
//     // Very humid
//     if (prakriti === "Kapha") {
//       adjusted.activities = adjusted.activities.map((act) => {
//         if (act.title === "Daily movement") {
//           return {
//             ...act,
//             description: "60-90 minutes of vigorous activity in humidity",
//             reason: "High humidity increases Kapha's dampness; extra exertion needed"
//           };
//         }
//         return act;
//       });
//     } else if (prakriti === "Pitta") {
//       adjusted.diet = [
//         ...adjusted.diet,
//         {
//           title: "Avoid heavy oily foods",
//           description: "Keep meals light despite humidity",
//           reason: "Humidity plus heavy food overheats Pitta"
//         }
//       ];
//     }
//   }

//   return adjusted;
// }

// // Main function to generate recommendations
// function getRecommendations(prakritiType, weather) {
//   let primaryPrakriti = prakritiType;

//   // Extract primary prakriti if it's a dual combination (e.g., "Vata-Pitta")
//   if (primaryPrakriti.includes("-")) {
//     primaryPrakriti = primaryPrakriti.split("-")[0];
//   }

//   // Start with base template
//   let recommendations = JSON.parse(JSON.stringify(prakritiTemplates[primaryPrakriti]));

//   // Apply weather condition adjustments
//   const condition = weather.condition || "Clear";
//   if (weatherModifiers[condition] && weatherModifiers[condition].adjustment) {
//     recommendations = weatherModifiers[condition].adjustment(recommendations, primaryPrakriti);
//   }

//   // Apply temperature adjustments
//   const temperature = weather.temperature || 25;
//   recommendations = adjustForTemperature(recommendations, temperature, primaryPrakriti);

//   // Apply humidity adjustments
//   const humidity = weather.humidity || 50;
//   recommendations = adjustForHumidity(recommendations, humidity, primaryPrakriti);

//   return {
//     morningRoutine: recommendations.morningRoutine,
//     diet: recommendations.diet,
//     activities: recommendations.activities,
//     sleep: recommendations.sleep,
//     lifestyle: recommendations.lifestyle,
//     reasoning: `These recommendations are tailored for ${primaryPrakriti} constitution in ${condition} weather (${temperature}°C, ${humidity}% humidity)`
//   };
// }

// module.exports = {
//   getRecommendations
// };

[
  {
    "prakriti": "Vata",
    "season": "Monsoon (Varsha)",
    "weather_characteristics": [
      "cold",
      "windy",
      "erratic"
    ],
    "vulnerable_condition": "Vata aggravation",
    "recommendations": {
      "diet": [
        "warm, cooked, nourishing, and slightly oily (unctuous) foods",
        "sweet, sour, and salty tastes"
      ],
      "lifestyle": [
        "routine",
        "daily warm oil massage (Abhyanga) using sesame oil",
        "grounding exercises like slow Yoga and walking"
      ],
      "avoid": [
        "raw salads",
        "cold drinks",
        "dry snacks (like popcorn or crackers)",
        "excessive fasting",
        "over-exertion",
        "exposure to cold winds"
      ]
    },
    "reasoning": {
      "principle": "Samanya-Vishesha Siddhanta (Principle of Similarity and Dissimilarity)",
      "dosha_effect": "warm qualities balance naturally dry and cold Vata"
    },
    "source_section": "3.3.1 Vata Prakriti"
  },
  {
    "prakriti": "Pitta",
    "season": "Autumn (Sharad) and Summer (Grishma)",
    "weather_characteristics": [
      "heat of the sun"
    ],
    "vulnerable_condition": "Pitta imbalance / internal fire of Pitta aggravated",
    "recommendations": {
      "diet": [
        "cooling, hydrating, and mildly spiced foods",
        "sweet, bitter, and astringent tastes"
      ],
      "lifestyle": [
        "cooling activities like swimming or walking in moonlight",
        "cooling oils like coconut or sandalwood"
      ],
      "avoid": [
        "spicy, excessively salty, sour, and fermented foods (like yogurt)",
        "direct exposure to the midday sun",
        "overworking",
        "high-stress situations"
      ]
    },
    "reasoning": {
      "principle": "Samanya-Vishesha Siddhanta (Principle of Similarity and Dissimilarity)",
      "dosha_effect": "cooling qualities balance naturally hot Pitta"
    },
    "source_section": "3.3.2 Pitta Prakriti"
  },
  {
    "prakriti": "Kapha",
    "season": "Spring (Vasanta)",
    "weather_characteristics": [
      "environmental heat melts the accumulated Kapha"
    ],
    "vulnerable_condition": "congestion, allergies, and lethargy",
    "recommendations": {
      "diet": [
        "warm, light, dry, and easily digestible foods",
        "pungent (spicy), bitter, and astringent tastes"
      ],
      "lifestyle": [
        "vigorous exercise",
        "dry brushing (Gharshana)",
        "massages using herbal powders (Udvartana)"
      ],
      "avoid": [
        "heavy dairy",
        "excessive sweets",
        "cold foods",
        "deep-fried items",
        "daytime sleeping"
      ]
    },
    "reasoning": {
      "principle": "Samanya-Vishesha Siddhanta (Principle of Similarity and Dissimilarity)",
      "dosha_effect": "warm, dry, and active qualities balance naturally cool and heavy Kapha"
    },
    "source_section": "3.3.3 Kapha Prakriti"
  },
  {
    "prakriti": "Vata",
    "season": "Summer (Grishma)",
    "weather_characteristics": [
      "intense dryness"
    ],
    "vulnerable_condition": "feelings of depletion",
    "recommendations": {
      "diet": null,
      "lifestyle": null,
      "avoid": [
        "staying up at night",
        "exercise",
        "excessive sexual activity"
      ]
    },
    "reasoning": {
      "principle": null,
      "dosha_effect": null
    },
    "source_section": "2.4. The Inter-Relationship"
  }
]