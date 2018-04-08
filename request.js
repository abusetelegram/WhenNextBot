var request = require('request');
var decode = require('unescape')

var process = function (error, response, body) {
    var myRe = /({&quot;Name)(.*)(&quot;})/g;
    if (error !== null) {
        console.error('err when retrive data')
        stop
    }
    var a = body.match(myRe)[0]
    var b = decode(a)
    console.log(b)
    var fs = require('fs');
    fs.writeFile("./data.txt", b, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

request('https://www.whenisthenextsteamsale.com', process)