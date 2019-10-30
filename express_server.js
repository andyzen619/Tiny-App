const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const utility = require("./utility");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "as45ff1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "awerw12" }
};

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

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  //const user = req.cookies["user_id"];
  const user = req.session.user_id;
  templateVars = {
    user: userDatabase[user],
    urlDatabase: utility.getUrlsForUser(user, urlDatabase)
  }

  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = req.session["user_id"];
  let templateVars = {
    user: userDatabase[user]
  }

  if (user === 'undefined') {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  const longURL = urlObject.longURL;

  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  let templateVars = {
    user: userDatabase[user],
    shortURL: shortURL,
    longURL: urlObject.longURL
      // ... any other vars
  };
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  const user = req.session.user_id;
  let templateVars = {

    user: userDatabase[user]
  }
  res.render("user_register", templateVars);
});

app.get('/login', (req, res) => {
  const user = req.session["user_id"];
  let templateVars = {
    user: userDatabase[user]
  }

  res.render('user_login', templateVars);
});

//Creating new Tiny URLS
app.post("/urls", (req, res) => {
  let shortUrl = utility.generateRandomString();
  const userID = req.session["user_id"];
  let urlObject = {};
  let longURL = req.body.longURL;

  urlObject.longURL = "https://" + longURL;
  urlObject.userID = userID;

  if (!(Object.keys(urlDatabase).includes(shortUrl))) {
    urlDatabase[shortUrl] = urlObject;
  }
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const userID = req.session["user_id"];
  const urlObject = urlDatabase[shortUrl];

  if (urlObject.userID === userID) {
    delete urlDatabase[shortUrl];
  }
  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const userID = req.session["user_id"];
  const urlObject = urlDatabase[shortUrl];

  if (urlObject.userID === userID) {
    urlDatabase[shortUrl].longURL = req.body.updatedLongURL;
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  req.session['user_id'] = undefined;
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.send("Please use valid email \n Status code: 400");
  } else {

    if (!utility.isExistingUser(userDatabase, email)) {
      const account = {
        id: utility.generateRandomID(userDatabase),
        email: email,
        password: hashedPassword
      }
      userDatabase[account.id] = account;

      req.session.user_id = account.id;
      //res.cookie('user_id', account.id);
      res.redirect("/urls");
    } else {
      res.send("Email already exists. Status code: 400");
    }
  }
});

app.post("/login", (req, res) => {
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;

  if (email === "" || password === "") {
    res.send("Please use valid email \n Status code: 400");
  } else {
    if (utility.isExistingUser(userDatabase, email)) {
      let user_id = 0;
      const userObject = utility.getUserByEmail(userDatabase, email);

      console.log(userObject);


      if (userObject && bcrypt.compareSync(password, userObject.password)) {
        user_id = userObject.id;
      }
      console.log("user_id: " + user_id);

      if (user_id === 0) {
        res.send("Incorrect username or password, please try again.");
      } else {
        const user = userDatabase[user_id];
        req.session['user_id'] = user.id;
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