module.exports = (sequelize, Sequelize) => {
    const UserProduct = sequelize.define("userProduct", {
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        product_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'products',
                key: 'id',
            },
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    });
//     UserProduct.belongsTo(sequelize.models.User, { foreignKey: 'user_id' });
//   UserProduct.belongsTo(sequelize.models.Product, { foreignKey: 'product_id' });
    return UserProduct;
};