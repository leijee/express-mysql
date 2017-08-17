/**
 * Created by 59245 on 2017/7/20.
 */
var common = function(){
}
common.prototype = {
    Ajax:{//ajax
        that:this,
        getData:function(option,succFun,errorFun){
            var option = option||{method:'GET',async:true,data:null};

            if(option.url == undefined){
                new Error('请求地址不能为空');
                return;
            }
            var  xmlhttp = that.getXmlhttp();
            xmlhttp.open(option.method, option.url, option.async);
            xmlhttp.onreadystatechange = ajaxCallBack;
            xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xmlhttp.send(option.data);
            function ajaxCallBack(){
                if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                    succFun(xmlhttp.responseText);
                }else{
                    errorFun(xmlhttp.responseText);
                }
            }
        },
        getXmlhttp:function(){
            var xmlhttp;
            if(window.ActiveXObject){
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }else if(window.XMLHttpRequest){
                xmlhttp = new XMLHttpRequest();
            }
            return xmlhttp;
        }
    }


}



