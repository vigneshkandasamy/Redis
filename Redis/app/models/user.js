const { UserProduct } = require('./index');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      }
    });
    // User.hasMany(sequelize.models.Product, { through: UserProduct });
    return User;
  };
  