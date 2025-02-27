
(async () => {
    const {authMiddleware} = require('./utils/auth')
    const express = require('express')
    const path = require('path')
    const db = require('./config/connection')
    const routes = require('./routes')
    const {typeDefs, resolvers} = require('./schemas')
    const {ApolloServer} = require('apollo-server-express')

    const PORT = process.env.PORT || 3001
    const app = express()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: authMiddleware,
    });
    await server.start()

    // integrate our Apollo server with the Express application as middleware
    server.applyMiddleware({app})

    app.use(express.urlencoded({extended: false}))
    app.use(express.json())

    // if we're in production, serve client/build as static assets
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/build')))
    }

    app.use(routes)

    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`🌍 Now listening on localhost:${PORT}`)
            console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
        })
    })
})()
