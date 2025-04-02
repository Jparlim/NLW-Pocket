import fastify from 'fastify'

const App = fastify()

App.listen({ port: 3333 }, () => console.log('server is running'))
