var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require("express"); // npm install express
const request = require("request");
var mysql = require("mysql");
const aes256 = require('aes256');
var crypto = require('crypto');
const { Z_ASCII } = require('zlib');

var app = express();
app.use(express.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //crt의 self-signed 문제 해결

var key = fs.readFileSync('./keys/bankfido.pem', 'utf-8');
var certificate = fs.readFileSync('./keys/bankfido.crt', 'utf-8');
var credentials = { key: key, cert: certificate };


var connection = mysql.createConnection({//local db
    host: "127.0.0.1", //localhost
    user: "root",
    password: "1234",
    database: "fido",
    port: "3306"
});
connection.connect();
// connection.release();


request.defaults({ //rejectUnauthorized를 false값으로 두어야 https 서버통신 가능
    strictSSL: false, // allow us to use our self-signed cert for testing
    rejectUnauthorized: false
});

/*========================= 지문 인증 프로세스 ======================================*/
// 7.FIDO 서버에서 CI를 받아서 검색해서, HIDO 서버에 PublicKeyB 전송
app.get("/auth", function (req, res) {
    var CI = 'pXfDJK18dEvBbHnSUtgzKP19uxCK2C6/xbDU1AhC0CtLWAL0EeAVIMeExyzw0uxwtZ6tjTIVDVQiH/w7OE3/eg==';//hido에서 넘어오는 값
    if(CI!=null){
        var sql = "SELECT * FROM fido WHERE CI = ?";
        connection.query(sql, [CI], function (error, results) {
                if (error) throw error;
                else {
                    var publicKeyB = results[0].publicKeyB;
                    var jsonData = { "publicKeyB": publicKeyB, "CI": CI };
                    res.send(jsonData);
                }
            })
    }else{
        console.log("CI 없음");
    }
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3001);
console.log('Server running');