const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const path = require("path");

const FoodItem = require("../models/foodItem");
const Categories = require("../models/categories");

let menu = null;

router.get("/", async (req, res) => {
  try {
    keys = [];
    values = [];
    for (let [key, value] of Object.entries(menu)) {
      keys.push(key.trim());
      values.push(value);
    }
    let categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
    categoryObj = categoryObj["mainCategory"];
    let prices = [];
    keys.map((key) => {
      categoryObj.map((category) => {
        // console.log(category.name.replace(/\s+/g, ""));
        // console.log(key.replace(/\s+/g, ""));
        if (category.name.replace(/\s+/g, "") == key.replace(/\s+/g, ""))
          prices.push(category.price);
      });
    });

    console.log(keys);
    console.log(prices);
    res.render("style3/lunch", { keys: keys, values: values, prices: prices });
  } catch (error) {
    // res.redirect("lunch/dashboard");
    res.send(error.message);
  }
});

router.get("/dashboard", async (req, res) => {
  const categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
  const foodItem = await FoodItem.find({});
  res.render("lunch-dashboard", {
    categoryObj: categoryObj,
    foodItem: foodItem,
  });
});

router.post("/createMenu", async (req, res) => {
  console.log(req.body);
  menu = req.body;
  res.redirect("/lunch");
});

router.get("/download", async (req, res) => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:3000/lunch");

    page.setViewport({ width: 1920, height: 1080 });

    let img = "Lunch-" + getDate() + ".png";

    await page.screenshot({
      path: img,
      clip: {
        x: 0,
        y: 0,
        width: 1344,
        height: 1080,
      },
    });

    // await page.screenshot({ path: img });
    res.download(path.join(__dirname, "../" + img));

    await browser.close();
  })();
});
function getDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const formattedToday = dd + "-" + mm + "-" + yyyy;
  return formattedToday;
}

module.exports = router;
