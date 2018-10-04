//Tables
var express = require('express');
var router = express.Router();
var User = models.tbluser;
var UserRef = models.tbluserrefer;
var Question = models.tblsecretquestion;
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'pconnect17@gmail.com',
        pass: 'P@Connect'
    }
}));

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'hywh4ysit',
    api_key: '737132977464575',
    api_secret: 'XkL-X_yDS1r7Seebv5_LTh1zL44'
});

//End of Tables

router.post('/register', jsonParser, function (req, res) {
    objUserReg = req.body;
    objUserReg.token = jwt.encode(objUserReg.mobileno, process.env.SECRET);

    User.findOne({
        where: {
            mobileno: objUserReg.mobileno
        }
    }).then(function (chkUserExist) {
        if (chkUserExist != null) {
            res.json({
                success: false,
                message: "User is already Exist..."
            });
        } else {
            User.findOne({
                where: {
                    // [Op.or]: [{
                    //     name: objUserReg.name
                    // }]
                    mobileno: objUserReg.mobileno,
                    name: objUserReg.name,
                }
            }).then(function (chkMobileExist) {
                if (chkMobileExist != null) {
                    res.json({
                        success: false,
                        message: "Name is already Exist..."
                    });
                } else {
                    // objUserReg.isverified = 0;
                    objUserReg.createddate = moment();
                    console.log("----------");
                    console.log(objUserReg.dob);
                    var date = moment(objUserReg.dob);

                    if (date.isValid()) {
                        User.create(objUserReg).then(function (resUserReg) {

                            UserRef.destroy({
                                where: {
                                    mobileno: objUserReg.mobileno
                                }
                            }).then(function (response) {
                                res.json({
                                    success: true,
                                    message: "User Registered Successfully...",
                                    userid: resUserReg.id,
                                    token: objUserReg.token
                                });
                            });

                        }).catch(function (error) {
                            console.log(error);
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
                }
            })
        }
    })
});

function GetUserNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();
}

router.post('/uploadImage', function (req, res) {

    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/UserCertificate';
    var FileName = [];
    var lstUser = [];
    var path = '';

    //file upload path
    form.parse(req, function (err, fields, files) {

    });


    form.on('fileBegin', function (name, file) {
        console.log("File name: " + file.name);
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        path = file.path;
        FileName.push(NewName + ext);
        lstUser.push(name);

        //modify file path
    });
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var UserId = parseInt(lstUser[i]);
                User.findOne({
                    where: {
                        id: UserId
                    }
                }).then(function (response) {
                    if (response != null) {
                        if (response.image != '' && response.image != null) {
                            var imageName = response.image.substring(response.image.lastIndexOf('/') + 1, response.image.length - 4);
                            cloudinary.v2.uploader.destroy(imageName, {
                                    invalidate: true
                                },
                                function (error, result) {});
                        };

                        cloudinary.uploader.upload(path, function (result) {
                            fs.unlink(path);
                            response.updateAttributes({
                                image: result.secure_url
                            }).then(function (resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({
                                        success: true,
                                        message: "Images Uploaded Successfully...",
                                        data: result.secure_url
                                    });
                                } else {
                                    uploader(i + 1);
                                };
                            })
                        });
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({
                success: false,
                message: "Please Select atleast One File..."
            });
        }

    });
});

router.post('/uploadCertificate', function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/UserCertificate';
    var FileName = [];
    var lstUser = [];
    var imageUrl = '';
    var path = '';

    //file upload path
    form.parse(req, function (err, fields, files) {

    });
    form.on('fileBegin', function (name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        path = file.path;
        FileName.push(NewName + ext);
        lstUser.push(name);

        //modify file path
    });
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var UserId = parseInt(lstUser[i]);

                User.findOne({
                    where: {
                        id: UserId
                    }
                }).then(function (response) {
                    if (response != null) {
                        if (response.leavingcertificate != '' && response.leavingcertificate != null) {
                            var imageName = response.leavingcertificate.substring(response.leavingcertificate.lastIndexOf('/') + 1, response.leavingcertificate.length - 4);
                            cloudinary.v2.uploader.destroy(imageName, {
                                    invalidate: true
                                },
                                function (error, result) {});
                        };

                        cloudinary.uploader.upload(path, function (result) {
                            fs.unlink(path);
                            response.updateAttributes({
                                leavingcertificate: result.secure_url
                            }).then(function (resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({
                                        success: true,
                                        message: "Leaving Certificate Uploaded Successfully...",
                                        data: result.secure_url
                                    });
                                } else {
                                    uploader(i + 1);
                                };
                            })
                        });
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({
                success: false,
                message: "Please Select atleast One File"
            });
        }
    });
});

