//Importing Sequelize Class and Object
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

//Creating product modal(modal of the object)
const Url = sequelize.define("urls", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  url: Sequelize.TEXT,
  userId: Sequelize.INTEGER,
});

module.exports = Url;