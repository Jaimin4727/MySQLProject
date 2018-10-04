/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbluser', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    middlename: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    nativedistrict: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    secretquestionid: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblsecretquestion',
        key: 'id'
      }
    },
    secretquestionanswer: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    pin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    isverified: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    section: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    taluka: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobileno: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ismobilenoprivate: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    leavingcertificate: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    modifieddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ref1name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref1designation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref1mobileno: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ref1section: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref1district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref2name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref2designation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref2mobileno: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ref2section: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ref2district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: 'U'
    },
    marital_status: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'tbluser'
  });
};
