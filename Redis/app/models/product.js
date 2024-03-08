const { UserProduct } = require('./index');

module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("product", {
    name: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.STRING
    },
    isDeleted: {
      type: Sequelize.BOOLEAN
    }
  });
  // Product.belongsTo(sequelize.models.User, { through: UserProduct });
  return Product;
};
