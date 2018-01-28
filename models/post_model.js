var table = "posts";

exports.insert = function(con, data) {

	return new Promise(function(resolve, reject) {

		var sqlCheck = 'SELECT id FROM ' + table + ' WHERE title = "' + data.title + '" ';
		con.query(sqlCheck, function(err, result, fields) {
			if(err) {
				return reject(err);
			}

			// console.log(result.length);

			if(result.length == 0) { 

				var sql = 'INSERT INTO ' + table + ' (title,desc,content,time,status) VALUES("' + data.title + '","' + data.desc + '","'+ data.content +'","' + data.time + '","' + data.status + '")';
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