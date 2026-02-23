const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((fav, blog) => (blog.likes > fav.likes ? blog : fav), blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = new Map()
  for (const blog of blogs) {
    counts.set(blog.author, (counts.get(blog.author) || 0) + 1)
  }

  let bestAuthor = null
  let bestCount = -1
  for (const [author, count] of counts.entries()) {
    if (count > bestCount) {
      bestAuthor = author
      bestCount = count
    }
  }

  return { author: bestAuthor, blogs: bestCount }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  
  const counts = new Map()
  for (const blog of blogs) {
    counts.set(blog.author, (counts.get(blog.author) || 0) + blog.likes)
}

  let bestAuthor = null
  let bestCount = -1
  for (const [author, count] of counts.entries()) {
    if (count > bestCount) {
      bestAuthor = author
      bestCount = count
    }
  }

  return { author: bestAuthor, likes: bestCount }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
