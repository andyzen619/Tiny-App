const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const utility = require("./utility");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
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

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  templateVars = {
    email: req.cookies["email"],
    urlDatabase: urlDatabase
  }

  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    email: req.cookies["email"],
  }

  res.render("urls_new", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {

  let templateVars = {
    email: req.cookies["email"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
      // ... any other vars
  };
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {

  let templateVars = {
    //TODO: Pass in user database or fetch user from cookies
    email: req.cookies["email"]
  }
  res.render("user_register", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortUrl = utility.generateRandomString();

  if (!(Object.keys(urlDatabase).includes(shortUrl))) {
    let longURL = req.body.longURL;

    urlDatabase[shortUrl] = "https://" + longURL;
  }

  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  delete urlDatabase[shortUrl];

  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  if (urlDatabase[shortUrl] !== null) {
    urlDatabase[shortUrl] = req.body.updatedLongURL;
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;

  res.cookie('email', email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  res.cookie('email', undefined);
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  console.log(email + " " + password);

  if (email === "" || password === "") {
    res.send("Please use valid email \n Status code: 400");
  } else {

    if (!utility.isExistingUser(userDatabase, email)) {
      const account = {
        id: utility.generateRandomID(userDatabase),
        email: email,
        passowrd: password
      }
      userDatabase[account.id] = account;

      res.cookie('user_id', account.id);
      res.redirect("/urls");
    } else {
      res.send("Email already exists. Status code: 400");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});