const express = require('express');
const { ApolloServer } = require("apollo-server-express");
const path = require('path');
const db = require('./config/connection');
const {typeDefs, resolvers} = require("./schemas");
const routes = require('./routes');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  persistedQueries: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/graphql', expressMiddleware(server, {
  context: authMiddleware
}));



// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//app.use(routes);

//create new instance of Apollo server using GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();  
    server.applyMiddleware({app});

    db.once('open', () => {
        app.listen(PORT, () => {
          console.log(`API server running on port ${PORT}!`);
          console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
        });
      });
};

//start server

startApolloServer(typeDefs, resolvers);
//startApolloServer();

