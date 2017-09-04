var express = require('express');
var mysql = require('mysql');
var dbConfig = require('../db/config');
var dao = require('../dataDao/dao');
var tokens = require('../utils/check_token');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var logger = require('../log/logHandle').helper;
var multiparty = require('multiparty');
var util = require('util');
var path = require('path');

var uploadFile = require('../utils/uploadFile');


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

function setCrypto(key){
    var secret = key;
    var hash  = crypto.createHmac('sha256',secret).update('I love cupcakes').digest('hex');
    console.log(hash);
}

exports.uploadFile = function (req,res) {
    var form = new multiparty.Form();
    // res.setHeader('text/plain');
    var msg = {info:'',img:''};
    console.log(__dirname);
    form.encoding = 'utf-8';
    form.uploadDir = __dirname+"/uploads";

    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和
    form.parse(req, function(err, fields, files) {
        if(err){
            console.log('错误');
            msg.info = '上传失败';
            res.send(msg);
            return ;
        }
        console.log(files.files[0].originalFilename);
        msg.img=path.join(__dirname,'/uploads/'+files.files[0].originalFilename);
        console.log(msg.img);
        msg.info = '上传成功'
        msg.len = files.length;
        res.writeHead(200,{"Content-type":"text/html;charset=UTF-8"});
        res.end(JSON.stringify(msg));
    });
}

//使用ajax文件上传
exports.ajaxUpload = function (req,res) {
    console.log(req.busboy);
    console.log(req.protocol);
    console.log(req.host);
    if(req.busboy){
        console.log(req.busboy);
    }

    var upload = uploadFile.single('files1');





    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            // An error occurred when uploading
            return
        }
        //req.body ajax提交的非文件数据
        //req.body.username //提交参数 username
        //req.file.fieldname 上传文件 input file  name字段名称
        //req.file.filename 上传文件 文件名
        //req.file.originalname 上传文件 文件名
        //req.file.mimetype 上传文件类型
        //req.file.size 上传文件大小
        //req.file.destination 上传文件存在的路径
        //req.file.path 上传文件的 路径
        console.log(req.file.path);
        var readFile = fs.readFileSync(req.file.path,'binary');
        res.send({msg:'上传成功',img:req.file.path});
        // Everything went fine
    })
}


exports.login = function(req,res){
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var querysql = "select * from user where username=?";
    var params = username;
    // setCrypto(password);
    if(username==''){
        res.send(sendMessage(204,'用户名不能为空'));
        return ;
    }
    if(password==''){
        res.send(sendMessage(203,'密码不能为空'));
        return ;
    }
    function sendMessage(code,message,token){
        return msg = {
            username:username,
            message:message,
            statusCode:code,
            token:token
        };
    }
    //操作数据库
    var queryResult= dao.query(querysql,params,function(result){
        console.log(result);
        var len = result.length;
        var msg = {};
        if(len<1){
            logger.writeInfo('用户'+username+'不存在');
            res.send(sendMessage(204,'用户'+username+'不存在'));
        }else{
            if(result[0].password == password){
                var token = tokens.createToken(password,new Date().getTime(),req);
                var userid = result[0].userid;

                var queryToken = 'select * from token where userid = ?';

                dao.query(queryToken,userid,function(tokenResult){
                    if(tokenResult.length>0){//token存在.更新token
                        var updateToken = 'update token set ?';
                        var primary_date = new Date();
                        var updateParam = {access_token:token,primary_time:primary_date};
                        dao.update(updateToken,updateParam,function(){
                            console.log('修改成功');
                            req.session.token = token;
                            msg =sendMessage(200,'登录成功',token);
                            res.send(msg);
                        })
                    }else{//token不存在,添加token
                        var addToken = 'insert into token set ?';
                        var primary_date = new Date();
                        var expire = 10*6000;//10分钟
                        var addParam = {userid:userid,access_token:token,primary_time:primary_date,expire:expire};
                        dao.add(addToken,addParam,function(){
                            console.log('添加成功');
                            req.session.token = token;
                            msg =sendMessage(200,'登录成功',token);
                            res.send(msg);
                        })
                    }
                })
            }else{
                msg =sendMessage(205,'密码错误');
                res.send(msg);
            }

        }
    });
}

//获取网站信息
exports.getWebsiteInfo = function(req,res){

    var website = req.body.website;
    console.log(website);
    request(website,function(error,response,body){
        if (!error && response.statusCode == 200) {
            //返回的body为抓到的网页的html内容
            var $ = cheerio.load(body); //当前的$符相当于拿到了所有的body里面的选择器
            var a = $("#navitems ").find("a");
            res.send(body);

        }
    });
}

function getData(url){
    request(url,function(error,response,body){
        getData(url);
    });
}



//微信支付统一下单
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
