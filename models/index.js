const fs = require("fs");
const path = require('path');
const sequelize= require("../util/database");
const models={}

function readModels(){
  const modelsDir = __dirname;
  fs.readdirSync(modelsDir).forEach((file) => {
    if (file !== 'index.js' && file.endsWith('.js')) {
      const model = require(path.join(modelsDir, file)); 
      if (model.associate) {
        model.associate(sequelize.models);
      }
      models[model.name]=model;
    }
  });
  return models;
}


module.exports = readModels();