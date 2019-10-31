//Aids in generating random string
const alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890";
const bcrypt = require("bcrypt");

/**
 * Returns a random string to be used for unique short URLS
 */
const generateRandomString = function() {
  let result = "";

  for (let i = 0; i < 6; i++) {
    result = result.concat(alphanumeric[Math.floor(Math.random() * alphanumeric.length)]);
  }
  return result;
}

/**
 * Generates a random ID for user object.
 * @param {*} userDatabase determines the userID
 */
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

/**
 * Returns the user object according to email
 * @param {*} userDatabase 
 * @param {*} email 
 */
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

  //returns 
  Object.keys(urlDatabase).forEach((key) => {
    let urlObject = urlDatabase[key];

    if (urlObject.userID === id) {
      userURLsObject[key] = urlObject.longURL;
    }
  });
  return userURLsObject;
}

/**
 * Returns true if user_id exists in userDatabase.
 * @param {*} userDatabase 
 * @param {*} user_id 
 */
const checkUser = function(userDatabase, user_id) {
  const users = Object.keys(userDatabase);

  if (!users.includes(user_id)) {
    return false;
  }
  return true;
}

module.exports = {
  generateRandomString,
  generateRandomID,
  isExistingUser,
  getUserByEmail,
  getUrlsForUser,
  checkUser
}