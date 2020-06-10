const fs = require('fs');
const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io').listen(server);
const cookieParser = require('cookie-parser')

server.listen(8080);

//structure : [{id: , code: , nb: , language: , allowEdit: , users: [{id: , pseudo: , edit: , connected: }] }]
let roomsVal = [];

app.use(cookieParser());

//https://stackabuse.com/writing-to-files-in-node-js/

app.get('/:id/download/:ext', function(req, res){
    let id = req.params.id;
    let ext = req.params.ext;
    let room = findRoom(id);
    const filename = id + '.' + ext
    const path = 'files/' + filename;
    if(room != -1) {
        let code = roomsVal[room].code;
        fs.writeFile(path, code, (err) => {
            if (err) throw err;
            console.log('Fichier créé')
            let file = fs.createReadStream(path);
            res.writeHead(200, {'Content-disposition': 'attachment; filename=' + filename});
            file.on('end', function() {
                fs.unlink(path, function() {
                  console.log("Fichier supprimé")
                });
            });
            file.pipe(res);
        });
    }
});

app.get('/', function(req, res) {
    res.redirect("/"+makeid(7));
});

app.get('/favicon.ico', function(req, res) {
    res.status(204)
});

app.get('/:id', function(req, res) {
    let id = req.params.id, room = findRoom(id), host = false, user;
    console.log(req.cookies.userID);

    if(room != -1) {
        console.log("On a trouvé l'objet")
        console.log(roomsVal[room]);
        if(roomsVal[room].users[0].id==req.cookies.userID) 
            host = true;
    }
    else {
        room = roomsVal.length;
        console.log("L'objet n'existe pas, on le créé");
        roomsVal.push({id: id, code: 'function hello() {\r\n\tconsole.log("Hello world!");\r\n}', nb: 0, language:"javascript", allowEdit: false, users:[]});
        host = true;
    }
    res.render('index.ejs', {roomInfos : roomsVal[room], host : host});

});

app.use(function (req, res, next) {
    let cookie = req.cookies.userID;
    if (cookie === undefined)
    {
        let randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        let expiryDate = new Date(Number(new Date()) + 31536000000); 
        res.cookie('userID',randomNumber, { expires: expiryDate, httpOnly: true});
        console.log('cookie created successfully');
    } 
    else
    {
        //console.log('cookie exists', cookie);
    } 
    next();
});

app.use('/scripts/', express.static(__dirname + '/node_modules/'));
app.use('/js/', express.static(__dirname + '/public/js/'));
app.use('/css/', express.static(__dirname + '/public/css/'));

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

io.on('connect', function (socket) {
    let id = socket.handshake['query']['val'];
    let userID = findCookie(socket.handshake.headers.cookie, "userID");
    console.log('Un utilisateur est connecté à la salle ' + id + ' !');
    socket.join(id);
    let room = findRoom(id), user, pseudo, edit;
    if(room != -1) {
        roomsVal[room].nb++;
        console.log("Il y a maintenant " + roomsVal[room].nb + " utilisateur dans la salle " + id);
        if(roomsVal[room].users.length==0) {
            console.log("Cet utilisateur est défini en tant qu'hôte de la salle");
            roomsVal[room].users.push({ id: userID, pseudo: "user"+parseInt(roomsVal[room].users.length+1), edit: true, connected: true });
            user = 0;
        }
        else  {
            user = findUser(room, userID);
            if(user == -1) {
                let edit;
                user = roomsVal[room].users.length;
                console.log("Cet utilisateur n'existe pas dans cette salle, on le créé");
                roomsVal[room].allowEdit ? edit=true : edit= false;
                roomsVal[room].users.push({ id:userID, pseudo: "user"+parseInt(roomsVal[room].users.length+1), edit: edit, connected: true });
            }
        }
        pseudo = roomsVal[room].users[user].pseudo;
        roomsVal[room].users[user].connected = true;
        edit = roomsVal[room].users[user].edit;
    }
     
    
    socket.on('edit', function(code) {
        console.log(userID);
        if(room != -1 && roomsVal[room].users[user].edit) {
            roomsVal[room].code = code;
            //console.log(roomsVal[room]);
            socket.to(id).emit('edit', code);
        }
    });

    socket.on('connected', function() {
        let info = { pseudo: pseudo, user: user, edit: edit}
        socket.emit('info', info);
        io.in(id).emit('newUser', user, pseudo);
    });

    socket.on('changeLanguage', function(language) {
        if(room != -1 && user==0) {
            roomsVal[room].language = language;
            console.log(roomsVal[room]);
        }
        socket.to(id).emit('changeLanguage', language);
    });

    socket.on('changePseudo', function(pseudo) {
        if(room != -1) {
            roomsVal[room].users[user].pseudo = pseudo;
            console.log(roomsVal[room]);
            socket.to(id).emit('changePseudo', user, pseudo );
        }
    });

    socket.on('allowEdit', function(allowEdit) {
        if(room != -1 && user==0) {
            roomsVal[room].allowEdit = allowEdit;
            console.log(roomsVal[room]);
            socket.to(id).emit('allowEdit', allowEdit);
        }
    });

    socket.on('changeEdit', function(editUser, perm) {
        if(room != -1 && user==0) {
            roomsVal[room].users[editUser].edit = perm;
            console.log(roomsVal[room]);
            socket.to(id).emit('changeEdit', editUser, perm);
            edit = roomsVal[room].users[editUser].edit;
            console.log(edit);
        }
    });

    socket.on('sendMsg', function(msg) {
        if(room != -1) {
            socket.to(id).emit('newMsg', pseudo, user, msg);
        }
    });
    
    socket.on('disconnect', function() {
        socket.leave(id)
        console.log("Un utilisateur s'est déconnecté de la salle " + id);
        if(room != -1) {
            roomsVal[room].nb--;
            console.log("Il y a maintenant " + roomsVal[room].nb + " dans la salle " + id);
            roomsVal[room].users[user].connected = false;
            socket.to(id).emit('userDisconnected', user);
        }
    });
});

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function findRoom(id) {
    let room = -1;
    for (let i = 0; i < roomsVal.length; i++){
        if (roomsVal[i].id == id){
            room = i;
        }
    }
    return room;
}

function findUser(idRoom, idUser) {
    let user = -1;
    let users = roomsVal[idRoom].users;
    for (let i = 0; i < users.length; i++){
        if (users[i].id == idUser){
            user = i;
        }
    }
    return user;
}

function findCookie(cookiesStr, search) {
    let cookies = cookiesStr.split("; ");
    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].substring(0, search.length)==search) {
            return cookies[i].substr(search.length+1);
        }
    }
}