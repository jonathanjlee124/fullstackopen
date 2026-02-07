import CountryDetails from './CountryDetails'

const CountriesView = ({ countries, onShow }) => {
    if (countries.length > 10) {
      return <div>Too many matches, specify another filter</div>
    }

    if (countries.length > 1) {
      return (
        <div>
          {countries.map(country => (
            <div key={country.cca3}>
              {country.name.common}
              <button onClick={() => onShow(country)}>show</button>
            </div>
          ))}
        </div>
      )
    }

    if (countries.length === 1) {
      return <CountryDetails country={countries[0]} />
    }

    return null
  }

export default CountriesView