var table = "posts";

exports.insert = function(con, input) {

	return new Promise(function(resolve, reject) {

		var sqlCheck = 'SELECT id FROM ' + table + ' WHERE title = "' + input.title + '" ';
		con.query(sqlCheck, function(err, result, fields) {
			if(err) {
				return reject(err);
			}

			// console.log(result.length);

			if(result.length == 0) { 

				var sql = 'INSERT INTO ' + table + '(title,description,content,time,status,author_id) VALUES("' + input.title + '","' + input.desc + '","'+ input.content +'","' + input.time + '","' + input.status + '","' + input.author_id + '")';
				console.log(sql);
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