//Tables
var express = require('express');
var router = express.Router();
var User = models.tbluser;
var UserRef = models.tbluserrefer;
var Question = models.tblsecretquestion;
var Support = models.tblsupport;
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
var fs = require('fs');
var Category = models.category;
//End of Tables

router.get('/Category', function (req, res) {

    Category.findAll().then(function (response) {
        res.json({
            success: true,
            message: "Record found",
            data: response
        });

    })

});

var obj = {
    "success": true,
    "message": "Record found",
    "data": [{
        "id": 1,
        "title": "Electronics",
        "parent_id": null
    }, {
        "id": 2,
        "title": "Laptops & PC",
        "parent_id": 1
    }, {
        "id": 3,
        "title": "Laptops",
        "parent_id": 2
    }, {
        "id": 4,
        "title": "PC",
        "parent_id": 2
    }, {
        "id": 5,
        "title": "Cameras & photo",
        "parent_id": 1
    }, {
        "id": 6,
        "title": "Camera",
        "parent_id": 5
    }, {
        "id": 7,
        "title": "Phones & Accessories",
        "parent_id": 1
    }, {
        "id": 8,
        "title": "Smartphones",
        "parent_id": 7
    }, {
        "id": 9,
        "title": "Android",
        "parent_id": 8
    }, {
        "id": 10,
        "title": "iOS",
        "parent_id": 8
    }, {
        "id": 11,
        "title": "Other Smartphones",
        "parent_id": 8
    }, {
        "id": 12,
        "title": "Batteries",
        "parent_id": 7
    }, {
        "id": 13,
        "title": "Headsets",
        "parent_id": 7
    }, {
        "id": 14,
        "title": "Screen Protectors",
        "parent_id": 7
    }]
};

function unflatten(array, parent, tree) {

    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : {
        id: null
    };

    var children = _.filter(array, function (child) {
        return child.parent_id == parent.id;
    });

    if (!_.isEmpty(children)) {
        if (parent.id == null) {
            tree = children;
        } else {
            // parent['level'] = children.length
            // parent['children'] = children
            parent.level = children.length
            parent.child = children
        }
        _.each(children, function (child) {
            unflatten(array, child)
        });
    }

    return tree;
}

tree = unflatten(obj.data);

console.log(JSON.stringify(tree));

//If parent_id is 0

var obj = {
    "success": true,
    "message": "Record found",
    "data": [{
        "id": 1,
        "title": "Electronics",
        "parent_id": 0
    }, {
        "id": 2,
        "title": "Laptops & PC",
        "parent_id": 1
    }, {
        "id": 3,
        "title": "Laptops",
        "parent_id": 2
    }, {
        "id": 4,
        "title": "PC",
        "parent_id": 2
    }, {
        "id": 5,
        "title": "Cameras & photo",
        "parent_id": 1
    }, {
        "id": 6,
        "title": "Camera",
        "parent_id": 5
    }, {
        "id": 7,
        "title": "Phones & Accessories",
        "parent_id": 1
    }, {
        "id": 8,
        "title": "Smartphones",
        "parent_id": 7
    }, {
        "id": 9,
        "title": "Android",
        "parent_id": 8
    }, {
        "id": 10,
        "title": "iOS",
        "parent_id": 8
    }, {
        "id": 11,
        "title": "Other Smartphones",
        "parent_id": 8
    }, {
        "id": 12,
        "title": "Batteries",
        "parent_id": 7
    }, {
        "id": 13,
        "title": "Headsets",
        "parent_id": 7
    }, {
        "id": 14,
        "title": "Screen Protectors",
        "parent_id": 7
    }]
};


function unflatten(array, parent, tree) {

    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : {
        id: 0
    };

    var children = _.filter(array, function (child) {
        return child.parent_id == parent.id;
    });

    if (!_.isEmpty(children)) {
        if (parent.id == 0) {
            tree = children;
        } else {
            // parent['level'] = children.length
            // parent['children'] = children
            parent.level = children.length
            parent.child = children
        }
        _.each(children, function (child) {
            unflatten(array, child)
        });
    }

    return tree;
}

