'use strict'

const ticketSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    body: {
      type: 'string'
    }
  },
  required: ['title', 'body']
}

module.exports = async function (app, opts) {
  const tickets = app.mongo.db.collection('tickets')
  const { ObjectId } = app.mongo

  app.post('/', {
    schema: {
      body: ticketSchema,
      response: {
        '2xx': ticketSchema
      }
    }
  }, async function (req, reply) {
    const data = await tickets.insertOne(req.body)

    const _id = data.ops[0]._id

    reply
      .code(201)
      .header('location', `${this.basePath}/${_id}`)

    return Object.assign({
      _id
    }, req.body)
  })

  app.get('/', {
    schema: {
      response: {
        '2xx': {
          type: 'object',
          properties: {
            tickets: {
              type: 'array',
              items: ticketSchema
            }
          }
        }
      }
    }
  }, async function (req, reply) {
    const array = await tickets.find().sort({
      _id: -1 // new tickets first
    }).toArray()

    return { tickets: array }
  })

  app.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            pattern: '[0-9a-f]{24}'
          }
        }
      },
      response: {
        '2xx': ticketSchema
      }
    }
  }, async function (req, reply) {
    const id = req.params.id
    //console.log("ID=", id);
    const data = await tickets.findOne({
      _id: new ObjectId(id)
    })

    if (!data) {
      reply.code(404)
      return { status: 'not ok' }
    }

    return data
  })
}

module.exports.autoPrefix = '/tickets' //QUESTO SERVER PER SPECIFICARE IL PREFIX PER MONTARE LE ROUTES
//ATTENZIONE: E' UNA COSA DI AUTOLOAD - NORMALENTE IN Fastify si fa il .register(require('route.js'), {prefix: 'xxx'})
