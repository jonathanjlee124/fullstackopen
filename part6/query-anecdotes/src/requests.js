const baseUrl = 'http://localhost:3001/anecdotes'

export const getAnecdotes = async () => {
  const res = await fetch(baseUrl)
  if (!res.ok) {
    throw new Error('failed to fetch anecdotes')
  }
  return await res.json()
}

export const createAnecdote = async (newAnecdote) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAnecdote)
  }
  const res = await fetch(baseUrl, options)
  if (!res.ok) {
    throw new Error('failed to create anecdote')
  }
  return await res.json()
}

export const updateAnecdote = async (updatedAnecdote) => {
  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAnecdote)
  }
  const res = await fetch(`${baseUrl}/${updatedAnecdote.id}`, options)
  if (!res.ok) {
    throw new Error('failed to update anecdote')
  }
  return await res.json()
}