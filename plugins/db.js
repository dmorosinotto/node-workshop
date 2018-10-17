'use strict'

const fp = require('fastify-plugin')
const MongoDB = require('fastify-mongodb')

module.exports = fp(async function (fastify, opts) {
    const mongoOpts = Object.assign({}, {
        useNewUrlParser: true,
        url: process.env.MONGODB_URL //SUGGERIMENTO NON USARE FILE CONFIG MA VARIABILI AMBIENTE
        //+ TRICK USO dotenv IN SVILUPPO + FILE .env , MA IN  PROD PASSO LE ENV
    }, opts.mongodb)
    fastify.register(MongoDB, mongoOpts)
})
