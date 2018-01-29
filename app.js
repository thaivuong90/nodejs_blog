var express = require('express');
var session = require('express-session');
var app = express();
app.use(express.static(__dirname));
app.use(session({secret:'XASDASDA'}));
var ssn ;

// var ejs = require('ejs');

app.set('views', __dirname + '/html');
app.set('view engine', 'ejs');

var http = require('http').Server(app);;
var url  = require('url');
var fs   = require('fs');
var mysql   = require('./mysql_modules');
var formidable = require('formidable');
var md5  = require('md5');
const Entities  = require('html-entities').XmlEntities;
var utils = require('./utils_modules');
var user_model = require('./models/user_model');
var post_model = require('./models/post_model');

var entities = new Entities();
var con = mysql.init();

app.get('/', function(req, res){
	var obj = {error: ""};
  	res.render('login', { data: obj });
});

app.get('/user', function(req, res){
	var json = '{"name":"", "password":"","conf_password":"","token":"9999","error":[], "success":[]}';

	var obj = JSON.parse(json);
  	res.render('user', { data: obj });
});

app.post('/user', function(req, res){

	var form =  new formidable.IncomingForm();

	form.uploadDir = "upload/";

	form.parse(req,function (err, fields, file) {

		// Button register
		if(fields.submit == "Register") {

			//path tmp trên server
	        var path = file.upload.path;

	        if(file.upload.name.length > 0) {
	        	//thiết lập path mới cho file
		        var newpath = form.uploadDir + file.upload.name;
		        fs.rename(path, newpath, function (err) {
		            if (err) throw err;
		            console.log('Upload Thanh cong!');
		        });
	        }
	        
	        
	        var name     = fields.name;
		  	var username = fields.username;
		 	var password = fields.password;
			var conf_password = fields.conf_password;

			var json = '{"name":"' + name + '", "password":"' + password + '","conf_password":"' + conf_password + '"';
			var validate = ',"error":[';

			if(name.length == 0) {
				validate += '{"content":"Please input name"},';
			}

			if(username.length == 0) {
				validate += '{"content":"Please input username"},';
			}

			if(password.length == 0) {
				validate += '{"content":"Please input password"},';
			}

			if(conf_password.length == 0) {
				validate += '{"content":"Please input confirm password"},';
			}

			if(password != conf_password) {
				validate += '{"content":"Password and confirm password not match"},';
			}

			validate = validate.substring(0, validate.length - 1);

			validate += '],"success":[]';
			json += validate;

			
			if(validate.length == 0) {

				var data = {username:username, password:md5(password), name:name, avatar:newpath};
				user_model.insert(con, data).then(function(flag) {
					
					var validate = ',"error":[';
					var success  = ',"success":[';
					if(flag) {
						success += '{"content":"Create user successfully"}';
					} else {

						validate += '{"content":"Username already used"}';
					}

					success += ']';
					validate += ']';

					var json = '{"name":"' + name + '", "password":"' + password + '","conf_password":"' + conf_password + '","token":""';
					json += validate;
					json += success;
					json += '}';

					var obj = JSON.parse(json);
					res.render('user', { data : obj});
				}); 
				
			} else {

				json += '}';

				var obj = JSON.parse(json);
			  	res.render('user', { data : obj});

			}
		}

		// Button login
		if(fields.submit == "Login") {
			res.redirect('user/login');
		}
    });
});

app.get('/user/login', function(req, res) {
	var json = '{"error":[]}';
	var obj = JSON.parse(json);
  	res.render('login', { data: obj });
});