tree = unflatten(obj.data);

console.log(JSON.stringify(tree));


router.get('/login', function (req, res) {
    var objParam = req.query;
    var Encryptpassword = jwt.encode(objParam.mobileno, process.env.SECRET);
    User.findOne({
        where: {
            mobileno: objParam.mobileno,
        }
    }).then(function (chkUserExistMobile) {
        if (chkUserExistMobile != null) {
            User.findOne({
                where: {
                    mobileno: objParam.mobileno,
                    pin: objParam.pin,
                    type: 'A',
                    isverified: 1
                }
            }).then(function (chkUserExistuuid) {
                if (chkUserExistuuid != null) {
                    res.json({
                        success: true,
                        token: Encryptpassword,
                        message: "Login Successfully",
                        data: chkUserExistuuid
                    });
                } else {
                    res.json({
                        success: false,
                        errortype: 2,
                        message: "Invalid PIN or Unverified user"
                    });
                }
            })
        } else {
            res.json({
                success: false,
                errortype: 1,
                message: "Invalid Mobile Number",
            });
        }
    });
});

router.get('/GetAllUsers', function (req, res) {
    var objParam = req.query;
    var objsearch = req.query.q;
    var pageNo = parseInt(objParam.pageNo);
    var size = parseInt(objParam.size);
    var query = {};
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1,
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                if (objParam.pageNo) {
                    if (pageNo < 0 || pageNo === 0) {
                        response = {
                            success: false,
                            "message": "invalid page number, should start with 1"
                        };
                        return res.json(response)
                    }
                } else {
                    response = {
                        success: false,
                        "message": "invalid page number, should start with 1"
                    };
                    return res.json(response);
                }

                query.skip = size * (pageNo - 1);
                query.limit = size;

                User.count({
                    where: {
                        [Op.or]: [{
                            name: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            lastname: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            designation: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            department: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            section: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            taluka: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            district: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }, {
                            mobileno: {
                                [Op.like]: '%' + objsearch + '%'
                            }
                        }]
                    }
                }).then(function (count) {
                    User.findAll({
                        where: {
                            [Op.or]: [{
                                name: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                lastname: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                designation: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                department: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                section: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                taluka: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                district: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }, {
                                mobileno: {
                                    [Op.like]: '%' + objsearch + '%'
                                }
                            }]
                        },
                        order: [
                            ['createddate', 'DESC']
                        ],
                        attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'email', 'nativedistrict', 'image', 'leavingcertificate', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'type', 'isverified', 'ref1name', 'ref1designation', 'ref1mobileno', 'ref1section', 'ref1district', 'ref2name', 'ref2designation', 'ref2mobileno', 'ref2section', 'ref2district', 'marital_status'],
                        offset: parseInt(query.skip),
                        limit: parseInt(query.limit)
                    }).then(function (response) {
                        if (response.length > 0) {
                            var totalPages = Math.ceil(count / size);
                            res.json({
                                success: true,
                                message: "Record found",
                                data: response,
                                page: totalPages
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "No Record found"
                            });
                        }
                    })
                });
            } else {
                res.json({
                    success: false,
                    message: "Invalid token or user"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
});

router.post('/CreateVerification', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                type: 'A'
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {

                User.findOne({
                    where: {
                        id: objUser.id,
                        mobileno: objUser.mobileno
                    }
                }).then(function (resUser) {

                    if (resUser) {

                        //for delete user when isverified is 0
                        if (objUser.isverified == 0) {

                            User.destroy({
                                where: {
                                    id: objUser.id,
                                    mobileno: objUser.mobileno
                                }
                            }).then(function (resDelete) {

                                if (resDelete) {
                                    Support.findOne().then(function (response) {
                                        message = "Respected Sir, your login for 'P-Connect' App can not be verified, please contact on " + response.email + " or " + response.mobileno + " for the solution.";

                                        request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + objUser.mobileno + "&message=" + message, function (err, body) {
                                            //console.log(body.body);
                                        });

                                        res.json({
                                            success: true,
                                            message: "Unverified User Deleted successfully",
                                        });

                                    });

                                } else {
                                    res.json({
                                        success: false,
                                        message: "Unverified User Deleted unsuccessfully",
                                    });
                                }

                            });

                        } else {

                            resUser.updateAttributes({
                                isverified: objUser.isverified,
                                type: objUser.type,
                                modifieddate: moment()
                            }).then(function (response) {

                                var message = "Respected Sir, your login for 'P-Connect' App has been verified, you can now use 'P-Connect' App";
                                request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + objUser.mobileno + "&message=" + message, function (err, body) {
                                    //console.log(body.body);
                                });

                                res.json({
                                    success: true,
                                    message: "User verification created successfully",
                                });
                            }).catch(function (error) {
                                res.json({
                                    success: false,
                                    message: error
                                });
                            })
                        }

                    } else {

                        res.json({
                            success: false,
                            message: "User not found"
                        });
                    }

                });

            } else {
                res.json({
                    success: false,
                    message: "Invalid token"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }

});

