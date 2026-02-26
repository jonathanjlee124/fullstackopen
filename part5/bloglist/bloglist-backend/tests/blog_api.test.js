const assert = require('node:assert')
const { describe, test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)



beforeEach(async () => {
  const user = await helper.createInitialUsers()
  await helper.seedBlogsForUser(user)
})

describe ('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]

    assert(blog.id)
    assert.strictEqual(blog._id, undefined)
  })

  test('blogs contain creator user info', async () => {
    const response = await api.get('/api/blogs')

    const blog = response.body[0]
    assert(blog.user)
    assert(blog.user.username)
  })
})

describe('POST /api/blogs', () => {
    test('a valid blog can be added', async () => {
        const token = await helper.loginAndGetToken(api)

        const newBlog = {
        title: 'Async/Await simplifies making async calls',
        author: 'John Doe',
        url: 'https://example.com/async-await',
        likes: 7
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
      const titles = response.body.map(blog => blog.title)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(titles.includes(newBlog.title))
    })

    test('if likes is missing, it defaults to 0', async () => {
        const token = await helper.loginAndGetToken(api)

        const newBlog = {
            title: 'No likes blog',
            author: 'Jane Doe',
            url: 'https://example.com/no-likes'
        }

        const result = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(result.body.likes, 0)
    })

    test('blog without title is not added', async () => {
        const token = await helper.loginAndGetToken(api)

        const newBlog = {
            author: 'Jane Doe',
            url: 'https://example.com/no-title',
            likes: 5
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without url is not added', async () => {
        const token = await helper.loginAndGetToken(api)

        const newBlog = {
            title: 'No URL blog',
            author: 'Jane Doe',
            likes: 5
        }

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('adding a blog fails with 401 if token is not provided', async () => {
        const newBlog = {
            title: 'no token blog',
            author: 'me',
            url: 'http://example.com',
            likes: 1
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('created blog is assigned to the logged-in user', async () => {
        const token = await helper.loginAndGetToken(api)

        const newBlog = {
            title: 'user attached blog',
            author: 'me',
            url: 'http://example.com',
        }

        const created = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        assert(created.body.user)
    })
})

describe('DELETE /api/blogs/:id', () => {
    test('creator can delete blog', async () => {
        const token = await helper.loginAndGetToken(api)

        const created = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 't', author: 'a', url: 'http://x.com' })
            .expect(201)

        await api
            .delete(`/api/blogs/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
    })

    test('deleting fails with 401 if token missing', async () => {
        const token = await helper.loginAndGetToken(api)

        const created = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 't2', author: 'a', url: 'http://y.com' })
            .expect(201)

        await api
            .delete(`/api/blogs/${created.body.id}`)
            .expect(401)
    })

    test('deleting fails with 403 if not creator', async () => {
        const token1 = await helper.loginAndGetToken(api)

        const created = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token1}`)
            .send({ title: 't3', author: 'a', url: 'http://z.com' })
            .expect(201)

        await api
            .post('/api/users')
            .send({ username: 'user2', name: 'User Two', password: 'password2' })
            .expect(201)

        const loginRes = await api
            .post('/api/login')
            .send({ username: 'user2', password: 'password2' })
            .expect(200)

        const token2 = loginRes.body.token

        await api
            .delete(`/api/blogs/${created.body.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)
    })

    test('fails with status code 400 if id is invalid', async () => {
        const token = await helper.loginAndGetToken(api)

        await api
            .delete('/api/blogs/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
        const token = await helper.loginAndGetToken(api)
        const validNonExistingId = await helper.nonExistingId()

        await api
            .delete(`/api/blogs/${validNonExistingId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    })
})

describe('PUT /api/blogs/:id', () => {
    test('succeeds with status code 200 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const updatedBlogData = {
            ...blogToUpdate,
            likes: blogToUpdate.likes + 1
        }

        const result = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlogData)
            .expect(200)

        assert.strictEqual(result.body.likes, blogToUpdate.likes + 1)
    })

    test('fails with status code 400 if id is invalid', async () => {
        await api
            .put('/api/blogs/invalid-id')
            .send({ likes: 10 })
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 404 if blog does not exist', async () => {
        const validNonExistingId = await helper.nonExistingId()

        await api
            .put(`/api/blogs/${validNonExistingId}`)
            .send({ likes: 10 })
            .expect(404)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
})


after(async () => {
  await mongoose.connection.close()
})