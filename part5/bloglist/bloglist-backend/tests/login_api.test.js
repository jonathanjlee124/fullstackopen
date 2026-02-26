const assert = require('node:assert')
const { test, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await helper.createInitialUsers()
})

test('login succeeds with correct credentials and returns token', async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'user1', password: 'password1' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert(response.body.token)
  assert.strictEqual(response.body.username, 'user1')
})

test('login fails with wrong password', async () => {
  await api
    .post('/api/login')
    .send({ username: 'wronguser', password: 'wrong' })
    .expect(401)
})

after(async () => {
  await mongoose.connection.close()
})