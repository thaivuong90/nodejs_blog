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

var user_model = require('./models/user_model');

var con = mysql.init();

app.get('/user', function(req, res){
	var json = '{"name":"", "password":"","conf_password":"","token":"9999","error":[], "success":[]}';

	var obj = JSON.parse(json);
  	res.render('user', { data: obj });
})

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
	        
	        
	        var error    = false;
	        var name     = fields.name;
		  	var username = fields.username;
		 	var password = fields.password;
			var conf_password = fields.conf_password;

			var json = '{"name":"' + name + '", "password":"' + password + '","conf_password":"' + conf_password + '"';
			var validate = ',"error":[';

			if(name.length == 0) {
				validate += '{"content":"Please input name"},';
				error = true;
			}

			if(username.length == 0) {
				validate += '{"content":"Please input username"},';
				error = true;
			}

			if(password.length == 0) {
				validate += '{"content":"Please input password"},';
				error = true;
			}

			if(conf_password.length == 0) {
				validate += '{"content":"Please input confirm password"},';
				error = true;
			}

			if(password != conf_password) {
				validate += '{"content":"Password and confirm password not match"},';
				error = true;
			}

			validate = validate.substring(0, validate.length - 1);

			validate += '],"success":[]';
			json += validate;

			
			if(!error) {

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

app.get('/user/login', function(req, res){
	var obj = {error: ""};
  	res.render('login', { data: obj });
});

app.post('/user/login', function(req, res){

	var form =  new formidable.IncomingForm();

	form.parse(req,function (err, fields, file) {

		var username = fields.username;
		var password = md5(fields.password);
		var data = {username:username, password:password};
		user_model.login(con, data).then(function(result) {

					
			if(result.length > 0) {

				ssn = req.session;
				ssn.login_id = result[0].id;
				res.redirect('/page');

			} else {
				var obj = {error: "Username or password incorrect"};
				res.render('login', { data: obj });

			}
		}); 

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

app.get('/page', function(req, res) {
	ssn = req.session;
	if(ssn.login_id) {
		var condition = {id:ssn.login_id};

		getUserInfo(res, condition, 'page');
		
	} else {
		res.redirect('/user/login');
	}
});

app.get('/page/add_post', function(req, res) {

	ssn = req.session;
	if(ssn.login_id) {
		var condition = {id:ssn.login_id};

		getUserInfo(res, condition, 'post');
		
	} else {
		res.redirect('/user/login');
	}

});

app.post('/page/add_post', function(req, res) {

	var form =  new formidable.IncomingForm();

	form.parse(req,function (err, fields, file) {

		// Submit
		if(fields.submit == "Submit") {
			
			var title = fields.title;
			var desc  = fields.desc;
			var content = fields.content;
			var status = fields.status;
		}

		// Clear
		if(fields.submit == "Clear") {
			res.redirect("/page/add_post");
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
		for(var i = 0; i < result.length; i++) {
			if(result[i].friend_id != null) {
				var list_friend_obj = {friend_id:result[i].friend_id, friend_name:result[i].friend_name, friend_avatar:result[i].friend_avatar};
				list_friend_array[i] = list_friend_obj;
			}

			if(result[i].post_id != null) {
				var list_posts_obj = {post_id:result[i].post_id, title:result[i].title, desc:result[i].desc, content:result[i].content, time:result[i].time, status:result[i].status};
				list_posts_array[i] = list_posts_obj;
			}
		}

		data["list_friends"] = list_friend_array;
		data["list_posts"]   = list_posts_array;

		if(Object.keys(data).length > 0) {
			res.render(view, { data: data });
		}

	});
}

