const fastify = require('fastify')()
fastify.register(require('fastify-helmet'))

fastify.register(require('fastify-cors'), {
  origin: '*',
})
const multer = require('fastify-multer')

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 1000000 } })
fastify.register(multer.contentParser)
const classify = require('./classify')

fastify.route({
  method: 'POST',
  url: '/classify',
  preHandler: upload.single('image'),
  handler: async (request, reply) => {
    try {
      const prediction = await classify.classify(request.file)
      reply.code(200).send(prediction)
    } catch (err) {
      reply.code(500).send(err)
    }
  },
})

try {
  fastify.get('/ping', async () => 'pong\n')
  fastify.listen(1337, '::')
} catch (error) {
  console.log(error)
  process.exit(1)
}
