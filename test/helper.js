'use strict'

// This file contains code that we reuse
// between our tests.

const Fastify = require('fastify')
const fp = require('fastify-plugin')
const App = require('../app')

const clean = require('mongo-clean')
const { MongoClient } = require('mongodb')
const { beforeEach, tearDown } = require('tap')
//USO VARIABILI GLOBALI SOLO PER I TEST!!!
const url = 'mongodb://localhost:27017'
const database = 'tests'

let client

beforeEach(async function () { //ESEGUITO PRIMA DI OGNI TEST
    if (!client) {
        client = await MongoClient.connect(url, {
            w: 1,
            useNewUrlParser: true
        })
    }
    await clean(client.db(database))
})

tearDown(async function () { //ESEGUITO ALLA FINE DI TUTTI I TEST
    if (client) {
        await client.close()
        client = null
    }
})

// Fill in this config with all the configurations
// needed for testing the application
function config() {
    return {
        mongodb: {
            client,
            database
        }
    }
}

// automatically build and tear down our instance
function build(t) {
    const app = Fastify()

    // fastify-plugin ensures that all decorators
    // are exposed for testing purposes, this is
    // different from the production setup
    app.register(fp(App), config())

    // tear down our app after we are done
    t.tearDown(app.close.bind(app))

    return app
}

module.exports = {
    config,
    build
}
