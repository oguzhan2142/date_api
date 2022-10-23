const generateRoomId = (userId, otherUserId) => {
  const idList = [userId, otherUserId];
  idList.sort();
  return idList.join("-");
};

module.exports = { generateRoomId };
