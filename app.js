const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(cors());

const privateKey = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('csr.pem');


//Importing database
const sequelize = require("./backend/util/database");

//Importing routes
const signupRoutes = require("./backend/routes/signUpRoute");
const loginRoutes = require("./backend/routes/loginRoute");
const ExpenseRoutes = require("./backend/routes/ExpenseRoute");
const forgotpassRoutes = require("./backend/routes/forgotpassRoute");
const downloadRoutes = require("./backend/routes/downloadRoute");

//Importing Models
const userModel = require("./backend/models/userModel");
const expenseModel = require("./backend/models/expenseModel");
const orderModel = require("./backend/models/orderModel");
const urlModel = require("./backend/models/urlModel");
// const forgotpassModel = require("./backend/models/forgotpassModel");

//using bodyparser and path
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, 'frontend')));

//Using routes
app.use(signupRoutes);
app.use(loginRoutes);
app.use(ExpenseRoutes);
app.use(forgotpassRoutes);
app.use(downloadRoutes);

//Creating Relations Between Tables
userModel.hasMany(expenseModel);
expenseModel.belongsTo(userModel);

userModel.hasMany(orderModel);
orderModel.belongsTo(userModel);

userModel.hasMany(urlModel);
urlModel.belongsTo(userModel);

// userModel.hasMany(forgotpassModel);
// forgotpassModel.belongsTo(userModel);

//It syncs our data models to the database by creating appropriate tables & relations.
sequelize
  .sync()
  .then((result) => {
    // https.createServer({key: privateKey, cert: certificate}, app)
    // .listen(process.env.PORT || 3000);
    console.log("server started");
    app.listen(process.env.PORT || 3000)
  }) 
  .catch((err) => {
    console.log(err);
  });

// .sync({ force: true })