app.post('/user/login', function(req, res) {

	var json = '{"error":[';

	var form =  new formidable.IncomingForm();

	form.parse(req,function (err, fields, file) {

		var validate = "";
		var username = fields.username;
		var password = fields.password;
		var data = {username:username, password:md5(password)};

		if(username.length == 0) {
			validate += '{"content": "Please input username"},';
		}

		if(password.length == 0) {
			validate += '{"content": "Please input password"},';
		}
		

		if(validate.length == 0) {

			user_model.login(con, data).then(function(result) {

				var json = '{"error":[';

				if(result.length > 0) {

					ssn = req.session;
					ssn.login_id = result[0].id;
					res.redirect('/post');

				} else {
					validate += '{"content": "Username or password incorrect"}';

					json += validate;
					json += ']}';

					var obj = JSON.parse(json);
					res.render('login', { data: obj });
					
				}
				
			});

		} else {

			validate = validate.substring(0, validate.length - 1);
			json += validate;
			json += ']}';
			var obj = JSON.parse(json);
			res.render('login', { data: obj });
		}
		

	});
});

app.get('/user/logout', function(req, res){
  	req.session.destroy(function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      res.redirect('/user/login');
	    }
	});
});

app.get('/user/info', function(req, res){
  	req.session.destroy(function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      res.redirect('/user/login');
	    }
	});
});

app.get('/post', function(req, res) {
	ssn = req.session;
	if(ssn.login_id) {
		var condition = {id:ssn.login_id};

		getUserInfo(res, condition, 'post');
		
	} else {
		res.redirect('/user/login');
	}
});

app.get('/post/add', function(req, res) {

	ssn = req.session;
	if(ssn.login_id) {
		var condition = {id:ssn.login_id};

		getUserInfo(res, condition, 'add_post');
		
	} else {
		res.redirect('/user/login');
	}

});

app.get('/post/view/:post_id', function(req, res) {

	ssn = req.session;
	if(ssn.login_id) {
		
		var condition = {id:ssn.login_id};

		getUserInfo(res, condition, 'view_post');
		
	} else {
		res.redirect('/user/login');
	}

});

app.post('/post/add', function(req, res) {

	ssn = req.session;

	var form =  new formidable.IncomingForm();

	form.parse(req,function (err, fields, file) {

		// Submit
		if(fields.submit == "Submit") {
			
			var title = entities.encode(fields.title);
			var desc  = entities.encode(fields.desc);
			var content = entities.encode(fields.content);
			var status = fields.status;
			var time = utils.getDateTime("");

			var input = {title:title,desc:desc,content:content,time:time,status:status,author_id:ssn.login_id};
			post_model.insert(con, input).then(function(result) {
				if(result) {
					res.redirect("/post");
				}
			});
		}

		// Clear
		if(fields.submit == "Clear") {
			res.redirect("/post/add_post");
		}

	});


});

http.listen(3000, function(){
  	console.log('listening on *:3000');
});

var getUserInfo = function(res, condition, view) {
	user_model.getListFriend(con, condition).then(function(result) {

		var user_info_obj = {id:result[0].id, name:result[0].name, avatar:result[0].avatar};

		var data = {user_info: user_info_obj};

		var list_friend_array = [];
		var list_posts_array = [];

		var pre_post_id = "";
		var pre_friend_id = "";

		for(var i = 0; i < result.length; i++) {
			if(result[i].friend_id != null && pre_friend_id != result[i].friend_id) {
				var list_friend_obj = {friend_id:result[i].friend_id, friend_name:result[i].friend_name, friend_avatar:result[i].friend_avatar};
				list_friend_array[i] = list_friend_obj;
			}

			if(result[i].post_id != null && pre_post_id != result[i].post_id) {

				var title = entities.decode(result[i].title);
				var desc = entities.decode(result[i].description);
				var content = entities.decode(result[i].content);
				var time = utils.formatDate(result[i].time, "hh:ii dd/mm/yyyy");
				var list_posts_obj = {post_id:result[i].post_id, title:title, desc:desc, content:content, time:time, status:result[i].status};
				list_posts_array[i] = list_posts_obj;
				pre_post_id = result[i].post_id;
			}
		}

		data["list_friends"] = list_friend_array;
		data["list_posts"]   = list_posts_array;

		if(Object.keys(data).length > 0) {
			res.render(view, { data: data });
		}

	});
}

