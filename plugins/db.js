'use strict'

const fp = require('fastify-plugin')
const MongoDB = require('fastify-mongodb')

module.exports = fp(async function (fastify, opts) {
    const mongoOpts = Object.assign({}, { //URL MONGODB LETTO DA ENV USATO IN PROD E RUN NORMALE E APRE INTERNAMENTE CONNESIONE CHE VIENE CHIUSA ALLA FINE
        useNewUrlParser: true,
        url: process.env.MONGODB_URL //SUGGERIMENTO NON USARE FILE CONFIG MA VARIABILI AMBIENTE
        //+ TRICK USO dotenv IN SVILUPPO + FILE .env , MA IN  PROD PASSO LE ENV
    }, opts.mongodb) //OPTS.mongodb VIENE PASSATO SOLO QUANDO ESEGUO I TEST PER PASSARE OPZIONI
    //client + database GIA' APERTI IN MODO CHE fastify-plugin USA QUELLA CONNESIONE E NON NE APRE UNA IN BASE URL
    fastify.register(MongoDB, mongoOpts)
})
