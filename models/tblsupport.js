/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsupport', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobileno: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'tblsupport'
  });
};
