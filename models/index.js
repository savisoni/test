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
  // module.exports=models;
  return models;
}
console.log("models=====>",models);


module.exports = readModels();