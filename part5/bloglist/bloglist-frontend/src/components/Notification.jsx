const Notification = ({ message, type }) => {
  if (!message) return null

  const style = {
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: type === 'error' ? 'red' : 'green',
    borderColor: type === 'error' ? 'red' : 'green',
  }

  return (
    <div style={style} className={type}>
      {message}
    </div>
  )
}

export default Notification