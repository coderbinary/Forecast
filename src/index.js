import './styles.css';
let location = "Bangkok";
const iconContext = import.meta.webpackContext('./icons', {
  recursive: false,
  regExp: /\.svg$/,
});

const iconMap = {};
iconContext.keys().forEach((key) => {
  const iconName = key.replace('./', '').replace('.svg', '');
  iconMap[iconName] = iconContext(key);
});
function updateForecastUI(daysData) {
  // Select all the direct div children of your forecast container
  const forecastCards = document.querySelectorAll('.six-day-forecast > div');

  forecastCards.forEach((card, index) => {
    // We want daysData[1] for the first card, daysData[2] for the second, etc.
    const dayData = daysData[index + 1]; 
    if (!dayData) return;

    // 1. Handle the Day Label (TOM vs FRI)
    const dayP = card.querySelector('p:first-child');
    if (index === 0) {
      dayP.textContent = 'TOM';
    } else {
      const date = new Date(dayData.datetime + 'T00:00:00');
      dayP.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase();
    }

    // 2. Handle the Icon
    const img = card.querySelector('.small-icon img');
    const iconID = dayData.icon;
    img.src = iconMap[iconID] || iconMap['cloudy'];
    img.alt = dayData.conditions;

    // 3. Handle the Temp Range (max/min)
    const tempP = card.querySelector('.temp-range');
    const max = Math.round(dayData.tempmax);
    const min = Math.round(dayData.tempmin);
    tempP.textContent = `${max}° / ${min}°`;
  });
}
function displayFetchedData(data){
  console.log(data);
  cityName.textContent = data.address;
  heroIcon.src = iconMap[data.days[0].icon];
  heroTemp.textContent = Math.round(data.days[0].temp) + '°C';
  heroConditions.textContent = data.days[0].conditions;
  windSpeed.textContent = Math.round(data.days[0].windspeed) + ' km/h';
  humidity.textContent = Math.round(data.days[0].humidity) + '%'
  if(Math.round(data.days[0].uvindex) <= 2){
    uvIndex.textContent = 'LOW' ;
  }else if(Math.round(data.days[0].uvindex) <= 5 && Math.round(data.days[0].uvindex) >= 3){
    uvIndex.textContent = 'MODERATE' ;
  }else if(Math.round(data.days[0].uvindex) >= 6 && Math.round(data.days[0].uvindex) <= 7){
    uvIndex.textContent = 'HIGH' ;
  }else if(Math.round(data.days[0].uvindex) >= 8 && Math.round(data.days[0].uvindex) <= 10){
    uvIndex.textContent = 'VERY HIGH' ;
  }else{
    uvIndex.textContent ='EXTREME' ;
  } 
  visibility.textContent = Math.round(data.days[0].visibility) + ' km';
  updateForecastUI(data.days);
}
(async function firstFetch() {
  const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?unitGroup=metric&key=TNVTZQWRLG4Y9FLFSVFN8LGGU&include=days`);
  const data = await response.json();
  return data;
})().then(displayFetchedData)
    .catch(error => {
      console.error(error);
    });
const cityName = document.querySelector("#content > .city");
const heroIcon = document.querySelector(".hero > .weather-icon > img");
const heroTemp = document.querySelector(".hero > .temp");
const heroConditions = document.querySelector(".hero > .conditions");
const windSpeed = document.querySelector(".WHUV > .wind > .wind-value");
const humidity = document.querySelector(".WHUV > .humidity > .humidity-value");
const uvIndex = document.querySelector(".WHUV > .uv-index > .uv-index-value");
const visibility = document.querySelector(".WHUV > .visibility > .visibility-value");
const searchBar = document.querySelector(".searchbar");
const notFound = document.querySelector(".not-found");
async function handleSearch() {
  location = searchBar.value.trim();
  if (!location) return;

  try {
    // Show a loading state (optional but looks good)
    searchBar.placeholder = "Searching...";
    
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?unitGroup=metric&key=TNVTZQWRLG4Y9FLFSVFN8LGGU&include=days`); 
    const data = await response.json();
    console.log(data);
    // Reset the search bar
    searchBar.value = ''; 
    searchBar.placeholder = "Search city...";
    searchBar.blur(); // Dismisses mobile keyboard
    return data;
  } catch (error) {
    console.error("Search failed:", error);
    searchBar.placeholder = "Search city...";
    searchBar.value = '';
  }
}
searchBar.addEventListener("keydown",(event)=>{
  if(event.key === "Enter")
  {
    handleSearch()
      .then(displayFetchedData)
      .catch(()=>{
        notFound.showModal();
        setTimeout(() => {
          notFound.close();
        }, 1000);
      });
  }
})

