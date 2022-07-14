const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
//require("./database/config");
mongoose.connect(
  "mongodb+srv://prateek1057:prateek123sharma@prateek.n3moh6s.mongodb.net/e-comm?retryWrites=true&w=majority"
);
const model = require("./database/User");
const Product = require("./database/Product");
require("dotenv").config();
const Jwt = require("jsonwebtoken");
const jwtKey = "prateek";
const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  let data = new model(req.body);
  data = await data.save();
  data = data.toObject();
  delete data.password;
  if (data) {
    Jwt.sign({ data }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) res.send("Something Went Wrong");
      else res.send({ data, token: token });
    });
  }
});

app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let result = await model.findOne(req.body).select("-password");
    if (result) {
      Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) res.send({ result: "Something Went Wrong" });
        else res.send({ result, token: token });
        // res.send(result);
      });
    } else res.send({ result: "No User Found" });
  } else res.send({ result: "No User Found" });
});

app.post("/add-prod", verifyToken, async (req, res) => {
  let data = new Product(req.body);
  data = await data.save();
  res.send(data);
});

app.get("/prod-list/:userId", verifyToken, async (req, res) => {
  let data = await Product.find(req.params);
  if (data.length > 0) res.send(data);
  else res.send({ data: "No Product Found" });
});

app.delete("/prod-delete/:_id", verifyToken, async (req, res) => {
  let data = await Product.deleteOne(req.params);
  res.send(data);
});

app.get("/prod-get/:_id", verifyToken, async (req, res) => {
  let data = await Product.find(req.params);
  if (data) res.send(data);
  else res.send({ data: "No Record Found" });
});

app.put("/prod-update/:_id", verifyToken, async (req, res) => {
  let data = await Product.updateOne(req.params, { $set: req.body });
  res.send(data);
});

app.get("/search/:key", verifyToken, async (req, res) => {
  let data = await Product.find({
    $or: [{ name: { $regex: req.params.key } }],
  });
  if (data) res.send(data);
  else res.send({ data: "No Record Found" });
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    token = token.split(" ")[1];
    //console.log(token);
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) res.status(401).send("Please provile a valid token");
      else next();
    });
  } else res.status(403).send("Please Provide token with header");
}


app.listen(process.env.PORT || 4000);
