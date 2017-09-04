/**
 * Created by 59245 on 2017/8/30.
 */
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