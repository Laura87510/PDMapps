const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:Laura87510@localhost:5432/pdmServer';

const client = new pg.Client(connectionString);
client.connect();
// const query = client.query(
//   'CREATE TABLE items(id SERIAL PRIMARY KEY, nume VARCHAR(40) not null, nota INTEGER)');
const query2 = client.query(
  'CREATE TABLE users(username VARCHAR(50) PRIMARY KEY, password VARCHAR(50) not null)'
);
// query.on('end', () => { client.end(); });
query2.on('end', () => { client.end(); });
