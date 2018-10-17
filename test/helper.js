'use strict'

// This file contains code that we reuse
// between our tests.

const Fastify = require('fastify')
const fp = require('fastify-plugin')
const App = require('../app')

const clean = require('mongo-clean')
const { MongoClient } = require('mongodb')
const { beforeEach, tearDown, test } = require('tap')
//USO VARIABILI GLOBALI SOLO PER I TEST PERCHE MI VIENE COMODO!!!
const url = 'mongodb://localhost:27017'
const database = 'tests'

let client

beforeEach(async function () { //ESEGUITO PRIMA DI OGNI TEST
    if (!client) { //CREO UNA CONNESIONE A MONGODB LA 1a VOLTA
        client = await MongoClient.connect(url, {
            w: 1,
            useNewUrlParser: true
        })
    }
    await clean(client.db(database)) //SVUOTA IL DATABASE MONGO PER AVER SITUAZIONE PULITA
})

tearDown(async function () { //ESEGUITO ALLA FINE DI TUTTI I TEST
    if (client) {
        await client.close() //CHIUDE LA CONNESIONE A MONGODB ALLA FINE QUANDO HO FINITO TEST
        client = null
    }
})

// Fill in this config with all the configurations
// needed for testing the application
function config() {
    return {
        auth: {
            secret: 'averyverylongsecret'
        },
        mongodb: { //PASSO COME PARAMETRI AGGIUNTIVI "mongodb" CONNESIONE VIVA + DB TEST
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

async function createUser(t, app, { username, password }) {
    // TODO replace this with direct database access
    const res = await app.inject({
        url: '/signup',
        method: 'POST',
        body: {
            username,
            password
        }
    })

    t.deepEqual(res.statusCode, 200)
    const body = JSON.parse(res.body)
    t.match(body, { status: 'ok' })

    const token = body.token
    t.ok(token)

    return token
}

function testWithLogin(name, fn) {
    test(name, async (t) => {
        const app = build(t)

        const token = await createUser(t, app, {
            username: 'matteo',
            password: 'matteo'
        })

        function inject(opts) {
            opts = opts || {}
            opts.headers = opts.headers || {}
            opts.headers.authorization = `Bearer ${token}`

            return app.inject(opts)
        }

        return fn(t, inject)
    })
}
module.exports = {
    config,
    build,
    createUser,
    testWithLogin
}
