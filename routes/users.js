var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../db/config');
var dao = require('../dataDao/dao');


var responseJSON = function(res,ret){
  if(typeof ret === 'undefined'){
    res.json({code:'-200',msg:'操作失败'});
  }else{
    res.json(ret);
  }
}
exports.regist = function(req, res){
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var querysql = "select * from user where username=?";
    var addsql = "insert into user set ?"
    var params = username;
    var addparams= {username:username,password:password};
    //操作数据库
   var queryResult= dao.query(querysql,params,function(result){
       var len = result.length;
       var msg = {};
       console.log('len='+len);
       if(len<1){
           var addResult = dao.add(addsql,addparams,function(addResult){
               console.log(addResult);
               if(addResult){
                   msg = {
                       message:'注册成功',
                       statusCode:200
                   }
                   res.send(msg);
               }
           });
       }else{
           msg ={
               message:'用户名已存在',
               statusCode:201
           }
           res.send(msg);
       }
   });
};
exports.updatePwd = function(req, res){
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    console.log(req.body);
    var password = req.body.submitPwd;
    var updatesql ='update user set ?';
    var updateparams= {password:password};
    dao.update(updatesql,updateparams,function(result){
        var msg = {};
        if(result){
            msg = {
                message:'修改成功',
                statusCode:200
            }
            res.send(msg);
        }else{
            msg ={
                message:'修改失败',
                statusCode:203
            }
            res.send(msg);
        }
    });
};
exports.login = function(req,res){
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var querysql = "select * from user where username=?";
    var params = username;
    //操作数据库
    var queryResult= dao.query(querysql,params,function(result){
        console.log(result);
        var len = result.length;
        var msg = {};
        if(len<1){
            msg ={
                username:username,
                message:'用户'+username+'不存在',
                statusCode:201
            }
            res.send(msg);
        }else{
            if(result[0].password == password){
                msg ={
                    username:username,
                    message:'登录成功',
                    statusCode:200
                }
                console.log('登录成功');
            }else{
                msg ={
                    username:username,
                    message:'密码错误',
                    statusCode:201
                }
                console.log('密码错误');
            }
            res.send(msg);
        }
    });
}


exports.pay = function(){
    var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    var appid = 'appid';
    var mch_id = 'mch_id';
    var notify_url = "notify_url";
    var out_trade_no = 'out_trade_no';
    var total_fee = 'total_fee';
    var attach ='attach';
    var body = 'body';
    var nonce_str = 'nonce_str';
    var formData = "<xml>";
    formData += "<appid>"+appid+"</appid>"; //appid
    formData += "<attach>"+attach+"</attach>"; //附加数据
    formData += "<body>"+body+"</body>"; //商品或支付单简要描述
    formData += "<mch_id>"+mch_id+"</mch_id>"; //商户号
    formData += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串，不长于32位
    formData += "<notify_url>"+notify_url+"</notify_url>"; //支付成功后微信服务器通过POST请求通知这个地址
    formData += "<openid></openid>"; //扫码支付这个参数不是必须的
    formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>"; //订单号
    formData += "<spbill_create_ip></spbill_create_ip>"; //不是必须的
    formData += "<total_fee>"+total_fee+"</total_fee>"; //金额
    formData += "<trade_type>NATIVE</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
    formData += "<sign>" + paysign(appid,attach,body,out_trade_no,nonce_str,notify_url, '', out_trade_no,'', total_fee, 'NATIVE') + "</sign>";
    formData += "</xml>";
    var option = {
        url:url,
        method:'post',
        body:formData
    }
    http.request(option,function(error,res,body){
        if (!error && response.statusCode == 200)
        {
            console.log(body);
            var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8"));
            var tmp = prepay_id.split('[');
            var tmp1 = tmp[2].split(']');
            var code_url = getXMLNodeValue('code_url', body.toString("utf-8"));
            var tmp = code_url.split('[');
            var tmp3 = tmp[2].split(']');
            res.render('pay',
                {
                    prepay_id : tmp1[0],
                    code_url : tmp3[0]
                }
            );
        }
    }).on("error",function(error){
        console.log(error);
        console.log('请求错误，原因:');
    })

}
