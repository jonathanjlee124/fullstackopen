const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    likes: 10
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5
  }
]

const initialUsers = [
  {
    username: 'user1',
    name: 'User One',
    password: 'password1'
  }
]

const createInitialUsers = async () => {
  await User.deleteMany({})

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(initialUsers[0].password, saltRounds)

  const user = new User({
    username: initialUsers[0].username,
    name: initialUsers[0].name,
    passwordHash,
    blogs: []
  })

  await user.save()
  return user
}

const seedBlogsForUser = async (user) => {
  await Blog.deleteMany({})
  const blogsWithUser = initialBlogs.map(b => ({ ...b, user: user._id }))
  await Blog.insertMany(blogsWithUser)

  const blogsInDbNow = await Blog.find({})
  user.blogs = blogsInDbNow.map(b => b._id)
  await user.save()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'John Doe', url: 'https://example.com/no-title', likes: 5 })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const loginAndGetToken = async (api) => {
  const response = await api
    .post('/api/login')
    .send({ username: initialUsers[0].username, password: initialUsers[0].password })
    .expect(200)

  return response.body.token
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  loginAndGetToken,
  initialUsers,
  usersInDb,
  createInitialUsers,
  seedBlogsForUser
}
