const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const path = require("path");

const Breakfast = require("../models/breakfast");
const FoodItem = require("../models/foodItem");
const Categories = require("../models/categories");

let menuItems = null;
let price = null;
let subMenuItems = null;
let heading = null;

router.get("/", async (req, res) => {
  try {
    res.render("style2/breakfast", {
      items: menuItems.slice(0, 8),
      price: price,
    });
  } catch (error) {
    res.redirect("breakfast/dashboard");
  }
});

router.get("/subMenu", async (req, res) => {
  try {
    let itemObj = await FoodItem.find({});

    res.render("style2/sub_menu", {
      heading: heading,
      subMenuItems: subMenuItems,
      itemObj: itemObj,
    });
  } catch (error) {
    // res.redirect("breakfast/dashboard");
  }
});

router.get("/dashboard", async (req, res) => {
  let items = await Breakfast.find({});
  items = items.map((item) => item.name);

  const categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
  const foodItem = await FoodItem.find({});

  res.render("breakfast-dashboard", {
    items: items,
    categoryObj: categoryObj,
    foodItem: foodItem,
  });
});

router.post("/addItem", async (req, res) => {
  try {
    let newItem = await Breakfast.create(req.body);
    res.redirect("/breakfast/dashboard");
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/delete", async (req, res) => {
  console.log(req.body.items.trim());
  let item = await Breakfast.findOne({ name: req.body.items.trim() });
  Breakfast.findByIdAndDelete(item, (err, docs) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/breakfast/dashboard");
});

router.post("/createBreakfast", async (req, res) => {
  menuItems = req.body.items;
  price = req.body.price;
  console.log(req.body);
  res.redirect("/breakfast");
});
router.post("/createSubMenu", async (req, res) => {
  heading = req.body.heading;
  subMenuItems = req.body.items;
  console.log(req.body);
  res.redirect("/breakfast/subMenu");
});

router.get("/download", async (req, res) => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:3000/breakfast");

    page.setViewport({ width: 1920, height: 1080 });

    let img = "Breakfast-" + getDate() + ".png";

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
