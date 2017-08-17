/**
 * Created by 59245 on 2017/7/19.
 */
var crypto = require('crypto');
var token = {
    createToken:function(obj,timeout,req){
        var objData = {
            data:obj,
            created :parseInt(Date.now()/1000),//token生成时间,单位秒
            exp :parseInt(timeout)||10 //token有效期
        };
        //payload信息
        var base64Str = Buffer.from(JSON.stringify(objData),'utf-8').toString('base64');
        console.log(base64Str);
        //签名
        var secret="hel.h-five.com";//
        var hash=crypto.createHmac('sha256',secret);//采用hash加密方式中的sha256
        console.log(hash);
        hash.update(base64Str);
        var signature=hash.digest('base64');//转换成base64
        return  base64Str+"."+signature;
    },
    decodeToken:function(){

    },
    checkToken:function(reqToken,req){//登录检查,是否已经登录,是否登录超时

        console.log();


        var tokenFlag = req.session.token;
        if(!tokenFlag){
            return 'token过期';
        }
        if(tokenFlag != reqToken){
            return 'token验证失败';
        }
        return '验证成功';
    }
}
module.exports = exports = token;
