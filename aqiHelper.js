const AQIdatabase = [
  {
    id: 0,
    category: 'Good',
    dataCategory: 'good',
    aqiUS: {
      low: 0,
      high: 50
    },
    rawPM2_5: {
      low: 0.0,
      high: 12.0
    }
  },
  {
    id: 1,
    category: 'Moderate',
    dataCategory: 'moderate',
    aqiUS: {
      low: 51,
      high: 100
    },
    rawPM2_5: {
      low: 12.1,
      high: 35.4
    }
  },
  {
    id: 2,
    category: 'Unhealthy for<br/>Sensitive Groups',
    dataCategory: 'unhealthy-sensitive',
    aqiUS: {
      low: 101,
      high: 150
    },
    rawPM2_5: {
      low: 35.5,
      high: 55.4
    }
  },
  {
    id: 3,
    category: 'Unhealthy',
    dataCategory: 'unhealthy',
    aqiUS: {
      low: 151,
      high: 200
    },
    rawPM2_5: {
      low: 55.5,
      high: 150.4
    }
  },
  {
    id: 4,
    category: 'Very Unhealthy',
    dataCategory: 'very-unhealthy',
    aqiUS: {
      low: 201,
      high: 300
    },
    rawPM2_5: {
      low: 150.5,
      high: 250.4
    }
  },
  {
    id: 5,
    category: 'Hazardous',
    dataCategory: 'hazardous',
    aqiUS: {
      low: 300,
      high: 500
    },
    rawPM2_5: {
      low: 250.5,
      high: 550.5
    }
  },
];

// Helper function to categorize AQI
const linearPieceWise = (aqiHigh, aqiLow, concenHigh, concenLow, val) => {
  return parseInt(
    ((aqiHigh - aqiLow) / (concenHigh - concenLow)) * (val - concenLow) + aqiLow
  );
}
// Returns AQI number value
const convertToAQI = (val) => {
  if (isNaN(val) || val == null)
    return {
      aqi: null,
      aqi_category_index: null
    };

  for (let i = 0; i < AQIdatabase.length; i++) {
    const category = AQIdatabase[i];
    if (val >= category.rawPM2_5.low && val <= category.rawPM2_5.high) {
      return {
        aqi: linearPieceWise(category.aqiUS.high, category.aqiUS.low, category.rawPM2_5.high, category.rawPM2_5.low, val),
        aqi_category_index: category.id
      }
    }
  };
}

// Determine the status of the sensor
const SensorStatus = {
  active: "Active",
  temporaryOffline: "Temporarily offline",
  offline: "Offline"
};

const SensorStatusCriteria = [
  {
    name: SensorStatus.active,
    cutoffInHours: {
      low: 0,
      high: 2
    }
  },
  {
    name: SensorStatus.temporaryOffline,
    cutoffInHours: {
      low: 2,
      high: 6
    }
  },
  {
    name: SensorStatus.offline,
    cutoffInHours: {
      low: 6,
      high: Infinity
    }
  }
];

const calculateSensorStatus = (lastSeenInHours) => {
  for (let i = 0; i < SensorStatusCriteria.length; i++) {
    const category = SensorStatusCriteria[i];
    if (category.cutoffInHours.low < lastSeenInHours && lastSeenInHours <= category.cutoffInHours.high) {
      return category.name;
    }
  }
  return undefined;
}
