//declare variables
console.log('connected');
cityArray = [];

var cityFormEl = document.querySelector('#city-form');
var nameInputEl = document.querySelector('#city-name');

//defines weatherContainer so that it can be unhidden
var weatherContainer = document.querySelector('#weather-container');

var currentCityEl = document.querySelector('#current-city');
var currentDateEl = document.querySelector('#current-date');
var currentIconEl = document.querySelector('#current-icon');
var currentTempEl = document.querySelector('#current-temp');
var currentWindEl = document.querySelector('#current-wind');
var currentHumidityEl = document.querySelector('#current-humidity');
var currentUvEl = document.querySelector('#current-uvi');
var currentUvColorEl = document.querySelector('#current-uvi-color');

var cityButtonsEl = document.querySelector('#city-button-container');

var dailyWeatherContainerEl = document.querySelector(
    '#daily-weather-container'
);

var loadSearchHistory = function () {
    cityArray = JSON.parse(localStorage.getItem('city'));

    if (cityArray) {
        for (let i = 0; i < cityArray.length; i++) {
            const {name, lat, lon} = cityArray[i];
            var citybutton = document.createElement('button');
            citybutton.textContent = name;
            citybutton.type = 'button';
            citybutton.style = 'background-color: #9caea9';
            citybutton.className = 'city-button';
            citybutton.dataset.name = name;
            citybutton.dataset.lat = lat;
            citybutton.dataset.lon = lon;
            cityButtonsEl.appendChild(citybutton);

            citybutton.addEventListener('click', function (event) {
                var cityName = event.target.dataset.name;
                getCity(cityName);
                dailyWeatherContainerEl.innerHTML = '';
                weatherContainer.style = 'contents';
                cityButtonsEl.innerHTML = '';
                loadSearchHistory();
            });
        }
    } else {
        cityButtonsEl.display = 'none';
        return;
    }
};

var formSubmitHandler = function (event) {
    event.preventDefault();
    weatherContainer.style = 'contents';
    // get value from input element
    var cityinput = nameInputEl.value.trim();
    var cityname = cityinput.toUpperCase();

    if (cityname) {
        dailyWeatherContainerEl.innerHTML = '';
        weatherContainer.style = 'contents';
        getCity(cityname);
        // nameInputEl.value = '';
    } else {
        alert('Please enter a City name');
    }
};

var getCity = function (city) {
    console.log(city);
    fetch(
        'http://api.openweathermap.org/geo/1.0/direct?q=' +
            city +
            '&appid=ffaf5b955f9d8df5264787907b066904'
    ).then(function (response) {
        response.json().then(function (data) {
            getWeather(data);
            saveSearch(data);
        });
    });
};

var saveSearch = function (data) {
    const {lat, lon, name} = data[0];
    var cityDetails = {name: name, lat: lat, lon: lon};

    cityArray = JSON.parse(localStorage.getItem('city'));

    if (!cityArray) {
        cityArray = [];
        cityArray.push(cityDetails);
        localStorage.setItem('city', JSON.stringify(cityArray));
        var citybutton = document.createElement('button');
        citybutton.textContent = name;
        citybutton.type = 'button';
        citybutton.style = 'background-color: #9caea9';
        citybutton.className = 'city-button';
        citybutton.dataset.name = name;
        citybutton.dataset.lat = lat;
        citybutton.dataset.lon = lon;
        cityButtonsEl.appendChild(citybutton);
    } else if (
        cityArray &&
        cityArray.findIndex((city) => city.name === name) == -1
    ) {
        cityArray.push(cityDetails);
        localStorage.setItem('city', JSON.stringify(cityArray));
        var citybutton = document.createElement('button');
        citybutton.textContent = name;
        citybutton.type = 'button';
        citybutton.style = 'background-color: #9caea9';
        citybutton.className = 'city-button';
        citybutton.dataset.name = name;
        citybutton.dataset.lat = lat;
        citybutton.dataset.lon = lon;
        cityButtonsEl.appendChild(citybutton);
    } else {
        return;
    }
};

