const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bancotrab", "root", "BVEABXN2W!Nv", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
