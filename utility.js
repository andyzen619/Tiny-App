const alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890";
const bcrypt = require("bcrypt");

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

// const getExistingUser = function(userDatabase, email, password) {

//   console.log("Inputed password");
//   console.log(password);
//   console.log(userDatabase[user].password);

//   if (!isExistingUser(userDatabase, email)) {
//     return 0;
//   }

//   const users = Object.keys(userDatabase);

//   for (user of users) {

//     const hashedUserPassword = bcrypt.compareSync(password, userDatabase[user].password);

//     console.log(hashedUserPassword);

//     if (userDatabase[user].email === email && hashedUserPassword) {
//       return user;
//     }
//   }

//   return 0;
// }

const getUserByEmail = function(userDatabase, email) {
  let result;
  Object.keys(userDatabase).forEach((key) => {
    const userObject = userDatabase[key];

    if (userObject.email === email) {
      result = userObject;
    }
  });
  return result;
}


/**
 * Returns a list of url objects that's userID matches the parameter userID
 * @param {} id 
 * @param {*} urlDatabase 
 */
const getUrlsForUser = function(id, urlDatabase) {
  //Loop through url object in url database
  //Match id with object.id
  //If match: appaned object to result list.

  let userURLsObject = {};
  Object.keys(urlDatabase).forEach((key) => {
    let urlObject = urlDatabase[key];

    if (urlObject.userID === id) {
      userURLsObject[key] = urlObject.longURL;
    }
  });
  return userURLsObject;
}
module.exports = {
  generateRandomString,
  generateRandomID,
  isExistingUser,
  getUserByEmail,
  getUrlsForUser
}