var getWeather = function (data) {
    const {lat, lon, name} = data[0];

    fetch(
        'https://api.openweathermap.org/data/2.5/onecall?lat=' +
            lat +
            '&lon=' +
            lon +
            '&exclude=minutely,hourly,alerts&units=metric&appid=ffaf5b955f9d8df5264787907b066904'
    ).then(function (response) {
        response.json().then(function (data) {
            displayCurrentWeather(data, name);
            displayForecast(data, name);
        });
    });
};

var displayCurrentWeather = function (data, name) {
    const icon = data.current.weather[0].icon;
    const {dt, temp, wind_speed, humidity, uvi} = data.current;

    var date = new Date(dt * 1000);
    var formattedDate = date.toDateString();

    currentCityEl.textContent = name;
    currentDateEl.textContent = '(' + formattedDate + ')';
    currentIconEl.src = 'http://openweathermap.org/img/wn/' + icon + '@2x.png';
    currentTempEl.textContent = 'Temp: ' + temp + ' °C';
    currentWindEl.textContent = 'Wind: ' + wind_speed + ' meters/sec';
    currentHumidityEl.textContent = 'Humidity: ' + humidity + '%';
    currentUvEl.textContent = 'UV Index: ';
    currentUvEl.style.display = 'inline';
    currentUvColorEl.textContent = uvi;
    currentUvColorEl.style.display = 'inline';

    if (uvi <= 2) {
        currentUvColorEl.style.backgroundColor = '#98D600';
    } else if (uvi >= 2 && uvi <= 5) {
        currentUvColorEl.style.backgroundColor = '#FECD2F';
    } else if (uvi >= 5 && uvi <= 7) {
        currentUvColorEl.style.backgroundColor = '#E98600';
    } else if (uvi >= 7 && uvi <= 10) {
        currentUvColorEl.style.backgroundColor = '#DE3E2A';
    } else {
        currentUvColorEl.style.backgroundColor = '#9161C9';
    }
};

var displayForecast = function (data) {
    // loop over forecasts
    for (var i = 1; i < 6; i++) {
        var dailyDate = data.daily[i].dt;
        var dailyIcon = data.daily[i].weather[0].icon;
        var dailyTemp = data.daily[i].temp.day;
        var dailyWind = data.daily[i].wind_speed;
        var dailyHumidity = data.daily[i].humidity;

        dailyWeatherContainerEl.classList.add('card');
        // create a container for each daily forecast
        var dailyEl = document.createElement('div');
        dailyEl.className = 'daily-card';

        var dailyWeatherListEl = document.createElement('ul');
        dailyWeatherListEl.className = 'list-unstyled flex-row';

        var date = new Date(dailyDate * 1000);
        var formattedDate = date.toDateString();
        // create an element to hold each Date Title
        var dailyDateEl = document.createElement('li');
        dailyDateEl.textContent = formattedDate;

        var dailyIconContainerEl = document.createElement('li');

        var dailyIconEl = document.createElement('img');
        dailyIconEl.src =
            'http://openweathermap.org/img/wn/' + dailyIcon + '@2x.png';

        var dailyTempEl = document.createElement('li');
        dailyTempEl.textContent = 'Temp: ' + dailyTemp + ' °C';

        var dailyWindEl = document.createElement('li');
        dailyWindEl.textContent = 'Wind: ' + dailyWind + 'meters/sec';

        var dailyHumidityEl = document.createElement('li');
        dailyHumidityEl.textContent = 'Humidity: ' + dailyHumidity + '%';

        // append to container
        dailyIconContainerEl.appendChild(dailyIconEl);
        dailyWeatherListEl.appendChild(dailyDateEl);
        dailyWeatherListEl.appendChild(dailyIconContainerEl);
        dailyWeatherListEl.appendChild(dailyTempEl);
        dailyWeatherListEl.appendChild(dailyWindEl);
        dailyWeatherListEl.appendChild(dailyHumidityEl);

        dailyEl.appendChild(dailyWeatherListEl);
        // append container to the dom
        dailyWeatherContainerEl.appendChild(dailyEl);
    }
};

loadSearchHistory();
cityFormEl = addEventListener('submit', formSubmitHandler);
