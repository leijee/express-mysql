/**
 * Created by 59245 on 2017/7/12.
 */

var mysql = require('mysql');
var dbconfig = require('../db/config');
// var usersql = require('../db/usersql');

var pool = mysql.createPool(dbconfig.mysql);
var dao = {
    query:function(sql,param,callback){
        Connection(sql,param,callback);
    },
    add:function(sql,param,callback){
        Connection(sql,param,callback);
    },
    delete:function(sql,param,callback){
        Connection(sql,param,callback);
    },
    update:function(sql,param,callback){
        console.log('update');
        Connection(sql,param,callback);
    }
}
function Connection(sqlStr,paramStr,callback){
    console.log(sqlStr,paramStr);
    pool.getConnection(function(err,connection){
        connection.query(sqlStr,paramStr,function(err,result){
            callback(result);
            // 释放连接
            connection.release();
        })
    })
}
module.exports = dao;
