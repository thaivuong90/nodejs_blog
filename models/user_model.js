
var table = "users";

exports.insert = function(con, data) {

	return new Promise(function(resolve, reject) {

		var sqlCheck = 'SELECT id FROM ' + table + ' WHERE username = "' + data.username + '" ';
		con.query(sqlCheck, function(err, result, fields) {
			if(err) {
				return reject(err);
			}

			// console.log(result.length);

			if(result.length == 0) { 

				var sql = 'INSERT INTO ' + table + ' (username,password,name,avatar) VALUES("' + data.username + '","' + data.password + '","'+ data.name +'","' + data.avatar + '")';
				con.query(sql, function (err, result) {
				    if (err) {
				    	return reject(err);
				    }

				    resolve(true);
				});

			} else {

				resolve(false);
			}
		});

		
	});
};

exports.login = function(con, data) {

	return new Promise(function(resolve, reject) {

		var sqlCheck = 'SELECT * FROM ' + table + ' WHERE username = "' + data.username + '" AND password = "' + data.password + '" ';
		con.query(sqlCheck, function(err, result, fields) {
			if(err) {
				return reject(err);
			}

			// console.log(result.length);

			resolve(result);
		});

		
	});
}

exports.getListFriend = function(con, data) {

	return new Promise(function(resolve, reject) {

		var sqlCheck = 'SELECT u.id, u.name, u.avatar, f.friend_id, b.name as friend_name, b.avatar as friend_avatar, p.id as post_id, p.title, p.description, p.content, p.time, p.status FROM users u ';
			sqlCheck += ' LEFT JOIN friends f ON u.id = f.user_id ';
			sqlCheck += ' LEFT JOIN users b ';
			sqlCheck += ' ON b.id = f.friend_id ';
			sqlCheck += ' LEFT JOIN posts p ';
			sqlCheck += ' ON p.author_id = u.id ';
			sqlCheck += ' WHERE u.id = "' + data.id + '" ORDER BY p.time ';


		con.query(sqlCheck,function(err, result, fields) {
			if(err) {
				return reject(err);
			}


			resolve(result);
		});

		
	});
}