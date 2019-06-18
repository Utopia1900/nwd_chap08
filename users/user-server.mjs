import restify from 'restify';
import util from 'util';
import DBG from 'debug';
const log = DBG('users:service');
const error = DBG('users:error');
import * as usersModel from './users-sequelize';

var server = restify.createServer({
  name: 'user-auth-server',
  version: '0.0.1'
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
  mapParams: true
}))

server.post('/create-user', async (req, res, next) => {
  try {
    var result = await usersModel.create(req.params.username, req.params.password, req.params.provider, req.params.familyName,
      req.params.givenName, req.params.middleName, req.params.emails, req.params.photos);
    log('created ' + util.inspect(result));
    res.contentType = 'json';
    res.send(result);
    next(false);
  } catch (err) {
    res.send(500, err);
    error(`/create-user ${err.stack}`);
    next(false);
  }
})

server.post('/update-user/:username', async (req, res, next) => {
  try {
    var result = await usersModel.update(req.params.username, req.params.password, req.params.provider, req.params.familyName,
      req.params.givenName, req.params.middleName, req.params.emails, req.params.photos);
      log('updated '+ util.inspect(result));
      res.contentType = 'json';
    res.send(usersModel.sanitizedUser(result));
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.post('/find-or-create', async (req, res, next) => {
  log('find-or-create' + util.inspect(req.params));
  try {
    var result = await usersModel.findOrCreate({
      id: req.params.username,
      username: req.params.username,
      password: req.params.password,
      provider: req.params.provider,
      familyName: req.params.familyName,
      givenName: req.params.givenName,
      middleName: req.params.middleName,
      emails: req.params.emails,
      photos: req.params.photos
    });
    res.contentType = 'json';
    res.send(result);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.get('/find/:username', async (req, res, next) => {
  try {
    var user = await usersModel.find(req.params.username);
    if (!user) {
      res.send(404, new Error('Did not find' + req.params.username));
    } else {
      res.contentType = 'json';
      res.send(user);
    }
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.del('/destroy/:username', async (req, res, next) => {
  try {
    await usersModel.destroy(req.params.username);
    res.contentType = 'json';
    res.send({});
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.post('/passwordCheck', async (req, res, next) => {
  try {
    var checked = await usersModel.userPasswordCheck(req.params.username, req.params.password);
    log(`passwordCheck result=${util.inspect(checked)}`);
    res.contentType = 'json';
    res.send(checked);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.get('/list', async (req, res, next) => {
  try {
    var userlist = await usersModel.listUsers();
    if (!userlist) userlist = [];
    log(util.inspect(userlist));
    res.contentType = 'json';
    res.send(userlist);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
})

server.listen(process.env.PORT, 'localhost', function () {
  log(server.name + ' listening at ' + server.url);
})

var apiKeys = [{
  user: 'them',
  key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF'
}];

function check(req, res, next) {
  if (req.authorization) {
    var found = false;
    for (let auth of apiKeys) {
      if (auth.key === req.authorization.basic.password && auth.user === req.authorization.basic.username) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.send(401, new Error('Not authenticated'));
      error('Failed authentication check' + util.inspect(req.authorization));
      next(false);
    }
  } else {
    res.send(500, new Error('No authenticated key'));
    error('NO AUTHORIZATION');
    next(false);
  }
}
