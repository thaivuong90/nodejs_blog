exports.init = function () {
    var mysql = require('mysql');

	var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "",
	  database: "chat_app"
	});

	con.connect(function(err) {
	  if (err) throw err;
	  	console.log("Connected!");
	});

	return con;
};