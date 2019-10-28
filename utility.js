const alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890";

const generateRandomString = function() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result = result.concat(alphanumeric[Math.floor(Math.random() * alphanumeric.length)]);
  }
  return result;
}

module.exports = { generateRandomString }