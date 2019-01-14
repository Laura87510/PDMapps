var express = require('express');
var router = express.Router();

const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:Laura87510@localhost:5432/pdmServer';
const jwt  = require('jsonwebtoken');
const server = require('http').createServer(express());
const WebSocket = require('ws').Server;
const wss = new WebSocket({ port: 8087 });

const broadcast = data => {
  // wss.on('connection', () => {
   console.log('CONECTAT');
   wss.clients.forEach(conn => {
     conn.send(JSON.stringify(data));
   });
 };

//CREATE

router.post('/create', (req, res, next) => {
  const items = [];
  // Grab data from http request
  const data = {nume: req.body.nume, nota: req.body.nota};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO items(nume, nota) values($1, $2)',
    [data.nume, data.nota]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      broadcast( items );
      return res.json(items);
    });
  });
});

router.put('/sync', (req, res, next) => {
  const data = req.body.items;
  pg.connect(connectionString, (err, client, done) => {
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('dataaa', data);
    data.forEach(item => {
      console.log('item', item);
      client.query('UPDATE items SET nume=($1), nota=($2) where id=($3)',
      [item.nume, item.nota, item.id]);
    });
    broadcast(data);
  });
});

router.post('/login/android', (req,res,next) => {
  results = [];
  console.log('-------->bod',req.body);
  const data = {username: req.body.username, password: req.body.password};
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM users where username=$1 and password=$2',
    [data.username, data.password]);

    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      if(results.length == 0) {
        console.log(false);
        return res.json({token: 'Wrong credentials!'});
      }
      console.log(true);
      return res.json({token: jwt.sign({username: data.username}, 'secret')});
    });
  });
});


router.post('/login', (req,res,next) => {
  results = [];
  console.log('-------->bod',req.body);
  const data = {username: req.body.username, password: req.body.password};
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM users where username=$1 and password=$2',
    [data.username, data.password]);

    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      if(results.length == 0) {
        console.log(false);
        return res.json(false);
      }
      console.log(true);
      // return res.json(true);
      return res.json({token: jwt.sign({username: data.username}, 'secret')});
      // return res.json(jwt.sign({username: data.username}, 'secret'));
    });
  });
});

//READ
router.get('/read', (req, res, next) => {
  const items = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      broadcast(items);
      return res.json({items});
    });
  });
});


router.put('/update', (req, res, next) => {
  const items = [];
  // Grab data from http request
  console.log('------->req', req.body);
  const data = {id: req.body.id, nume: req.body.nume, nota: req.body.nota};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('dataaa', data);
    client.query('UPDATE items SET nume=($1), nota=($2) where id=($3)',
    [data.nume, data.nota, data.id]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      broadcast(items);
      return res.json(items);
    });
  });
});

router.put('/update/android', (req, res, next) => {
  const items = [];
  // Grab data from http request
  console.log('------->req', req.body);
  const data = {id: req.body.id, nume: req.body.nume, nota: req.body.nota};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('dataaa', data);
    client.query('UPDATE items SET nume=($1), nota=($2) where id=($3)',
    [data.nume, data.nota, data.id]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      broadcast(items);
      return res.json({items});
    });
  });
});

router.delete('/delete/:id', (req, res, next) => {
  const items = [];
  // Grab data from http request
  const data = {id: req.params.id};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('DELETE from items where id=$1',[data.id]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      items.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      broadcast(items);
      return res.json(items);
    });
  });
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
