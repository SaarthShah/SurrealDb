import express from 'express';
import bodyParser from 'body-parser';

import Surreal from 'surrealdb.js';

const db = new Surreal('http://127.0.0.1:8000/rpc');
db.use('test','test');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 6969;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    }
);

app.get('/', (req, res) => {
    res.send('SurrealDB Server Running');
    }
);

app.post('/login', (req,res) => {
    let username = req.body.user;
    let password = req.body.pass;
    db.signin({
        user: username,
        pass: password
    }).then((data)=>{
        res.send(data);
    });
});

app.get(
    '/getusers',(req,res)=>{
        db.query("SELECT * FROM users").then((data)=>{
            res.send(data);
        });
    });

// app.post(
//     '/signup',(req,res)=>{
//         let username = req.body.user;
//         let password = req.body.pass;
//         try{
//             db.signup({
//             user: username,
//             pass: password
//         }).then((data)=>{
//             res.send(data);
//         });
//         }
//         catch(err){
//             console.log(err);
//         }
        
//     }
// )

app.post('/newchat', (req,res) => {
    let user1 = req.body.user1;
    let user2 = req.body.user2; 
    db.query(`CREATE chat SET user1 = ${user1}, user2 =${user2}`).then((data)=>{
        res.send(data);
    }
    );
});

app.get('/getchats', (req,res) => {
    db.query(`SELECT * FROM chats`).then((data)=>{
        res.send(data);
    });
});

app.post('/message', (req,res) => {
    let chatid = req.body.chatid;
    let message = req.body.message;
    let messageid = '';
    let sender = req.body.sender;
    db.query(`CREATE message SET chatid = ${chatid}, message = ${message}`).then((data)=>{
        messageid = data[0]['result'][0]['id'];
        db.query(`RELATE ${chatid}->contains->${messageid} CONTENT {
        time: ${Date.now()},
        sender: ${sender},}`).then((data)=>{
        res.send(data);
    });
    });
});

app.get('/messages', (req,res) => {
    try{
    db.query(`select ->contains->message.message,->contains.time, ->contains.sender from ${req.body.chatid}`).then((data)=>{

        if (data[0]['result'].length == 0){
            res.send([]);
            return 0;
        } else{
            let messages = data[0]['result'][0]['->contains']['->message']['message'];
            let times = data[0]['result'][0]['->contains']['time'];
            let senders = data[0]['result'][0]['->contains']['sender'];
            for(let i = 0; i < messages.length; i++){
                messages[i] = {
                    message: messages[i],
                    time: times[i],
                    sender: senders[i]
                }
            }
            res.send(messages);
        }
    }
    );}
    catch(err){
        console.log(err);
    }
});

