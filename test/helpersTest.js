const { assert } = require('chai');

const utility = require('../utility.js');

//Test Database
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = utility.getUserByEmail(testUsers, "user@example.com");
    const input = user.id;
    const expectedOutput = "userRandomID";
    // Write your assert statement here

    assert.equal(input, expectedOutput);
  });

  it('returns undefined when passed with and non existing email', () => {
    const input = utility.getUserByEmail(testUsers, "fake@example.com");
    const expectedOutput = undefined;

    assert.equal(input, expectedOutput);
  });
});