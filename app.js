var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    config = require('./config');

//setting app
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//setting database
mongoose.connect(config.database);
var port = 3001;

// setting model
var Client = require('./models/clientModel');
var User = require('./models/userModel');
var Customer = require('./models/customerModel');

// get an instance of the router for api routes
var authRouter = express.Router();

authRouter.post('/authenticate', function (req, res) {
    // find the user
    User.findOne({
        username: req.body.username
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, config.jwt_secret, {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});


// Middleware untuk check authenticate
authRouter.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.jwt_secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


app.use('/api', authRouter);


clientRouter = require('./routes/clientRoute')(Client);
app.use('/api/clients', clientRouter);

customerRouter = require('./routes/customerRoute')(Customer);
app.use('/api/customers', customerRouter);

app.get('/', function (req, res) {
    res.send('Welcome!' + 'Active port : ' + port);
});

// =======================
// start the server ======
// =======================
app.listen(port, function () {
    console.log('Active port : ' + port);
});


// test commit from lenovo
// test commit from Fujitsus