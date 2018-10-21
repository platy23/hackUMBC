let express = require('express');
let sqlite = require('sqlite3').verbose();
var bodyParser = require('body-parser');
//var Date = new Date();


var app = express();
var db = new sqlite.Database('./databases/maindb.db');


db.all("CREATE TABLE IF NOT EXISTS washer (number INTEGER, name STRING, time TIMESTAMP, duration TIMESTAMP, type STRING);")
db.all("CREATE TABLE IF NOT EXISTS dryer (number INTEGER, name STRING, time TIMESTAMP, duration TIMESTAMP, type STRING);")


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/schedule', function (req, res) {


    db.all("DELETE FROM washer WHERE (time+duration)<" + Date.now() + ";", function() {
        db.all("DELETE FROM dryer WHERE (time+duration)<" + Date.now() + ";", function () {

            db.all("SELECT * FROM washer UNION SELECT * FROM dryer;", function (err, rows) {
                console.log("Sending rows:" + rows);
                res.json(JSON.stringify(rows))

            })

        })
    });

    console.log("CURRENT TIME:" + Date.now())
});


app.post('/register', function (req, res) {

    console.log(req.body);


    if (    //Establishes proper request syntax
        !(req.body.user &&
            req.body.timeSlot &&
            req.body.type &&
            req.body.machine &&
            req.body.duration)
    ) {
        res.status(400).send('400: Bad Request').end();
        return;
    }


    db.all("SELECT * FROM washer WHERE number = " + req.body.machine, function (err, rows) {


        console.log(rows);

        rows.forEach(row => {
            if ((row.time < req.body.time + req.body.duration && row.time > req.body.time) ||
                (row.time + row.duration > req.body.time && row.time + row.duration < req.body.time + req.body.duration) ||
                (row.time < req.body.time && row.time + row.duration > req.body.time + req.body.duration)) {

                res.status(400).send('400: Bad Request').end();
                return;
            }
        });

        res.status(200).end();

        scheduleTime(req);

        return;
    });




});




app.listen(3000, () => console.log("App is running and listening on port 3000"));



function scheduleTime(req) {

    console.log("INSERTING:" + JSON.stringify(req.body));

    console.log("CURRENT TIME:" + Date.now())

    db.all("INSERT INTO '" + req.body.type + "' VALUES (" + req.body.machine + ",'" + req.body.user + "'," + req.body.timeSlot + "," + req.body.duration + ",'" + req.body.type+"')");

}

