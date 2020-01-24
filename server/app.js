const _ = require('lodash');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const tokenchannel = require('tokenchannel');
const client = new tokenchannel.Tokenchannel('TCk-sAZEMFkRdOuPRu0OgT7U9ps7CgrC3LummwfF');
const channel = tokenchannel.Channel.TELEGRAM;
const options = {
    language: 'en',
    codeLength: 6,
    charset: tokenchannel.Charset.UPPER
};

var TODOS = [
    {'id': 1, 'user_id': 1, 'name': "Get Milk", 'completed': false},
    {'id': 2, 'user_id': 1, 'name': "Fetch Kids", 'completed': true},
    {'id': 3, 'user_id': 2, 'name': "Buy flowers for wife", 'completed': false},
    {'id': 4, 'user_id': 3, 'name': "Finish Angular JWT Todo App", 'completed': false},
];
var USERS = [
    {'id': 1, 'username': 'jemma', telegramId: '994285665'},
    {'id': 2, 'username': 'paul'},
    {'id': 3, 'username': 'sebastian'},
];

function getTodos(userID) {
    var todos = _.filter(TODOS, ['user_id', userID]);

    return todos;
}

function getTodo(todoID) {
    var todo = _.find(TODOS, function (todo) {
        return todo.id == todoID;
    })

    return todo;
}

function getUsers() {
    return USERS;
}

app.use(bodyParser.json());
app.use(expressJwt({secret: 'todo-app-super-shared-secret'}).unless({path: ['/api/auth'], methods: ['PUT', 'POST']}));

app.get('/', function (req, res) {
    res.send('Angular JWT Todo API Server')
});

// PRELOGIN
app.post('/api/auth', async function (req, res) {
    const body = req.body;

    const user = USERS.find(user => user.username == body.username);
    if (!user || body.password != 'todo' || !user.telegramId) return res.sendStatus(401);
    try {
        const {requestId} = await client.challenge(channel, user.telegramId, options);
        res.send({challengeId: requestId});
    } catch (e) {
        return res.sendStatus(500);
    }
});

// LOGIN
app.put('/api/auth', async function (req, res) {
    const requestId = req.body.username;
    const otp = req.body.password;
    try {

        const {identifier} = await client.authenticate(requestId, otp);
        const user = USERS.find(user => user.telegramId == identifier);
        if (!user) return res.sendStatus(401);
        var token = jwt.sign({userID: user.id}, 'todo-app-super-shared-secret', {expiresIn: '2h'});
        res.send({token});
    } catch (e) {
        return res.sendStatus(500);
    }
});
app.get('/api/todos', function (req, res) {
    res.type("json");
    res.send(getTodos(req.user.userID));
});
app.get('/api/todos/:id', function (req, res) {
    var todoID = req.params.id;
    res.type("json");
    res.send(getTodo(todoID));
});
app.get('/api/users', function (req, res) {
    res.type("json");
    res.send(getUsers());
});

app.listen(4000, function () {
    console.log('Angular JWT Todo API Server listening on port 4000!')
});
