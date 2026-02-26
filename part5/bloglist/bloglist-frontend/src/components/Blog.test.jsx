import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

test('renders title and author, but not url or likes by default', () => {
  const blog = {
    title: 'Testing React components',
    author: 'Author',
    url: 'https://example.com/blog',
    likes: 42,
  }

  render(<Blog blog={blog} onLike={() => {}} />)

  const title = screen.getByText('Testing React components', { exact: false })
  const author = screen.getByText('Author', { exact: false })

  expect(title).toBeDefined()
  expect(author).toBeDefined()

  const url = screen.queryByText('https://example.com/blog')
  expect(url).toBeNull()

  const likes = screen.queryByText('likes 42', { exact: false })
  expect(likes).toBeNull()
})

test('renders url and likes when the view button is clicked', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Author',
    url: 'https://example.com/blog',
    likes: 42,
  }

  const user = userEvent.setup()

  render(<Blog blog={blog} onLike={() => {}} />)

  expect(screen.queryByText('https://example.com/blog')).toBeNull()
  expect(screen.queryByText('likes 42', { exact: false })).toBeNull()

  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const url = screen.getByText('https://example.com/blog')
  const likes = screen.getByText('likes 42', { exact: false })

  expect(url).toBeDefined()
  expect(likes).toBeDefined()
})

test('calls onLike twice when the like button is clicked twice', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Author',
    url: 'https://example.com/blog',
    likes: 42,
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} onLike={mockHandler} />)

  const user = userEvent.setup()

  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})


