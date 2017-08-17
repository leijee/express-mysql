var express = require('express');
var router = express.Router();
var dao = require('../dataDao/dao');
var session = require('express-session');
var logger = require('../log/logHandle').helper;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
    logger.writeInfo("日志加入"+new Date());
    logger.writeErr("出现异常"+new Date());
    res.render('login', { title: 'test' });
});
/* GET users listing. */
router.get('users/', function(req, res, next) {
    res.render('layout',{test:'哈哈哈哈'});
});

/* GET users listing. */
router.get('/userInfo', function(req, res, next) {
    console.log('next........');
    console.log(req.cookies);
    checkLogin(req,res,function(){
        req.session.token = req.session.token;
        res.render('userInfo', { title: '用户信息' });
        res.end(req.session.token);
    });
});

function checkLogin(req,res,callback){
    var token = req.session.token;
    console.log('token的值为:'+token);
    if(!token){//没有登录，跳转到登录页面
        res.redirect('/login');
        return;
    }else{
        callback();
    }
}
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
