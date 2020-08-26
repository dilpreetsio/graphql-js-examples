let express = require('express');
let { graphqlHTTP } = require('express-graphql');
let { buildSchema } = require('graphql');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pokemon.db');

let schema = buildSchema(`
    type Pokemon {
        id: ID,
        name: String
    },
    type Query {
      hello: String,
      pokemons: [Pokemon],
      pokemon(id:ID!): Pokemon
    }
`);

const fetchAsync = (sql, isSingle) =>{
  return new Promise( (resolve, reject) => {
    const cb = (err, res) => {
      if (err) reject()
      resolve(res)
    }
    if(isSingle) {
      db.get(sql, cb)
    } else {
      db.all(sql, cb)
    }
  })
}

let root = {
  hello: () => {
    return 'Hello world!';
  },
  pokemon: (args) => {
    return fetchAsync(`SELECT id,name from pokemons where id = ${args.id}`, true)
  },
  pokemons: () => {
    return fetchAsync("SELECT id,name from pokemons", false)  
  }
};

let app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);