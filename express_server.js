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

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.use('/urls', (req, res, next) => {
  const user_id = req.session.user_id;
  if (!user_id || !utility.checkUser(userDatabase, user_id)) {
    res.redirect("/login");
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = userDatabase[user_id];
  if (user) {
    templateVars = {
      user: user,
      urlDatabase: utility.getUrlsForUser(user.id, urlDatabase)
    }
    res.render("urls_index", templateVars);

  } else {
    res.redirect("/login");
  }
});

app.get('/urls/new', (req, res) => {
  const user = req.session["user_id"];
  let templateVars = {
    user: userDatabase[user]
  }

  if (user === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];

  if (urlObject) {
    const longURL = urlObject.longURL;
    res.redirect(longURL);
  } else {
    res.send("Error: URL does not exist");
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];

  //Checks whether or not user is logged in, before going to url page.
  if (!user) {
    res.send("Error: Login required");
  } else {
    if (urlObject) {

      console.log("Debug");

      if (urlObject.userID === user) {
        let templateVars = {
          user: userDatabase[user],
          shortURL: shortURL,
          longURL: urlObject.longURL
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
  const user_id = req.session["user_id"];

  if (user_id) {
    let urlObject = {};
    let longURL = req.body.longURL;

    urlObject.longURL = "https://" + longURL;
    urlObject.userID = user_id;

    if (!(Object.keys(urlDatabase).includes(shortUrl))) {
      urlDatabase[shortUrl] = urlObject;
    }
    res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
  } else {
    res.send("Error: Please login");
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const userID = req.session["user_id"];
  const urlObject = urlDatabase[shortUrl];

  if (urlObject.userID === userID) {
    delete urlDatabase[shortUrl];
    res.redirect('/urls');
  } else {
    res.send("Error: URL does not belong to you");
  }
})

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const user_id = req.session["user_id"];
  const urlObject = urlDatabase[shortUrl];

  if (user_id) {
    if (urlObject.userID === user_id) {
      urlDatabase[shortUrl].longURL = "https://" + req.body.updatedLongURL;
      res.redirect("/urls");
    } else {
      res.send("Error: URL does not belong to you, please log in.");
    }
  } else {
    res.send("Error: Log in required");
  }
});

app.post("/logout", (req, res) => {

  req.session['user_id'] = undefined;
  res.redirect('/');
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

      if (userObject && bcrypt.compareSync(password, userObject.password)) {
        user_id = userObject.id;
      }

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