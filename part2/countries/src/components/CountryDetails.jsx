import { useEffect, useState } from 'react'
import axios from 'axios'

const CountryDetails = ({ country }) => {
  const languages = Object.values(country.languages ?? {})
  const [weather, setWeather] = useState(null)
  const capital = country.capital?.[0]
  const latlng = country.capitalInfo?.latlng
  const apiKey = import.meta.env.VITE_OPENWEATHER_KEY

  useEffect(() => {
    if (!apiKey || !latlng || latlng.length < 2) return

    const [lat, lon] = latlng

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      )
      .then(response => {
        setWeather(response.data)
      })
  }, [apiKey, latlng])

  return (
    <div>
      <h1>{country.name.common}</h1>

      <div>Capital {capital}</div>
      <div>Area {country.area}</div>

      <h2>Languages:</h2>
      <ul>
        {languages.map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={`flag of ${country.name.common}`}
        width="150"
      />

      <h2>Weather in {capital}</h2>
      {weather ? (
        <div>
          <div>temperature {weather.main.temp} °C</div>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <div>wind {weather.wind.speed} m/s</div>
        </div>
      ) : (
        <div>loading weather...</div>
      )}
    </div>
  )
}

export default CountryDetails
