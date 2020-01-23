const _ = require('lodash');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const tokenchannel = require("tokenchannel");
const client = new tokenchannel.Tokenchannel('TCk-znFddcW27DCFUI0d9knlV4KTydeODjm8ms9W');
const channel = tokenchannel.Channel.EMAIL;
const options = {
    language: 'en',
    codeLength: 6
}

var TODOS = [
    {'id': 1, 'user_id': 1, 'name': "Get Milk", 'completed': false},
    {'id': 2, 'user_id': 1, 'name': "Fetch Kids", 'completed': true},
    {'id': 3, 'user_id': 2, 'name': "Buy flowers for wife", 'completed': false},
    {'id': 4, 'user_id': 1, 'name': "Finish Angular JWT Todo App", 'completed': false},
];
var USERS = [
    {'id': 1, 'username': 'oalles.dev@gmail.com'},
    {'id': 2, 'username': 'paul@dontuseit.com'}
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
app.use(expressJwt({secret: 'todo-app-super-shared-secret'}).unless({path: ['/api/auth'], methods: ['GET', 'POST']}));

app.get('/', function (req, res) {
    res.send('Angular JWT Todo API Server')
});

// Create Challenge
app.get('/api/auth', async function (req, res) {
    const identifier = req.query.id; // GET /api/auth?id=oalles.dev@gmail.com

    const user = USERS.find(user => user.username == identifier);
    if (!user) return res.sendStatus(401);
    try {
        const {requestId} = await client.challenge(channel, identifier, options);
        res.send({challengeId: requestId});
    } catch (e) {
        if (e instanceof tokenchannel.InvalidIdentifierError) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(500);
        }
    }
});

// LOGIN REQUEST
app.post('/api/auth', async function (req, res) {
    const requestId = req.body.username;
    const validationCode = req.body.password;
    try {
        const {identifier} = await client.authenticate(requestId, validationCode);
        const user = USERS.find(user => user.username == identifier);
        if (!user) return res.sendStatus(401);
        var token = jwt.sign({userID: user.id}, 'todo-app-super-shared-secret', {expiresIn: '2h'});
        res.send({token});
    } catch (e) {
        if (e instanceof tokenchannel.InvalidCodeError) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(500);
        }
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
