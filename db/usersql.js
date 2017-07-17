/**
 * Created by 59245 on 2017/7/12.
 */
var usersql = {
    insert:'insert into user(userid,username,password) values(?,?,?)',
    queryAll:'select * form user',
    getUserById:'select * from user where userid = ? '
}

module.exports = usersql;