const path = require("path");

const strConst = require("../constants/string_const");

const getPathOfImage = (imageKey, userId) => {
  if (imageKey == undefined || userId == undefined) {
    return null;
  }
  return path.join(process.cwd(), `/uploads/${userId}/`, `${imageKey}.png`);
};

const getPathOfImageAsUrl = (imageKey, userId) => {
  if (imageKey == undefined || userId == undefined) {
    return null;
  }
  return strConst.baseUrl + path.join(`/uploads/${userId}/`, `${imageKey}.png`);
};

module.exports = { getPathOfImage, getPathOfImageAsUrl };
