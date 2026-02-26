const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      await expect(
        page.getByText('Matti Luukkainen logged in', { exact: false })
      ).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toBeVisible()
      await expect(errorDiv).toContainText('wrong', { ignoreCase: true })

      await expect(
        page.getByText('Matti Luukkainen logged in', { exact: false })
      ).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, { title: 'a blog created by playwright', author: 'playwright author', url: 'https://example.com' })

      await expect(
        page.getByText('a new blog "a blog created by playwright" by playwright author added')
      ).toBeVisible()

      await expect(page.locator('.blog').getByText('a blog created by playwright', { exact: false })).toBeVisible()
      await expect(page.locator('.blog').getByText('playwright author', { exact: false })).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      const title = 'likeable blog'
      const author = 'playwright author'
      const url = 'https://example.com'

      await createBlog(page, { title, author, url })

      const blogItem = page.getByText(title, { exact: false }).locator('..')
      await blogItem.getByRole('button', { name: 'view' }).click()

      await expect(blogItem.getByText(/likes\s+0/i)).toBeVisible()

      await blogItem.getByRole('button', { name: 'like' }).click()

      await expect(blogItem.getByText(/likes\s+1/i)).toBeVisible()
    })

    test('user who created a blog can delete it', async ({ page }) => {
      const title = 'blog to be deleted'
      const author = 'playwright author'
      const url = 'https://example.com'

      await createBlog(page, { title, author, url })

      const blogItem = page.locator('.blog').filter({ hasText: title })
      await expect(blogItem).toBeVisible()

      await blogItem.getByRole('button', { name: 'view' }).click()

      page.on('dialog', async (dialog) => {
        await dialog.accept()
      })

      await blogItem.getByRole('button', { name: /remove|delete/i }).click()

      await expect(blogItem).not.toBeVisible()
    })

    test('only the creator sees the delete button', async ({ page, request }) => {
      await createBlog(page, { title: 'blog by mluukkai', author: 'mluukkai', url: 'https://example.com' })

      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Other User',
          username: 'otheruser',
          password: 'password'
        }
      })

      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'otheruser', 'password')
      await expect(page.getByText('Other User logged in')).toBeVisible()

      const blogItem = page.locator('.blog').filter({ hasText: 'blog by mluukkai' })
      await blogItem.getByRole('button', { name: 'view' }).click()

      await expect(blogItem.getByRole('button', { name: /remove|delete/i })).not.toBeVisible()
    })

    test('blogs are ordered by likes, most likes first', async ({ page }) => {
      await createBlog(page, { title: 'blog with least likes', author: 'author', url: 'https://example.com' })
      await createBlog(page, { title: 'blog with most likes', author: 'author', url: 'https://example.com' })
      await createBlog(page, { title: 'blog with middle likes', author: 'author', url: 'https://example.com' })

      const mostBlog = page.locator('.blog').filter({ hasText: 'blog with most likes' })
      await mostBlog.getByRole('button', { name: 'view' }).click()
      for (let i = 0; i < 3; i++) {
        await mostBlog.getByRole('button', { name: 'like' }).click()
        await mostBlog.getByText(`likes ${i + 1}`).waitFor()
      }

      const middleBlog = page.locator('.blog').filter({ hasText: 'blog with middle likes' })
      await middleBlog.getByRole('button', { name: 'view' }).click()
      await middleBlog.getByRole('button', { name: 'like' }).click()
      await middleBlog.getByText('likes 1').waitFor()

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('blog with most likes')
      await expect(blogs.nth(1)).toContainText('blog with middle likes')
      await expect(blogs.nth(2)).toContainText('blog with least likes')
    })
  })
})