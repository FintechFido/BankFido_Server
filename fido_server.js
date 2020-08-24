const path = require("path");
var https = require('https');
var fs = require('fs');
var express = require("express");
var mysql = require("mysql");
var crypto = require('crypto');
const request = require("request");


//mysql에 접근 가능한 사용자 확인 여부
var connection = mysql.createConnection({//local db
    host: "127.0.0.1", //localhost
    user: "root",
    password: "1234",
    database: "fido",
    port: "3306"
});
connection.connect();

/*
var connection = mysql.createConnection({//TEST DB에 연결.
    host: "database.c0kvvrvcbjef.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    password: "12344321",
    database: "bankapp",
    port: "3306"
});
connection.connect();
*/

var key = fs.readFileSync('./keys/bankfido.pem', 'utf-8');
var certificate = fs.readFileSync('./keys/bankfido.crt', 'utf-8');
var credentials = { key: key, cert: certificate };

var app = express();

app.use(express.urlencoded({ extended: false }));//form에서 데이터를 받아오자!

app.use(express.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public"))); //to use static asset

//10&11.hido에서 CI,publicKeyB를 json으로 받아와서 DB에 추가
request('https://127.0.0.1:3000/registration/key', function (error, response, body) {
    //console.error('error:', error);
    //console.log('statusCode:', response && response.statusCode); 
    console.log('body:', body);
/*
    if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);
        console.log(data);

        var sessionKey = data.sessionKey;
        var CI = data.CI;
        var bankcode = data.bankcode;

        app.post("/registration/key", function (req, res) {
            var sql = "UPDATE fido SET CI = ? WHERE sessionKey = ?";
            connection.query(
                sql, [CI, sessionKey], function (error, results) {
                    if (error) throw error;
                    else {
                        console.log("update ci fingerprint table");
                        var dbSessionKey = results[0].sessionKey;
                        var dbBankCode = results[0].bankcode;

                        console.log(dbSessionKey, dbBankCode);

                        if (dbSessionKey == sessionKey && dbBankCode == bankcode) {
                            console.log("fingerprint table에 CI값 등록");
                            res.send(1);
                        }
                        else {
                            console.log("false");
                        }
                    }
                });
        });
    }*/
});



var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3001);
console.log('Server running');