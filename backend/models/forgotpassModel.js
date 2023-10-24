//Importing Sequelize Class and Object
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

//Creating product modal(modal of the object)
const ForgotPass = sequelize.define("forgotpasswords", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  userid: Sequelize.INTEGER,
  isactive: Sequelize.BOOLEAN,
});

module.exports = ForgotPass;
