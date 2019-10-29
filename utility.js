const alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890";

const generateRandomString = function() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result = result.concat(alphanumeric[Math.floor(Math.random() * alphanumeric.length)]);
  }
  return result;
}

const generateRandomID = function(userDatabase) {

  const numberOfUsers = Object.keys(userDatabase).length;

  return generateRandomString().concat(numberOfUsers);
}

module.exports = {
  generateRandomString,
  generateRandomID
}