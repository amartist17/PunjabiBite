const express = require("express");
const app = express();
const mongoose = require("mongoose");
const FoodItem = require("./models/foodItem");
const Categories = require("./models/categories");
const puppeteer = require("puppeteer");
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("static"));

let timing = null;
let foodObject = null;

let heading = null;
let subMenuItems = null;

app.get("/", async (req, res) => {
  let categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
  categoryObj = categoryObj["mainCategory"];
  console.log(foodObject);

  for (item in foodObject) {
    if (item.includes("_default")) {
      let _default = foodObject[item] + " ,rice ,salad ,etc.";
      _default = _default.replace(",", " ,");
      foodObject[item.replace("_default", "")].push(_default);
      delete foodObject[item];
    }
  }
  // console.log(foodObject);

  res.render("style1/main_menu", {
    foodObject: foodObject,
    categoryObj: categoryObj,
    timing: timing,
  });
});

app.get("/subMenu", async (req, res) => {
  let itemObj = await FoodItem.find({});

  res.render("style1/sub_menu", {
    heading: heading,
    subMenuItems: subMenuItems,
    itemObj: itemObj,
  });
});

app.get("/edit", async (req, res) => {
  const foodItems = await FoodItem.find({});
  let categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
  categoryObj = categoryObj["mainCategory"];
  res.render("edit", { foodItems: foodItems, categoryObj: categoryObj });
});

app.post("/update-fooditems", async (req, res) => {
  console.log(req.body);
  if (req.body.delete == "true") {
    FoodItem.findByIdAndDelete(req.body._id, (err, docs) => {
      if (err) {
        console.log(err);
      }
    });
  }
  for (var key in req.body) {
    if (req.body[key] == "") {
      delete req.body[key];
    }
  }
  FoodItem.findOneAndUpdate(
    { _id: req.body._id },
    req.body,
    null,
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("changed");
      }
    }
  );
  res.redirect("/edit");
});

app.post("/update-category", async (req, res) => {
  try {
    console.log(req.body);
    let categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
    categoryObj = categoryObj["mainCategory"];
    let obj = categoryObj.filter((c) => c._id == req.body._id);
    for (var key in req.body) {
      if (req.body[key] == "" || req.body[key] == "0") {
        req.body[key] = obj[0][key];
      }
    }

    Categories.updateOne(
      { "mainCategory._id": req.body._id },
      {
        $set: {
          "mainCategory.$.name": req.body.name,
          "mainCategory.$.price": req.body.price,
          "mainCategory.$.foodType": req.body.foodType,
        },
      },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      }
    );

    res.redirect("/edit");
  } catch (err) {
    res.send(err.message);
  }
});
app.get("/download-main", async (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto("https://punjabibite.herokuapp.com/");

      page.setViewport({ width: 1536, height: 721 });
      // page.setViewport({ width: 1836, height: 1221 });

      await page.screenshot({ path: "Menu.png" });
      res.download(path.join(__dirname, "Menu.png"));

      await browser.close();
    })();
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/download-sub", async (req, res) => {
  (async () => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://punjabibite.herokuapp.com/subMenu");

    page.setViewport({ width: 1536, height: 721 });
    // page.setViewport({ width: 1836, height: 1221 });

    await page.screenshot({
      path: "submenu.png",
      clip: {
        x: 0,
        y: 0,
        width: 460,
        height: 760,
      },
    });
    res.download(path.join(__dirname, "submenu.png"));

    await browser.close();
  })();
});

app.get("/dashboard", async (req, res) => {
  const categoryObj = await Categories.findOne({ sort: { created_at: -1 } });
  const foodItem = await FoodItem.find({});
  res.render("dashboard-home", {
    categoryObj: categoryObj,
    foodItem: foodItem,
  });
});

app.post("/createMenu", (req, res) => {
  timing = req.body.type;

  delete req.body.type;
  foodObject = req.body;

  res.redirect("/");
});
app.post("/createSubMenu", (req, res) => {
  heading = req.body.heading;
  subMenuItems = req.body.items;
  // delete req.body.type;
  console.log(req.body);
  // foodObject = req.body;
  res.redirect("/subMenu");
});

app.post("/addCategory", async (req, res) => {
  let type = req.body.category_type;
  let name = req.body.category_name;
  let price = req.body.category_price;
  let foodType = req.body.foodType;

  if (type == "mainCategory") {
    Categories.findOneAndUpdate(
      { sort: { created_at: -1 } },
      {
        $push: {
          mainCategory: {
            name: name,
            foodType: foodType,
            price: price,
          },
        },
      },
      (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
  } else {
    Categories.findOneAndUpdate(
      { sort: { created_at: -1 } },
      { $push: { timeCategory: [name] } },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
  }
});

app.post("/addItem", async (req, res) => {
  try {
    const newItem = await FoodItem.create(req.body);
    // console.log(req.body);
    // res.send("Success");
    res.redirect("/dashboard");
  } catch (err) {
    res.send(err);
  }
});

const breakfastRoute = require("./route/breakfastRoute");
app.use("/breakfast", breakfastRoute);

const lunchRoute = require("./route/lunchRoute");
app.use("/lunch", lunchRoute);

module.exports = app;

// app.post("/addCat", async (req, res) => {
//   console.log(req.body);
//   const Cat = await Categories.create(req.body);
// });
