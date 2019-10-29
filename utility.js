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

const isExistingUser = function(userDatabase, email) {
  const users = Object.keys(userDatabase);

  for (user of users) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
}

const getExistingUser = function(userDatabase, email, password) {
  if (!isExistingUser(userDatabase, email)) {
    return 0;
  }

  const users = Object.keys(userDatabase);

  for (user of users) {

    if (userDatabase[user].email === email && userDatabase[user].password === password) {
      return user;
    }
  }

  console.log("incorrect password");
  return 0;
}
module.exports = {
  generateRandomString,
  generateRandomID,
  isExistingUser,
  getExistingUser
}