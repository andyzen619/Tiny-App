const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const utility = require("./utility");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {

  res.render("urls_index", {
    urlDatabase: urlDatabase
  });
});

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  })
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortUrl = utility.generateRandomString();

  if (!(Object.keys(urlDatabase).includes(shortUrl))) {
    let longURL = req.body.longURL;

    urlDatabase[shortUrl] = "https://" + longURL;
  }
  console.log(urlDatabase);
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  delete urlDatabase[shortUrl];
  console.log(urlDatabase);
  res.redirect('/urls');
})

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  if (urlDatabase[shortUrl] !== null) {
    urlDatabase[shortUrl] = req.body.updatedLongURL;
  }
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});