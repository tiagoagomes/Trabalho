const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Person = sequelize.define(
  "Person",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cep: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "person",
    timestamps: false,
  }
);

module.exports = Person;
