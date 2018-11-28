let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * register service worker
 **/
if ('serviceWorker' in navigator) {
    addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js');
    });
}


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
select.tabIndex = 3;
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
select.tabIndex = 4;
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  /**
   * when tiles are loaded, set tabIndex to a high number so tabbing skips over the map to the neighborhood filter
   */
  google.maps.event.addListener(self.map, "tilesloaded", function(){

    [].slice.apply(document.querySelectorAll('#map a')).forEach(function(item) {
        item.setAttribute('tabIndex', '999');
    });
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  /**
   * create code for responsive images and append them to the li element
   */
  const rImS = DBHelper.imageUrlForRestaurant(restaurant); // rImS = restaurant Image Source
  const picture = document.createElement("picture");

  if (restaurant.photograph) {
      // use a source element and give the browser 3 webp source options if webp is supported
      const webpSource = document.createElement('source');
      webpSource.sizes = "(min-width: 320px) 60vw, 100vw";
      webpSource.srcset = `${rImS.smallWEBP} 320w,
                    ${rImS.mediumWEBP} 540w,
                    ${rImS.largeWEBP} 800w`;
      webpSource.type = "image/webp";

      // use an image element for the default jpg option if webp is not supported
      // with srcset giving the browser 3 options of file size to choose from based on screen size
      const jpgSource = document.createElement('source');
      jpgSource.srcset = `${rImS.smallJPG} 320w,
                    ${rImS.mediumJPG} 540w,
                    ${rImS.largeJPG} 800w`;
      jpgSource.type = "image/jpg"
      picture.appendChild(webpSource);
      picture.appendChild(jpgSource);

  }

  const defaultImage = document.createElement('img');
  defaultImage.className = 'restaurant-small-img';
  defaultImage.src = 'img/restaurant-default.svg';
  defaultImage.type = 'image/svg';


  picture.appendChild(defaultImage);

  /*
  * use the name of the restaurant and cuisine type for the image alt text
   */
  defaultImage.alt = restaurant.name + " " + restaurant.cuisine_type + " restaurant";
  li.append(picture);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.tabIndex = 5;
  more.setAttribute('aria-label', restaurant.name + " more information");
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
