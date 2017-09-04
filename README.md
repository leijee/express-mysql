# node+express+mysql 项目

##安装，配置
####1.nodejs安装
nodejs 下载路径 [http://nodejs.cn/download/](http://nodejs.cn/download/ "nodejs下载地址")
####2.安装express
express 官方安装教程 [https://expressjs.com/zh-cn/starter/installing.html](https://expressjs.com/zh-cn/starter/installing.html "express官方安装教程")

- npm install -g express-generator #需先安装express-generator  
- npm install -g express  
- express express-mysql
- cd express-mysql
- npm install
- npm start 启动项目
- 访问express项目 在浏览器中输入http://localhost:3000/
页面显示 Welcome to Express 时，说明express安装成功


####3.安装mysql
npm install mysql -save

####4.mysql 配置使用
mysql配置文件 config.js

![](https://i.imgur.com/MJpoG3N.png)

mysql对增删改查的封装 dao.js

![](https://i.imgur.com/KCQTiHL.png)

mysql查询方法操作  <br>
 `var dao = require('dao.js');`
  `dao.query(querysql,params,function(result){`
    	`console.log('查询方法');`
  `});`
##功能实现

### 1.登录功能
######/login api的实现
在app.js文件中

app.post('/login',function(req,res){//采用ajax post方式提交请求

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
	


});

### 2.文件上传功能
安装multer <br>
npm install multer <br>
npm 教程地址 [https://www.npmjs.com/package/multer](https://www.npmjs.com/package/multer "multer使用教程")
	
	//index.html  文件上传html+前端ajax代码
	<form enctype="multipart/form-data" method="post" class="upload-cont">
        <input type="file" name="files1" class="files1">
        <input type="text" name="username" class="username">
        <br>
        <input type="button" class="uploadBtn" value="点击上传">
    </form>
	$(".files1").on("change",function(e){
        var e = e || window.event;
        var files = e.target.files;
        var file = files[0];

        //文件上传
        $(".uploadBtn").off("click").on("click",function(){
            var username = $('.username').val();
            var formData = new FormData();
            formData.append('files1',file);
            formData.append('username',username);
            console.log(file);
            $.ajax({
                url: "/ajaxUpload",
                type: "post",
                data:formData,
                contentType: false,
                processData: false,
                success: function(res){
                    console.log(res);
                    $(".showImg").attr("src",res.img).css("display","block");
                },
                error:function(err){
                    console.log(err);
                }
            });
        })
    })
		

	
	uploadFile.js//文件 文件上传配置

	var multer = require('multer');
	var md5 = require('md5');
	
	var uploadPath = process.cwd()+'/uploads';
	console.log(uploadPath);
	var storage = multer.diskStorage({
	    destination: uploadPath,
	    filename: function (req, file, cb) {
	        var fileFormat =(file.originalname).split(".");
	        console.log(md5(file));
	        cb(null, fileFormat[0] + "." + fileFormat[1]);
	    }
	});
	//添加配置文件到muler对象。
	var upload = multer({
	    storage: storage,
	    //其他设置请参考multer的limits
	    //limits:{}
	});
	console.log(upload);
	//导出对象
	module.exports = upload;

	
	//app.js api接口调用
	var users = require('./routes/users');
	app.use('/ajaxUpload',users.uploadFile);

	
	//user.js api接口文件
	var uploadFile = require('../utils/uploadFile');

	exports.ajaxUpload = function (req,res){
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


### 3.爬虫功能

使用cheerio组件 (能够像使用jquery选择器一样操作网页元素节点),
将网页上面的图片资源，url拿到进行分析，筛选出自己想要的结果

安装 npm install cheerio

使用教程
[https://www.npmjs.com/package/cheerio](https://www.npmjs.com/package/cheerio "cheerio 使用教程")
	

	//getInfo.html 获取网站信息 html+ajax代码

	<div class="getWebsiteInfo">
        <input type="text" id="website" class="website" placeholder="请输入网站地址" autofocus>
        <div id="getInfo" class="btn-getInfo">获取信息</div>
    </div>
	
	<script>
	var btn = document.getElementById('getInfo');
    btn.addEventListener('click',function(){
        submitData();
    })
    function submitData(){
        var website = document.getElementById('website').value;
        var xmlhttp = "";
        if(window.ActiveXObject){
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }else if(window.XMLHttpRequest){
            xmlhttp = new XMLHttpRequest();
        }
        console.log('website='+ website);
        xmlhttp.open("post", "/getWebsiteInfo", true);
        xmlhttp.onreadystatechange = ajaxCallBack;
        xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xmlhttp.send('website='+ website);
        function ajaxCallBack(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                console.log(xmlhttp.responseText);

            }else{
                console.log('error');
            }
        }
    }
	</script>
	
	//app.js
	var users = require('./routes/users');
	app.post('/getWebsiteInfo',users.getWebsiteInfo);

	//users.js  接口实现api方法
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
	
	