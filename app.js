const express = require("express");
const sequelize = require("./util/database");
const mainRouter = require("./routes/index");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportConfig = require("./helper/passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
const expHbs = require("express-handlebars");
const models = require("./models/index");
const authMiddleware = require("./middleware/is-auth");
const app = express();
app.use(cookieParser());
app.use(passport.initialize());
passportConfig(passport);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

let fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const postImg = file.fieldname + "-" + Date.now();
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const hbs = expHbs.create({
  extname: "hbs",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    not: function (value) {
      return !value;
    },
    and: function (a, b) {
      return a && b;
    },
  },
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine("hbs", hbs.engine);

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(authMiddleware);
app.use("/", mainRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ status: status, message: message, data: data });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("database connection established successfully");
    await sequelize.sync();
    console.log("database synchronization completed");
    app.listen(5000, () => {
      console.log("server listening on http://localhost:5000");
    });
  } catch (error) {
    console.log("Not able to connect to database", error.message);
  }
})();
