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

/*========================= 지문 등록 프로세스 ======================================*/
//10&11.hido에서 CI,publicKeyB를 json으로 받아와서 DB에 추가
app.get("/registration/key", function(req, res){
    var CI = req.body.CI;
    var publicKeyB = req.body.publicKeyB;

    if(CI!=null && publicKeyB != null){
        var sql = "INSERT INTO fido (`CI`, `publicKeyB`) VALUES (?,?)";
        connection.query(sql, [CI,publicKeyB], function (error, results) {
                if (error) throw error;
                else {
                    console.log('publicKeyB 등록완료');
                }
            })
    }else{
        console.log("CI or publicKeyB 없음");
    }
});

/*========================= 지문 인증 프로세스 ======================================*/
// 7.FIDO 서버로 CI를 받아서 검색해서, HIDO 서버에 PublicKeyB 전송
app.post("/auth", function (req, res) {
    var CI = req.body.CI;//hido에서 넘어오는 값
    if(CI!=null){
        var sql = "SELECT * FROM fido WHERE CI = ?";
        connection.query(sql, [CI], function (error, results) {
                if (error) throw error;
                else {
                    var publicKeyB = results[0].publicKeyB;
                    var jsonData = { "publicKeyB": publicKeyB, "CI": CI };
                    res.json(jsonData);
                }
            })
    }else{
        console.log("CI 없음");
    }
});


var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
console.log('Server running');