router.post('/createrefer', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1
            },
            attributes: ['id', 'name'],
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                objUser.userid = chkUserExist.id;
                objUser.createddate = moment();
                UserRef.create(objUser).then(function (response) {

                    var mobileno = objUser.mobileno;
                    var message = "Sir, You have been referred by Mr." + chkUserExist.name + " for P-Connect App, please download and signup to use P-Connect APP: http://bit.ly/2sQ5ySe";

                    request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + mobileno + "&message=" + message, function (err, body) {
                        console.log("referred User SMS");
                        console.log(body.body);
                    });

                    User.findAll({
                        where: {
                            isverified: 1,
                            type: 'A'
                        },
                        attributes: ['mobileno'],
                    }).then(function (UserExist) {
                        var str = '';
                        var message12 = "Sir, Mr. " + objUser.name + " has been referred by Mr. " + chkUserExist.name + " for P-Connect App, please approve his Application";
                        if (UserExist.length > 1) {
                            for (var i = 0; i < UserExist.length - 1; i++) {
                                str = UserExist[i].mobileno + ',' + UserExist[i + 1].mobileno;
                            }
                        } else {
                            str = UserExist[0].mobileno;
                        }
                        request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + str + "&message=" + message12, function (err, body) {
                            console.log("Admin User SMS");
                            console.log(body.body);
                        });

                    });

                    res.json({
                        success: true,
                        message: "Refer User Registered Successfully...",
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
                    uuid: objParam.uuid,
                }
            }).then(function (chkUserExistuuid) {
                if (chkUserExistuuid != null) {
                    res.json({
                        success: true,
                        token: Encryptpassword,
                        message: "Login Successfully...",
                        data: chkUserExistuuid
                    });
                } else {
                    res.json({
                        success: false,
                        errortype: 2,
                        message: "Mobile number and device is not matched"
                    });
                }
            })
        } else {
            UserRef.findOne({
                where: {
                    mobileno: objParam.mobileno,
                }
            }).then(function (chkReferUserExist) {
                var objRefer = '';
                if (chkReferUserExist != null) {
                    objRefer = chkReferUserExist;
                }
                res.json({
                    success: false,
                    errortype: 1,
                    message: "Mobile number is not registered",
                    referuser: objRefer
                });
            });
        }
    });
});

router.post('/changedevice', jsonParser, function (req, res) {
    objUserChangeDevice = req.body
    var Encryptpassword = jwt.encode(objUserChangeDevice.mobileno, process.env.SECRET);
    User.findOne({
        where: {
            mobileno: objUserChangeDevice.mobileno,
            pin: objUserChangeDevice.pin
        }
    }).then(function (response) {
        if (response != null) {

            if (objUserChangeDevice.uuid != null && objUserChangeDevice.uuid != '' && objUserChangeDevice.uuid != undefined) {
                response.updateAttributes({
                    uuid: objUserChangeDevice.uuid
                }).then(function (resUpdate) {
                    res.json({
                        success: true,
                        token: Encryptpassword,
                        message: "Device change successfully...",
                        data: response
                    });
                })
            } else {
                res.json({
                    success: false,
                    message: "Device not found",
                });
            }

        } else {
            res.json({
                success: false,
                message: "Invaild PIN"
                //data: response
            });
        }
    })
});

