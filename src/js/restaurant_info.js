
import DBHelper from './dbhelper'
let restaurant;
var map;

/**
 * register service worker
 **/
if ('serviceWorker' in navigator) {
    addEventListener('load', function() {
        navigator.serviceWorker.register('../sw.js');
    });
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
 fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        self.map.addListener('tilesloaded', function() {
            const buttons = document.querySelectorAll('#gm-control-active');
            buttons.forEach(button => {
                button.childNodes.forEach(buttonChild => {
                    console.log(buttonChild);
                    if(buttonChild.element.nodeName.toLowerCase() === 'img') buttonChild.alt = "Google Maps Image";
                });
            });
            // images.forEach(function(image) {
            //     image.alt = "Google Maps Image";
            // });
        });
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

    //get responsive image urls from DBHelper
  const rImS= DBHelper.imageUrlForRestaurant(restaurant); // rImS = restaurant Image Source

  const picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img';

  if (restaurant.photograph) {
      const jpgSource = document.getElementById('jpg-source');
      jpgSource.sizes = "(min-width: 800px) 60vw, 100vw";
      jpgSource.srcset = `${rImS.smallJPG} 320w,
                    ${rImS.mediumJPG} 540w,
                    ${rImS.largeJPG} 800w`;
      jpgSource.type = "image/jpg";

      const webpSource = document.getElementById('webp-source');
      webpSource.sizes = "(min-width: 800px) 60vw, 100vw";
      webpSource.srcset = `${rImS.smallWEBP} 320w,
                    ${rImS.mediumWEBP} 540w,
                    ${rImS.largeWEBP} 800w`;
      webpSource.type = "image/webp";

  }
    const defaultImage = document.getElementById('default-restaurant-img');
      defaultImage.src = "img/restaurant-default.svg";
      defaultImage.type = "image/svg";

    /*
    * use the name of the restaurant and cuisine type for the image alt text
    */
    defaultImage.alt = restaurant.name + " " + restaurant.cuisine_type + " restaurant";


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// when google map has loaded, add an alt tag to the images
// this solution was suggested in a stack overflow forum:
// https://stackoverflow.com/questions/20714153/google-map-tiles-missing-alt-tag-causing-lower-accessibility-score


/**
 *
 *
 */
