const sequelize = require('./db');
const User = require('./User');
const Order = require('./Order');
const Comment = require('./Comment');
const Rating = require('./Rating');
const Session = require('./Session');

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Order,
  Comment,
  Rating,
  Session,
  AdminProduct: require('./AdminProduct'),
  SeedProduct: require('./SeedProduct'),
  EmailVerification: require('./EmailVerification'),
  Config: require('./Config'),
  DeletedId: require('./DeletedId'),
  TrashItem: require('./TrashItem')
};