router.get('/GetSupport', function (req, res) {

    Support.findAll().then(function (response) {
        if (response.length > 0) {
            res.json({
                success: true,
                message: "Record found",
                data: response
            });
        } else {
            res.json({
                success: false,
                message: "No Record found"
            });
        }
    });

});

router.post('/UpdateSupport', jsonParser, function (req, res) {
    var token = req.headers.token;
    objSupport = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                type: 'A'
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {

                Support.findOne({
                    where: {
                        id: objSupport.id,
                    }
                }).then(function (resSupport) {

                    if (resSupport) {
                        resSupport.updateAttributes({
                            email: objSupport.email,
                            mobileno: objSupport.mobileno
                        }).then(function (response) {
                            res.json({
                                success: true,
                                message: "Support informaction updated successfully",
                            });
                        }).catch(function (error) {
                            res.json({
                                success: false,
                                message: error
                            });
                        })
                    } else {
                        res.json({
                            success: false,
                            message: "No Record found"
                        });
                    }
                });

            } else {
                res.json({
                    success: false,
                    message: "Invalid token"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }

});

router.get('/GetAllUserRefers', function (req, res) {
    var objParam = req.query;
    var pageNo = parseInt(objParam.pageNo);
    var size = parseInt(objParam.size);
    var query = {};
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1,
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                if (objParam.pageNo) {
                    if (pageNo < 0 || pageNo === 0) {
                        response = {
                            success: false,
                            "message": "invalid page number, should start with 1"
                        };
                        return res.json(response)
                    }
                } else {
                    response = {
                        success: false,
                        "message": "invalid page number, should start with 1"
                    };
                    return res.json(response);
                }

                query.skip = size * (pageNo - 1);
                query.limit = size;

                UserRef.belongsTo(User, {
                    foreignKey: {
                        name: 'userid',
                    }
                });

                UserRef.count({}).then(function (count) {
                    UserRef.findAll({
                        include: [{
                            model: User,
                            attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'email', 'image', 'leavingcertificate', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'type'],
                        }],
                        order: [
                            ['createddate', 'DESC']
                        ],
                        attributes: ['id', 'userid', 'name', 'middlename', 'lastname', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'isverified'],
                        offset: parseInt(query.skip),
                        limit: parseInt(query.limit)
                    }).then(function (response) {
                        if (response.length > 0) {
                            var totalPages = Math.ceil(count / size);
                            res.json({
                                success: true,
                                message: "Record found",
                                data: response,
                                page: totalPages
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "No Record found"
                            });
                        }
                    })
                });
            } else {
                res.json({
                    success: false,
                    message: "Invalid token or user"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
});

router.get('/GetAllUnverifiedUsers', function (req, res) {
    var objParam = req.query;
    var pageNo = parseInt(objParam.pageNo);
    var size = parseInt(objParam.size);
    var query = {};
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1,
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                if (objParam.pageNo) {
                    if (pageNo < 0 || pageNo === 0) {
                        response = {
                            success: false,
                            "message": "invalid page number, should start with 1"
                        };
                        return res.json(response)
                    }
                } else {
                    response = {
                        success: false,
                        "message": "invalid page number, should start with 1"
                    };
                    return res.json(response);
                }

                query.skip = size * (pageNo - 1);
                query.limit = size;

                User.count({
                    where: {
                        isverified: 0
                    }
                }).then(function (count) {
                    User.findAll({
                        where: {
                            isverified: 0
                        },
                        order: [
                            ['createddate', 'DESC']
                        ],
                        attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'email', 'nativedistrict', 'image', 'leavingcertificate', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'type', 'isverified', 'ref1name', 'ref1designation', 'ref1mobileno', 'ref1section', 'ref1district', 'ref2name', 'ref2designation', 'ref2mobileno', 'ref2section', 'ref2district', 'marital_status'],
                        offset: parseInt(query.skip),
                        limit: parseInt(query.limit)
                    }).then(function (response) {
                        if (response.length > 0) {
                            var totalPages = Math.ceil(count / size);
                            res.json({
                                success: true,
                                message: "Record found",
                                data: response,
                                page: totalPages
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "No Record found"
                            });
                        }
                    })
                });
            } else {
                res.json({
                    success: false,
                    message: "Invalid token or user"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }
});

router.post('/CreateReferVerification', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                type: 'A'
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {

                if (objUser.id != '' && objUser.id != null && objUser.id != undefined) {

                    if (objUser.mobileno != '' && objUser.mobileno != null && objUser.mobileno != undefined) {

                        UserRef.findOne({
                            where: {
                                id: objUser.id,
                                mobileno: objUser.mobileno
                            }
                        }).then(function (resRefUser) {

                            if (resRefUser) {

                                //for delete user when isverified is 0
                                if (objUser.isverified == 0) {

                                    UserRef.destroy({
                                        where: {
                                            id: objUser.id,
                                            mobileno: objUser.mobileno
                                        }
                                    }).then(function (resDelete) {
                                        if (resDelete) {
                                            res.json({
                                                success: true,
                                                message: "Unverified Refer User Deleted successfully"
                                            });

                                        } else {
                                            res.json({
                                                success: false,
                                                message: "Unverified Refer User Deleted unsuccessfully"
                                            });

                                        }
                                    });

                                } else {

                                    resRefUser.updateAttributes({
                                        isverified: objUser.isverified,
                                        modifieddate: moment()
                                    }).then(function (response) {
                                        res.json({
                                            success: true,
                                            message: "Refer User verification created successfully",
                                        });
                                    }).catch(function (error) {
                                        res.json({
                                            success: false,
                                            message: error
                                        });
                                    });
                                }

                            } else {
                                res.json({
                                    success: false,
                                    message: "Refer User not found"
                                });
                            }

                        });

                    } else {
                        res.json({
                            success: false,
                            message: "Refer mobileno not found"
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        message: "Refer Id not found"
                    });
                }

            } else {
                res.json({
                    success: false,
                    message: "Invalid token"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }

});

router.post('/UpdateUserByAdmin', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                id: objUser.id
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                var token = jwt.encode(objUser.mobileno, process.env.SECRET);

                var date = moment(objUser.dob);

                if (date.isValid()) {
                    chkUserExist.updateAttributes({
                        name: objUser.name,
                        middlename: objUser.middlename,
                        lastname: objUser.lastname,
                        dob: objUser.dob,
                        nativedistrict: objUser.nativedistrict,
                        designation: objUser.designation,
                        department: objUser.department,
                        section: objUser.section,
                        taluka: objUser.taluka,
                        district: objUser.district,
                        mobileno: objUser.mobileno,
                        ismobilenoprivate: objUser.ismobilenoprivate,
                        email: objUser.email,
                        marital_status: objUser.marital_status,
                        token: token,
                        modifieddate: moment()
                    }).then(function (response) {
                        res.json({
                            success: true,
                            message: "User updated Successfully...",
                            token: token
                        });
                    }).catch(function (error) {
                        res.json({
                            success: false,
                            message: error
                        });
                    })

                } else {
                    res.json({
                        success: false,
                        message: "Please select valid date of brith"
                    });
                }

            } else {
                res.json({
                    success: false,
                    message: "Invalid token"
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: "Invalid token"
        });
    }

});




module.exports = router