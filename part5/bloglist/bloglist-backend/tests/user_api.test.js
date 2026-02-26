const assert = require('node:assert')
const { describe, test, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in db', () => {

  beforeEach(async () => {
    await helper.createInitialUsers()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'useruser',
      name: 'User User',
      password: 'passwordpassword'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'user1',
      name: 'Duplicate',
      password: 'password123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails if username is too short', async () => {
    await api
      .post('/api/users')
      .send({
        username: 'ab',
        name: 'Short',
        password: 'abcd1234'
      })
      .expect(400)
  })

  test('creation fails if password is missing', async () => {
    await api
      .post('/api/users')
      .send({
        username: 'validusername',
        name: 'No Password'
      })
      .expect(400)
  })

  test('creation fails if password is too short', async () => {
    await api
      .post('/api/users')
      .send({
        username: 'validusername2',
        name: 'Short Password',
        password: 'ab'
      })
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})