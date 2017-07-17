var express = require('express');
var router = express.Router();
var dao = require('../dataDao/dao');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
    console.log('jinlai le ma ');
    res.render('login', { title: 'test' });
});
/* GET users listing. */
router.get('/users', function(req, res, next) {
    res.render('layout',{test:'哈哈哈哈'});
});

/* GET users listing. */
// router.post('/regist', function(req, res, next) {
//     var username = req.body.username;
//     var password = req.body.password;
//     var sql= 'insert into users (username,password) value('+username+','+password+')';
//     console.log(sql);
//     //注册
//     dao.dosql(res,sql);
// });
module.exports = router;
