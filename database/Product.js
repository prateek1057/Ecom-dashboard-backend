const mongoose = require("mongoose");
const prodSchema = new mongoose.Schema({
  name: String,
  price: String,
  category: String,
  userId: String,
  company: String,
});
const Product = mongoose.model("products", prodSchema);

module.exports = Product;
