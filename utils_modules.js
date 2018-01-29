exports.getDateTime = function(format) {
	var date = new Date();
	if(format.length == 0) {
		format = "yyyymmddhhiiss";
	}

	var dd = date.getDate();
	var mm = date.getMonth() + 1;
	var yyyy = date.getFullYear();
	var hh = date.getHours();
	var ii = date.getMinutes();
	var ss = date.getSeconds();

	if(mm < 10) {
		mm = "0" + mm;
	}

	if(dd < 10) {
		dd = "0" + dd;
	}

	var result = format.replace("yyyy", yyyy);
	result = result.replace("mm", mm);
	result = result.replace("dd", dd);
	result = result.replace("hh", hh);
	result = result.replace("ii", ii);
	result = result.replace("ss", ss);

	return result;

};

exports.formatDate = function(input, format) {
	var date = input;
	if(format.length == 0) {
		format = "yyyymmddhhiiss";
	}

	var yyyy = input.substring(0,4);
	var mm = input.substring(4,6);
	var dd = input.substring(6,8);
	var hh = input.substring(8,10);
	var ii = input.substring(10,12);
	var ss = input.substring(12,14);

	var result = format.replace("yyyy", yyyy);
	result = result.replace("mm", mm);
	result = result.replace("dd", dd);
	result = result.replace("hh", hh);
	result = result.replace("ii", ii);
	result = result.replace("ss", ss);

	return result;

};