const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const AccountModel = require('./models/account')

// Static file
const path = require('path')
app.use('/public', express.static(path.join(__dirname, '/public')))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Home
// chỉ phương thức GET mới hiện view
app.get('/', (req, res, next) => {
    var duongDanFile = path.join(__dirname, 'home.html')
    res.sendFile(duongDanFile)
})

const accountRouter = require('./routers/account')

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

// Login
app.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    AccountModel.findOne({
        username: username,
        password: password,
    })
        .then((data) => {
            if (data) {
                res.json('Đăng nhập thành công!')
            } else {
                res.status(500).json('Tài khoản hoặc mật khẩu chưa chính xác!')
            }
        })
        .catch((err) => {
            res.status(500).json('Đã xảy ra lỗi!')
        })
})

app.listen(5000, () => {
    console.log('Connect successfully!!!')
})
