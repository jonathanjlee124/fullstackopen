const Header = (props) => {
  console.log(props)
  return (
    <div>
      <h3>{props.course}</h3>
    </div>
  )
}

const Content = (props) => {
  console.log(props)
  return (
    <div>
      {props.parts.map(part => 
        <Part key={part.id} part={part} />
      )}
    </div>
  )
}

const Part = (props) => {
  console.log(props)
  return (
    <p>
      {props.part.name} {props.part.exercises}
    </p>
  )
}

const Total = (props) => {
  console.log(props)
  return (
    <div>
      <p>
        <strong>
          total of {props.parts.reduce((sum, part) => sum + part.exercises, 0)} exercises
        </strong>
      </p>
    </div>
  )
}

const Course = (props) => {
  console.log(props)
  return (
    <div>
      <Header course={props.course.name} />
      <Content parts={props.course.parts} />
      <Total parts={props.course.parts} />
    </div>
  )
}

export default Course