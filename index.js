// CJS
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
//Express
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { log } = require("console");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware to parse JSON bodies

// Connect to MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "ashishsQl@13",
});

// get random user data
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Home Route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

// Show Route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

// Edit Route for : username
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // user infor
      // console.log(result);
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

// Update (DB) Route for : username
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("WRONG password");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

// Route for : Add new user
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user", (req, res) => {
  let { id, username, email, password } = req.body;
  let q = `SELECT * FROM user WHERE id = ?, OR username = ?, OR email = ?,`;
  let data = [id, username, email];
  try {
    connection.query(q, data, (err, result) => {
      if (err) throw err;

      let user = result[0];
      if (result.length === 0) {
        let insertQ = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
        let data = [id, username, email, password];
        connection.query(insertQ, data, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      } else {
        res.send("User already exists!");
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

// Route for : Delete user

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error in DB");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("User deleted successfully");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

// Express route to handle requests
app.listen("8080", () => {
  console.log("Server is running on port 8080");
});

