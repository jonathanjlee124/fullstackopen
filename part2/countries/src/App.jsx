import { useEffect, useState } from 'react'
import countryService from './services/countries'
import CountriesView from './components/CountriesView'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    countryService.getAll().then(allCountries => {
      setCountries(allCountries)
    })
  }, [])

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
    setSelectedCountry(null)
  }

  const filtered = selectedCountry
  ? [selectedCountry]
  : countries.filter(country =>
      country.name.common.toLowerCase().includes(query.toLowerCase())
    )

  return (
    <div>
      <div>
        find countries <input value={query} onChange={handleQueryChange} />
      </div>
      <CountriesView
        countries={filtered}
        onShow={setSelectedCountry}
      />
    </div>
  )
}

export default App