// Device state management module
// Separate from server.js to avoid circular dependencies

let motorStatus = 0;
let pumpStatus = 0;

function setMotorStatus(status) {
  motorStatus = status ? 1 : 0;
}

function setPumpStatus(status) {
  pumpStatus = status ? 1 : 0;
}

function getMotorStatus() {
  return motorStatus;
}

function getPumpStatus() {
  return pumpStatus;
}

module.exports = {
  setMotorStatus,
  setPumpStatus,
  getMotorStatus,
  getPumpStatus
};
