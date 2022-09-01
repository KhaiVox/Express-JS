const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const AccountModel = require('./models/account')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')

app.use(cookieParser())

// Static file
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Home
// chỉ phương thức GET mới hiện view
app.get(
    '/',
    (req, res, next) => {
        var token = req.cookies.token
        var decodeToken = jwt.verify(token, 'mk')
        AccountModel.find({ _id: decodeToken._id }).then((data) => {
            if (data.length == 0) {
                res.sendFile(path.join(__dirname, 'login.html'))
            } else {
                // kiểm tra nếu đủ quyền mới có thể đăng nhập vào trang login
                if (data[0].role == 2) {
                    next()
                }
                // nếu k sẽ trả về giao diện login
                else {
                    res.sendFile(path.join(__dirname, 'login.html'))
                }
            }
        })
    },
    (req, res, next) => {
        res.sendFile(path.join(__dirname, 'home.html'))
    },
)

// Edit
app.post(
    '/edit',
    (req, res, next) => {
        // cắt chuỗi để lấy giá trị token bị ngăn cách bởi dấu =
        var token = req.headers.cookie.split('=')[1]
        var decodeToken = jwt.verify(token, 'mk')
        AccountModel.find({ _id: decodeToken._id }).then((data) => {
            if (data.length == 0) {
                return res.redirect('/login')
            } else {
                if (data[0].role == 2) {
                    next()
                } else {
                    return res.json({
                        error: true,
                        message: 'Bạn không có quyền sửa',
                    })
                }
            }
        })
    },
    (req, res, next) => {
        // thực hiện edit tại đây
        res.json('Sửa thành công')
    },
)

// GET Login
app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'login.html'))
})

const accountRouter = require('./routers/account')
    // giới hạn số lượng item đc hiển thị trong 1 trang
const PAGE_SIZE = 5

app.get('/user', (req, res, next) => {
    // page lúc này có kiểu dữ liệu là string
    var page = req.query.page
    if (page) {
        // get page
        // cần ép kiểu sang kiểu int
        page = parseInt(page)
        if (page < 1) {
            page = 1
        }
        // bỏ qua bao nhiêu phần tử để đến trang mong muốn
        var skip = (page - 1) * PAGE_SIZE
        AccountModel.find({})
            .skip(skip)
            .limit(PAGE_SIZE)
            .then((data) => {
                AccountModel.countDocuments({}).then((total) => {
                    // đếm số trang để phục vụ cho render list html và chức năng prev/next
                    var totalPage = Math.ceil(total / PAGE_SIZE)
                    res.json({ total, totalPage, data })
                })
            })
            .catch((err) => {
                res.json('Lỗi render')
            })
    } else {
        // get all
        AccountModel.find({})
            .then((data) => {
                res.json(data)
            })
            .catch((err) => {
                res.json('Lỗi render')
            })
    }
})

app.use('/api/account', accountRouter)

// Register
app.post('/register', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    AccountModel.findOne({
            username: username,
        })
        .then((data) => {
            if (data) {
                res.json('User này đã tồn tại!')
            } else {
                AccountModel.create({
                    username: username,
                    password: password,
                }).then((data) => {
                    res.json('Tạo tài khoản thành công!')
                })
            }
        })
        .catch((err) => {
            res.status(500).json('Tạo tài khoản thất bại!')
        })
})

// POST Login
app.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    AccountModel.findOne({
            username: username,
            password: password,
        })
        .then((data) => {
            if (data) {
                var token = jwt.sign({
                        // cần chuyển đổi sang kiểu Object
                        _id: data._id,
                    },
                    'mk',
                )
                return res.json({
                    message: 'Thành công',
                    token: token,
                })
            } else {
                return res.status(500).json('Tài khoản hoặc mật khẩu chưa chính xác!')
            }
        })
        .catch((err) => {
            res.status(500).json('Đã xảy ra lỗi!')
        })
})

// Private
// app.get(
//     '/private',
//     (req, res, next) => {
//         try {
//             var token = req.cookies.token
//             var ketqua = jwt.verify(token, 'mk')
//             if (ketqua) {
//                 next()
//             }
//         } catch (error) {
//             return res.json('Bạn cần phải login')
//         }
//     },
//     (req, res, next) => {
//         res.json('welcome')
//     },
// )

var checkLogin = async(req, res, next) => {
    try {
        var token = req.cookies.token
        var idUser = jwt.verify(token, 'mk')
        const data = await AccountModel.findOne({ _id: idUser })
        req.data = data
    } catch (error) {
        res.status(500).json('Loi server')
    }
    next()
}

var checkStudent = (req, res, next) => {
    var role = req.data.role
    if (role >= 0) {
        next()
    } else {
        res.json('NOT PERMISSON')
    }
}

var checkTeacher = (req, res, next) => {
    var role = req.data.role
    if (role >= 1) {
        next()
    } else {
        res.json('NOT PERMISSON')
    }
}

var checkManager = (req, res, next) => {
    var role = req.data.role
    if (role >= 2) {
        next()
    } else {
        res.json('NOT PERMISSON')
    }
}

app.get('/task', checkLogin, checkStudent, (req, res, next) => {
    console.log(req.data)
    res.json('ALL TASK')
})

app.get(
    '/student',
    checkLogin,
    checkTeacher,
    (req, res, next) => {
        next()
    },
    (req, res, next) => {
        res.json('STUDENT')
    },
)

app.get(
    '/teacher',
    checkLogin,
    checkManager,
    (req, res, next) => {
        next()
    },
    (req, res, next) => {
        res.json('TEACHER')
    },
)

app.get(
    '/manager',
    checkLogin,
    checkManager,
    (req, res, next) => {
        next()
    },
    (req, res, next) => {
        res.json('MANAGER')
    },
)

app.listen(5000, () => {
    console.log('Connect successfully!!!')
})