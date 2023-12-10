document.addEventListener('DOMContentLoaded', function () {

  const url = 'https://api.citiesair.com/current/nyuad';

  fetchAirQuality();

  // Async function to fetch air quality
  async function fetchAirQuality() {
    // Expired if the last updated exceeds x mins
    const lastUpdatedThreshold = 60;

    let measurements = [];
    let smallestLastUpdate;

    let response = await fetch(url);

    if (!response.ok) {
      showErrorView();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let raw_data = await response.json();

    // Iterate through the raw_data array and append calculated AQI and category
    const now = new Date();
    const container = document.getElementsByClassName('aqi-items')[0];

    for (let i = 0; i < raw_data.length; i++) {
      const data = raw_data[i];

      if (!data.current) break;

      const timestampObject = new Date(data.current.timestamp);
      const lastUpdate = Math.round((now - timestampObject) / 1000 / 60); // last update minute(s) ago
      if (lastUpdate < smallestLastUpdate || smallestLastUpdate == null) smallestLastUpdate = lastUpdate;

      const sensorStatus = calculateSensorStatus(lastUpdate / 60); // argument given in hour

      const aqiObject = convertToAQI(data.current["pm2.5"]);
      if (!aqiObject) break;

      const aqiCategory = AQIdatabase[aqiObject.aqi_category_index];

      // If sensor status is not active, then data category will be inactive
      const dataCategory = (sensorStatus !== SensorStatus.active) ? 'inactive' : AQIdatabase[aqiObject.aqi_category_index].dataCategory;

      const thisSensorHTML = getSensorMeasurementsHTML({
        location: data.sensor.location_long,
        aqi: sensorStatus === SensorStatus.offline ? '--' : aqiObject.aqi,
        category: sensorStatus === SensorStatus.offline ? '--' : aqiCategory.category,
        dataCategory: dataCategory,
        sensorStatus: sensorStatus,
        lastUpdate: lastUpdate
      })

      container.insertAdjacentHTML('beforeend', thisSensorHTML);
    }

    showValidDataView(smallestLastUpdate);
  }

  const calloutWrapperElem = document.querySelector('.aqi-embed-content');

  const showValidDataView = (smallestLastUpdate) => {
    calloutWrapperElem.classList.remove('hidden');

    document.querySelector('.aqi-loader').style.display = 'none';
    document.querySelector('.aqi-data-wrapper').style.display = 'block';

    document.querySelector("#last-updated").classList.remove('hidden');
    document.querySelector("#last-updated").innerHTML = "<div><b>Last updated:</b> " + smallestLastUpdate + "m ago </div>";
  }

  const showErrorView = () => {
    if (isCalloutOnPageBody()) {
      calloutWrapperElem.classList.remove('hidden');
      document.querySelector('.aqi-error-wrapper').style.display = 'block';
    } else {
      calloutWrapperElem.classList.add('hidden');
    }

    document.querySelector('.aqi-loader').style.display = 'none';
    document.querySelector("#last-updated").classList.add('hidden');
  }

  const isCalloutOnPageBody = () => {
    return calloutWrapperElem.classList.contains('is-on-page-body');
  }

  const getSensorMeasurementsHTML = ({ location, aqi, category, dataCategory, sensorStatus, lastUpdate }) => {
    let offlineText = '';
    switch (sensorStatus) {
      case SensorStatus.temporaryOffline:
        offlineText = `${SensorStatus.temporaryOffline} for ${Math.round(lastUpdate / 60)}h`;
        break;
      case SensorStatus.offline:
        offlineText = `Sensor Offline`
        break;
      default:
        break;
    }

    const sensorStatusHTML = sensorStatus !== SensorStatus.active ?
      `<h5 class="sensor-status" data-category=${dataCategory}>${offlineText}</h5>`
      : '';

    return `<div class="wp-block-column sensor-container hidden">
      <div class="has-text-align-center">
        <h3 class="location" data-category=${dataCategory}>${location}</h3>
        <h1 class="aqi-index" data-category=${dataCategory}>${aqi}</h1>
        <h3 class="aqi-category" data-category=${dataCategory}>${category}</h3>
        ${sensorStatusHTML}
      </div>
    </div>`;
  }

});