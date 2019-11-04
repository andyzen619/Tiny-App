const express = require("express");
const bodyParser = require("body-parser");
const utility = require("./utility");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const PORT = 8080; // default port 8080
const app = express();
const data = require("./data");
const userDatabase = data.userDatabase;
const urlDatabase = data.urlDatabase;
const date = new Date();

//Sets all middleware-----------------------------------------------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

//Redirects non registered users to log in page
app.use('/urls', (req, res, next) => {
  const userId = req.session.userId;
  if (!userId || !utility.checkUser(userDatabase, userId)) {
    res.redirect("/login");
  } else {
    next();
  }
});


//Get methods-------------------------------------------------------------
//Redirects to login if not logged in and urls if other wise
app.get("/", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Shows user url's if logged, login page otherwise
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = userDatabase[userId];
  if (user) {
    const templateVars = {
      user: user,
      urlDatabase: utility.getUrlsForUser(user.id, urlDatabase)
    };

    res.render("urls_index", templateVars);

  } else {
    res.redirect("/login");
  }
});

//Creates url page if logged in, login page if other wise
app.get('/urls/new', (req, res) => {
  const user = req.session["userId"];
  let templateVars = {
    user: userDatabase[user]
  };

  if (user === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Redirects to actual url when give short URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  const session = req.session;
  const user = session["userId"];
  const uniqueUserVisitsArray = session[shortURL];
  const timeStamp = utility.getTimeStamp();

  if (urlObject) {
    const longURL = urlObject.longURL;

    //Adds current user to unique visitors cookie
    if (!uniqueUserVisitsArray.includes(user) && user) {
      uniqueUserVisitsArray.push(user);
    }

    //Increments visits counter by 1
    urlObject.visits = urlObject.visits + 1;

    res.redirect(longURL);
  } else {
    res.send("Error: URL does not exist");
  }
});

//Directs to URL page if correct user, error message if otherwise
app.get('/urls/:shortURL', (req, res) => {
  const session = req.session;
  const user = session["userId"];
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];


  //Checks whether or not user is logged in, before going to url page.
  if (!user) {
    res.send("Error: Login required");
  } else {
    if (urlObject) {
      //Checks url belongs to current user
      if (urlObject.userID === user) {
        const uniqueUserVisits = session[shortURL].length;
        let templateVars = {
          user: userDatabase[user],
          shortURL: shortURL,
          longURL: urlObject.longURL,
          visits: urlObject.visits,
          uniqueUserVisits: uniqueUserVisits

        };

        res.render("urls_show", templateVars);
      } else {
        res.send("Error: URL does not belong to you");
      }
    } else {
      res.send("Error: short URL does not exist");
    }
  }
});

//Directs to register user
app.get('/register', (req, res) => {
  const user = req.session.userId;
  let templateVars = {

    user: userDatabase[user]
  };

  res.render("user_register", templateVars);
});

//Directs to login user
app.get('/login', (req, res) => {
  const user = req.session["userId"];
  let templateVars = {
    user: userDatabase[user]
  };

  res.render('user_login', templateVars);
});

//Post methods-----------------------------------------------------------------
//Creating new Tiny URLS
app.post("/urls", (req, res) => {
  let shortUrl = utility.generateRandomString();
  const session = req.session;
  const userId = session["userId"];

  if (userId) {
    let urlObject = {};
    let longURL = req.body.longURL;

    //Collect the correct data for the data object
    urlObject.longURL = "https://" + longURL;
    urlObject.userID = userId;
    urlObject.visits = 0;

    //Initializes url cookie to keep track of unique visitors
    session[shortUrl] = [];

    console.log(session);

    //Adds urlObject if it does not exists in database
    if (!(Object.keys(urlDatabase).includes(shortUrl))) {
      urlDatabase[shortUrl] = urlObject;
    }
    res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
  } else {
    res.send("Error: Please login");
  }
});

//Deletes URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const userID = req.session["userId"];
  const urlObject = urlDatabase[shortUrl];

  if (urlObject) {
    if (urlObject && urlObject.userID === userID) {
      delete urlDatabase[shortUrl];
      res.redirect('/urls');
    } else {
      res.send("Error: URL does not belong to you");
    }
  } else {
    res.send("Error: URL does not exist");
  }
});

//Updates URL objects
app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const userId = req.session["userId"];
  const urlObject = urlDatabase[shortUrl];

  //Validates current user before updating url object
  if (userId) {
    if (urlObject.userID === userId) {
      urlDatabase[shortUrl].longURL = "https://" + req.body.updatedLongURL;
      res.redirect("/urls");
    } else {
      res.send("Error: URL does not belong to you, please log in.");
    }
  } else {
    res.send("Error: Log in required");
  }
});

//Logs out user
app.post("/logout", (req, res) => {

  req.session['userId'] = undefined;
  res.redirect('/');
});

//registers user
app.post("/register", (req, res) => {
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //Checks input format
  if (email === "" || password === "") {
    res.send("Please use valid email \n Status code: 400");
  } else {

    //Adds new user to database
    if (!utility.isExistingUser(userDatabase, email)) {
      const account = {
        id: utility.generateRandomID(userDatabase),
        email: email,
        password: hashedPassword
      };

      userDatabase[account.id] = account;
      req.session.userId = account.id;
      res.redirect("/urls");
    } else {
      res.send("Error: Email already exists");
    }
  }
});

//Authenticates user
app.post("/login", (req, res) => {
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;

  //Checks input format
  if (email === "" || password === "") {
    res.send("Please use valid email \n Status code: 400");
  } else {
    //Checks for existing user
    if (utility.isExistingUser(userDatabase, email)) {
      let userId = 0;
      const userObject = utility.getUserByEmail(userDatabase, email);

      //obtain user object if password validates
      if (userObject && bcrypt.compareSync(password, userObject.password)) {
        userId = userObject.id;
      }

      //Give errors message password does not validate
      if (userId === 0) {
        res.send("Incorrect username or password, please try again.");
      } else {
        const user = userDatabase[userId];
        req.session['userId'] = user.id;
        res.redirect("/urls");
      }

    } else {
      res.send("User does not exist, please create an account.");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});