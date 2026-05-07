let latestSensorReading = null;
let sensorReadingTimestamp = null;

function setLatestSensorReading(data) {
  latestSensorReading = data;
  sensorReadingTimestamp = new Date();
}

function getLatestSensorReading() {
  return latestSensorReading;
}

function getLatestSensorReadingTimestamp() {
  return sensorReadingTimestamp;
}

module.exports = {
  setLatestSensorReading,
  getLatestSensorReading,
  getLatestSensorReadingTimestamp,
};
