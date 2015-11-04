
'use strict';

$(document).ready(init);

function init() {
  $('form#get-weather').submit(lookupPlace);
  $('form#get-weather input#country').change(clearZip);
  $('form#get-weather input#city').change(clearZip);

  $('select#c-f').change(changeSys);

  cF = localStorage.cF;
  if (cF) {
    $('select#c-f').val(cF);
  }
  $country = $('input#country');
  $city = $('input#city');
  $zip = $('input#zip');

  lookupPlace();
}

var baseUrl = 'http://api.wunderground.com/api/de628b8ce5f1e01d/';
var $country;
var $city;
var $zip;
var cF;
var position;

function changeSys(event){
  localStorage.cF = cF = $(event.target).val();
  getCurrent();
  getForecast();
}

function clearZip() {
  $('form#get-weather input#zip').val('');
}

function lookupPlace() {
  var country = $country.val();
  var city = $city.val();
  var zip = $zip.val();
  var url = baseUrl + 'geolookup/q/';

  if (zip) {
    url += zip;
  }
  else if (country || city) {
    if (country) {
      url += country + '/';
    }

    if (city) {
      url += city + '/';
    }
  }
  else {
    url += 'autoip';
  }
  url += '.json';

  $.ajax({
    method: 'GET',
    url: url,
    success: function(data, status) {
      position = data.location;
      if (position) {
        $country.val(position.country);
        $city.val(position.city);
        $zip.val(position.zip);
        getCurrent();
        getForecast();
      }
      else {
        if (data.response.results) {
          console.log(data.response.results);
        }
        else {
          console.log('Cannot find position.');
        }
      }
    },
    error: function (promise, status, error) {
      console.log('status', status);
    }
  });

  return false;
}

function createUrl(url) {
  url = baseUrl + url;
  if (position.country === 'US') {
    url += position.state + '/' + position.zip + '.json';
  }
  else {
    url += position.country + '/' + position.city + '.json';
  }
  return url;
}

function getCurrent() {
  var url = createUrl('conditions/q/');
  $.ajax({
    method: 'GET',
    url: url,
    success: function(data, status) {
      showCurrent(data.current_observation);
    },
    error: function (promise, status, error) {
      console.log('status', status);
    }
  });
}

function getForecast() {
  var url = createUrl('forecast/q/');
  $.ajax({
    method: 'GET',
    url: url,
    success: function(data, status) {
      showForecast(data.forecast);
    },
    error: function (promise, status, error) {
      console.log('status', status);
    }
  });
}

function getTemp(c, f) {
  if (cF === 'C') {
    return c + '°C';
  }
  else {
    return f + '°F';
  }
}

function showCurrent(current) {
  if (!current) {
    return;
  }

  $('div.current span#city').text(position.city);
  $('div.current img#icon').attr('src', current.icon_url);

  var temp = getTemp(current.temp_c, current.temp_f);
  $('div.current span#temp').text(temp);
  $('div.current').removeClass('hidden');
}

function showForecast(forecast) {
  if (!forecast) {
    return;
  }

  var sf = forecast.simpleforecast.forecastday;
  for (var i = 0; i < sf.length; ++i) {
    var sf_ = sf[i];
    var $div = $('div#f' + i);
    var $img = $div.find('img#icon');
    $img.attr('src', sf_.icon_url);
    $img.attr('alt', sf_.conditions);
    $img.attr('title', sf_.conditions);
    var date = sf_.date.monthname_short + ' ' + sf_.date.day + ' ' + sf_.date.hour + ':' + sf_.date.min;
    $div.children('div#date').text(date);
    var temp = getTemp(sf_.high.celsius, sf_.high.fahrenheit);
    $div.find('span#h-temp').text(temp);
    var temp = getTemp(sf_.low.celsius, sf_.low.fahrenheit);
    $div.find('span#l-temp').text(temp);
  }
}
