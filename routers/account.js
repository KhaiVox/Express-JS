const express = require('express')
var router = express.Router()
const AccountModel = require('../models/account')

// lấy dữ liệu từ DB
router.get('/', (req, res, next) => {
    AccountModel.find({})
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.json('Lỗi server')
        })
})

// lấy dữ liệu 1 item từ DB
router.get('/:id', (req, res, next) => {
    var id = req.params.id
    AccountModel.findById(id)
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.json('Lỗi server')
        })
})

// thêm mới vào DB
router.post('/', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    console.log(username)

    AccountModel.create({
        username: username,
        password: password,
    })
        .then((data) => {
            res.json('Thêm tài khoản thành công')
        })
        .catch((err) => {
            res.json('Lỗi server')
        })
})

// update dữ liệu trong DB
router.put('/:id', (req, res, next) => {
    var id = req.params.id
    var newPassword = req.body.newPassword

    AccountModel.findByIdAndUpdate(id, {
        password: newPassword,
    })
        .then((data) => {
            res.json('Đổi mật khẩu thành công')
        })
        .catch((err) => {
            res.json('Lỗi server')
        })
})

// xóa dữ liệu trong DB
router.delete('/:id', (req, res, next) => {
    var id = req.params.id

    AccountModel.deleteOne({
        _id: id,
    })
        .then((data) => {
            res.json('Xóa tài khoản thành công')
        })
        .catch((err) => {
            res.json('Lỗi server')
        })
})

module.exports = router