router.post('/update', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno
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

router.post('/CreatePIN', jsonParser, function (req, res) {
    var token = req.headers.token;
    objUser = req.body;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                if (objUser.pin != null && objUser.pin != '' && objUser.pin != undefined) {
                    chkUserExist.updateAttributes({
                        pin: objUser.pin,
                    }).then(function (response) {
                        res.json({
                            success: true,
                            message: "PIN created Successfully...",
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
                        message: "PIN not available"
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

router.get('/SearchByField', function (req, res) {
    var objSearch = req.query;
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                var search = {};
                search[Op.and] = [];
                var obj = new Object();
                obj['isverified'] = {
                    [Op.eq]: 1
                };
                // obj['type'] = {
                //     [Op.eq]: 'U'
                // };
                search[Op.and].push(obj);

                if (!_.isEmpty(objSearch)) {
                    //search[Op.or] = [];
                    if (objSearch.name) {
                        var obj = new Object();
                        obj['name'] = {
                            [Op.like]: '%' + objSearch.name + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.lastname) {
                        var obj = new Object();
                        obj['lastname'] = {
                            [Op.like]: '%' + objSearch.lastname + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.designation) {
                        var obj = new Object();
                        obj['designation'] = {
                            [Op.like]: '%' + objSearch.designation + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.department) {
                        var obj = new Object();
                        obj['department'] = {
                            [Op.like]: '%' + objSearch.department + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.section) {
                        var obj = new Object();
                        obj['section'] = {
                            [Op.like]: '%' + objSearch.section + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.taluka) {
                        var obj = new Object();
                        obj['taluka'] = {
                            [Op.like]: '%' + objSearch.taluka + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.district) {
                        var obj = new Object();
                        obj['district'] = {
                            [Op.like]: '%' + objSearch.district + '%'
                        };
                        search[Op.and].push(obj);
                    }
                    if (objSearch.mobileno) {
                        var obj = new Object();
                        obj['mobileno'] = {
                            [Op.like]: '%' + objSearch.mobileno + '%'
                        };
                        search[Op.and].push(obj);
                    }
                } else {
                    res.json({
                        success: false,
                        message: "Search Parameter required"
                    });
                    return true;

                }

                User.findAll({
                    where: search,
                    attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'nativedistrict', 'ismobilenoprivate', 'email', 'image', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'marital_status']
                }).then(function (response) {
                    if (response != null) {
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

router.get('/Search', function (req, res) {
    var objsearch = req.query.q;
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno,
                isverified: 1
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {
                User.findAll({
                    where: {
                        [Op.and]: [{
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
                        }, {
                            isverified: 1
                            //type: 'U'
                        }],
                    },
                    attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'nativedistrict', 'ismobilenoprivate', 'email', 'image', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'marital_status']
                }).then(function (response) {
                    if (response != null) {
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
                })
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

router.get('/GetUserById', function (req, res) {
    var objParam = req.query;
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno
                //isverified: 1,
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                if (objParam.id != null && objParam.id != undefined && objParam.id != '') {
                    User.findOne({
                        where: {
                            id: objParam.id
                            //isverified: 1
                        },
                        //attributes: ['id', 'name', 'middlename', 'lastname', 'dob', 'email', 'image', 'leavingcertificate', 'designation', 'department', 'section', 'taluka', 'district', 'mobileno', 'nativedistrict', 'isverified', 'ismobilenoprivate']
                    }).then(function (response) {
                        if (response != null) {
                            res.json({
                                success: true,
                                message: "Record found...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "No Record found"
                            });
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "User id not found"
                    });
                }
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

function getClientIp(req) {
    var ipAddress;
    // The request may be forwarded from local web server.
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};

router.get('/GetAllQuestions', function (req, res) {

    //console.log("---------------");
    //console.log(getClientIp(req));

    Question.findAll({
        attributes: ['id', 'question']
    }).then(function (response) {
        if (response.length > 0) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json({
                success: false,
                message: "No Record found"
            });
        }
    })
});

router.get('/SendSMS', function (req, res) {
    var objUser = req.query;
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        User.findOne({
            where: {
                mobileno: mobileno
                //isverified: 1,
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                var message = "Sir, You have new P-Connect Contact request from Mr." + objUser.name + " (" + objUser.from + "). The reason for contact is " + objUser.reason;

                request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + objUser.to + "&message=" + message, function (err, body) {
                    console.log("SendSMS User SMS");
                    console.log(body.body);
                });

                res.json({
                    success: true,
                    message: "Your Contact request sent successfully",
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

router.post('/ContactPerson', function (req, res) {
    var objUser = req.body;
    var token = req.headers.token;
    if (token) {
        var mobileno = jwt.decode(token, process.env.SECRET);
        console.log(mobileno);
        User.findOne({
            where: {
                mobileno: mobileno
            }
        }).then(function (chkUserExistMobile) {
            if (chkUserExistMobile != null) {

                var message = "Mr." + objUser.reqFistname + " " + objUser.reqLastname + " has been trying to reach you, Details of his/her contact reason is sent to you on your e-mail, plz. do the needful.";
                var message1 = "Res." + objUser.reqFistname1 + " " + objUser.reqLastname1 + " ,your request to contact has been sent to Mr. " + objUser.reqFistname + " " + objUser.reqLastname + ", he/she might contact you";

                request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + objUser.reqto1 + "&message=" + message, function (err, body) {
                    console.log("SendSMS User SMS");
                    console.log(body.body);
                });

                request("http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=pconnect17&password=8460637673&sendername=PCONNT&mobileno=" + objUser.reqto + "&message=" + message1, function (err, body) {
                    console.log("SendSMS User SMS");
                    console.log(body.body);
                });

                var html = `<p>Respected ` + objUser.reqFistname1 + " " + objUser.reqLastname1 + `,</p>
                <p>&nbsp;</p>
                <p>Thank you for using P-Connect APP. As per our purpose of this APP, we have maintained your privacy and we have not shared your mobile number with other users as promised.</p>
                <p>Accordingly, without disclosing your mobile number, we have facilitated other users to contact you. At this moment, Res.` + objUser.reqFistname + " " + objUser.reqLastname + `, Designation, needs your help and he/she has mentioned reason to contact you, Details are as follows:</p>
                <p>Name :` + objUser.reqFistname + " " + objUser.reqLastname + `</p>
                <p>Designation :` + objUser.reqDesignation + `</p>
                <p>Office :` + objUser.reqOffice + `</p>
                <p>Mobile No:` + objUser.reqto + `</p>
                <p>E-Mail :` + objUser.reqemail + `</p>
                <p>Reason to contact you :` + objUser.reason + `</p>
                <p>&nbsp;</p>
                <p>If you find the reason provided by Res. ` + objUser.reqFistname + " " + objUser.reqLastname + ` reasonable enough, you may contact him/her and extend your generous help to our community member.</p>
                <p>&nbsp;</p>
                <p>Thanks &amp; Regards,</p>
                <p>P-Connect</p>`;

                var mailOptions = {
                    from: 'pconnect17@gmail.com',
                    to: objUser.reqemail1,
                    subject: 'Contact Request From P-Connect',
                    html: html
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                });

                res.json({
                    success: true,
                    message: "Your Contact request sent successfully",
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



router.post('/ForgotPIN', function (req, res) {
    objUser = req.body;
    var Encryptpassword = jwt.encode(objUser.mobileno, process.env.SECRET);
    User.findOne({
        where: {
            mobileno: objUser.mobileno,
        }
    }).then(function (chkUserExistMobile) {
        if (chkUserExistMobile != null) {
            User.findOne({
                where: {
                    secretquestionid: objUser.secretquestionid,
                    secretquestionanswer: objUser.secretquestionanswer,
                }
            }).then(function (chkUserExistAnswer) {
                if (chkUserExistAnswer != null) {

                    if (objUser.pin != null && objUser.pin != '' && objUser.pin != undefined) {

                        chkUserExistMobile.updateAttributes({
                            pin: objUser.pin,
                            modifieddate: moment()
                        }).then(function (response) {
                            res.json({
                                success: true,
                                token: Encryptpassword,
                                data: response,
                                message: "Forgot PIN Successfully"
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
                            errortype: 2,
                            message: "PIN Not Found"
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        errortype: 2,
                        message: "Invalid Answer"
                    });
                }
            })
        } else {
            res.json({
                success: false,
                errortype: 1,
                message: "Invalid Mobile Number"
            });
        }

    });

});


module.exports = router