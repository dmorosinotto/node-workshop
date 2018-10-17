'use strict'

module.exports = async function (app, opts) {
  const tickets = app.mongo.db.collection('tickets')
  const { ObjectId } = app.mongo

  app.post('/', async function (req, reply) {
    const data = await tickets.insertOne(req.body)

    const _id = data.ops[0]._id

    reply
      .code(201)
      .header('location', `${this.basePath}/${_id}`)

    return Object.assign({
      _id
    }, req.body)
  })

  app.get('/', async function (req, reply) {
    const array = await tickets.find().sort({
      _id: -1 // new tickets first
    }).toArray()

    return { tickets: array }
  })

  app.get('/:id', async function (req, reply) {
    const id = req.params.id

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

module.exports.autoPrefix = '/tickets'
