/**
 * Created by 59245 on 2017/9/7.
 * 添加跨域 白名单
 */

// 白名单列表
var allowList = [
    'http://localhost:8080',
    'http://localhost:3000'
];
function allowOrigin(_origin){//_origin 是否符合白名单
    var len = allowList.length;
    for(var i=0;i<len;i++){
        if(allowList[i] == _origin){
            return _origin;
        }else{
            throw new Error('主机地址'+_origin+'不允许跨域');
            return '';
        }
    }
}
module.exports = allowOrigin;
