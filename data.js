//Stores url's
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "as45ff1",
    visits: 0,
    uniqueUserVisits: 0,
    visitHistory: {}
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "awerw12",
    visits: 0,
    uniqueUserVisits: 0,
    visitHistory: {
      "as45ff1": "2019-11-3 21:24:13",

    }
  }
};

//Stores user's
const userDatabase = {
  "as45ff1": {
    id: "as45ff1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "awerw12": {
    id: "awerw12",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

module.exports = {
  urlDatabase,
  userDatabase
};