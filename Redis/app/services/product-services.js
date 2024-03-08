const db = require("../models");
const Product = db.product;
const UserProduct = db.UserProduct;
const User = db.user;

const redis = require("redis");
const redisClient = redis.createClient();
const { promisify } = require("util");
const flushallAsync = promisify(redisClient.flushDb).bind(redisClient);
redisClient.connect();

// Add new product
exports.create = (req, res) => {
  validateRequest(req);

  const product = {
    name: req.body.name,
    price: req.body.price,
    isDeleted: req.body.isDeleted ? req.body.isDeleted : false,
  };

  Product.create(product)
    .then((data) => {
      clearRedisCache();
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error when adding a product!",
      });
    });
};

// Find all products
exports.findAll = async (req, res) => {
  console.log('input');
  const getList = await redisClient.get("products");

  if (getList) {
    res.send(JSON.parse(getList));
  } else {
    Product.findAll({ where: { isDeleted: false } })
      .then((data) => {
        redisClient.setEx("products", 3600, JSON.stringify(data));
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error when getting all products!",
        });
      });
  }
};

// Find product by id
exports.findOne = async (req, res) => {
  console.log('req.userId', req.userId);
  validateRequest(req);

  const id = req.body.id;
  const getProduct = await redisClient.get(`product:${id}`);

  if (getProduct) {
    res.send(JSON.parse(getProduct));
  } else {
    Product.findByPk(id)
      .then((data) => {
        if (data) {
          redisClient.setEx(`product:${id}`, 3600, JSON.stringify(data));
          res.send(data);
        } else {
          res.status(404).send({
            message: "Product not found!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error when getting product by product id: " + id,
        });
      });
  }
};

// Update product by id
exports.update = async (req, res) => {
  try {
    validateRequest(req);

    const id = req.body.id;
    const [num] = await Product.update(req.body, {
      where: { id: id },
    });
    console.log('num', num);
    if (num == 1) {
      await clearRedisCache();
      res.send({
        message: "Product successfully updated.",
      });
    } else {
      res.send({
        message: "Update process failed!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating product: " + err.message,
    });
  }
};

// Delete product by product id
exports.delete = (req, res) => {
  validateRequest(req);

  const id = req.body.id;
  Product.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        clearRedisCache(id);
        res.send({
          message: "Product successfully deleted.",
        });
      } else {
        res.send({
          message: "Delete process failed!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Couldn't delete product with product id: " + id,
      });
    });
};

// assign product to particular user
exports.assign = (req, res) => {
  validateRequest(req);

  const userProduct = {
    user_id: req.body.userId,
    product_id: req.body.productId,
  };
  UserProduct.create(userProduct)
    .then((data) => {
      clearRedisCache();
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error when adding a product!",
      });
    });
};

// get products by user
exports.getUserProducts = async (req, res) => {
  validateRequest(req);
  UserProduct.belongsTo(Product, { foreignKey: 'product_id' });
  UserProduct.belongsTo(User, { foreignKey: 'user_id' });
  const getList = await redisClient.get(`products:${req.userId}`);

  if (getList) {
    res.send(JSON.parse(getList));
  } else {
    const userProductQuery = {
      where: {
        user_id: req.userId,
      },
      include: [{ model: Product, }]
    };
    const productList = [];
    UserProduct.findAll(userProductQuery)
      .then((data) => {
        data.forEach((item) => {
          productList.push(item.product)
        })
        redisClient.setEx(`products:${req.userId}`, 3600, JSON.stringify(productList));
        res.send(productList);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error when adding a product!",
        });
      });
  }
};

function validateRequest(req) {
  if (!req.body) {
    res.status(400).send({
      message: "Request is empty!",
    });
  }
}

async function clearRedisCache() {
  try {
    await redisClient.flushAll();
    console.log("Redis cache cleared");
  } catch (err) {
    console.error("Error clearing Redis cache:", err);
  }
}
