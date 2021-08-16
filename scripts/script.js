// for map routing
const apiKey = "AAPK9abd9dbf54824a1e8fe9aa72c37a2e80DXEKAeaFoJ0DHezwYFSklOyOOyaBnnRbvQonKCy2vFkIJCDRqxKYsOHqQlnHWDme";
const basemapEnum = "ArcGIS:Navigation";

// set up sg map
let sgp = [1.35, 103.84];
let map = L.map('map').setView(sgp, 12);
map.setMaxBounds(map.getBounds().pad(1));
// set min zoom based on screen size
let mq = window.matchMedia("(max-width: 768px)");
if (mq.matches) {
    map.setMinZoom(11); // mobile size
} else {
    map.setMinZoom(12); // desktop or tablet size
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
}).addTo(map);

L.esri.Vector.vectorBasemapLayer(basemapEnum, {
    apiKey: apiKey
}).addTo(map);

// create 'hawker only' icon
const hawkerIcon = L.icon({
    iconUrl: 'images/hawker-pin-icon.png',
    iconSize: [40, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-2, -33]
});

// create 'hawker and market' icon
const marketIcon = L.icon({
    iconUrl: 'images/market-pin-icon.png',
    iconSize: [25, 42],
    iconAnchor: [10, 42],
    popupAnchor: [3, -35]
});

// create start icon
const startIcon = L.icon({
    iconUrl: 'images/start-pin-orange.png',
    iconSize: [25, 42],
    iconAnchor: [0, 0]
});

// create marker cluster layer groups
let defaultClusterLayer = L.markerClusterGroup();
let hawkerClusterLayer = L.markerClusterGroup();
let marketClusterLayer = L.markerClusterGroup();

// create layer groups for map routing
let startPointLayer = L.layerGroup();
let routeLinesLayer = L.layerGroup();

const WAIT = "wait" // indicate map waiting for map routing
const START = "start" // indicate map creating start point

let currentStep = WAIT;
let startCoords, endCoords;

const openedStatus = "<span style='color: green'>Open</span>"
const closedStatus = "<span style='color: red'>Closed</span>"

function DateWithinInterval(start, end) {
    let startDate = moment(start, 'D/M/YYYY');
    let endDate = moment(end, 'D/M/YYYY');

    // check inputs are valid dates
    var isStartDateValid = startDate.isValid();
    var isEndDateValid = endDate.isValid();
    if (!isStartDateValid || !isEndDateValid) {
        return false;
    }
    
    return moment().isBetween(startDate, endDate, undefined, '[]');
}

// load CSV file data
async function loadCSVHawkerData() {
    let response = await axios.get('data/dates-of-hawker-centres-closure.csv');
    let json = await csv().fromString(response.data);
    return json;
}

// load GEOJSON file data
async function loadGEOJSONHawkerData() {
    let response = await axios.get("data/hawker-centres.geojson");
    let data = response.data.features.filter(function(feature) {
        // filter away 'under construction' status
        return (!feature.properties.Description.toLowerCase().includes("under construction"));
    })
    return data;
}

// load all hawker markers into corresponding cluster layers
function createMapLayers(csvData, geoData) {
    L.geoJson(geoData, {
        onEachFeature: function (feature, layer) {
            let e = document.createElement('div');
            e.innerHTML = feature.properties.Description;
            let tds = e.querySelectorAll('td');

            // extract geojson info
            // coordinates format: lnglat
            let coordinates = [ feature.geometry.coordinates[0], feature.geometry.coordinates[1] ];
            let photourl = tds[17].innerHTML;
            let name = tds[19].innerHTML;
            let address = tds[29].innerHTML;

            // extract csv info
            let hawkerData = csvData.filter(function(row) {
                return row.name == name;
            }).map(function(row) {
                return {
                    'name': row.name,
                    'description': row.description_myenv,
                    'foodstalls': row.no_of_food_stalls,
                    'marketstalls': row.no_of_market_stalls,
                    'q1_cleaningstartdate': row.q1_cleaningstartdate,
                    'q1_cleaningenddate': row.q1_cleaningenddate,
                    'q2_cleaningstartdate': row.q2_cleaningstartdate,
                    'q2_cleaningenddate': row.q2_cleaningenddate,
                    'q3_cleaningstartdate': row.q3_cleaningstartdate,
                    'q3_cleaningenddate': row.q3_cleaningenddate,
                    'q4_cleaningstartdate': row.q4_cleaningstartdate,
                    'q4_cleaningenddate': row.q4_cleaningenddate,
                    'others_startdate': row.other_works_startdate,
                    'others_enddate': row.other_works_enddate
                }
            });
            // logging
            if (hawkerData == "" || hawkerData == undefined) {
                console.log("No record for " + name);
            }

            // take care of records with no data
            let description = (hawkerData == "" || hawkerData == undefined) ? "" : hawkerData[0].description;
            let foodstalls = (hawkerData == "" || hawkerData == undefined) ? "" : hawkerData[0].foodstalls;
            let marketstalls = (hawkerData == "" || hawkerData == undefined) ? "" : hawkerData[0].marketstalls;
            let hasMarket = (marketstalls != "" && marketstalls > 1) ? true : false;

            // use a <span> tag for availability
            let status;
            let estOpenDate; // indicate when hawker center reopen
            if (hawkerData == "" || hawkerData == undefined) {
                status = openedStatus;
            } else {
                if (DateWithinInterval(hawkerData[0].q1_cleaningstartdate, hawkerData[0].q1_cleaningenddate)) {
                    status = closedStatus;
                    // add 1 day to end date and convert to string
                    estOpenDate = moment(hawkerData[0].q1_cleaningenddate, 'D/M/YYYY').add(1, 'd');
                    estOpenDate = moment(estOpenDate).format('D/M/YYYY');
                } else if (DateWithinInterval(hawkerData[0].q2_cleaningstartdate, hawkerData[0].q2_cleaningenddate)) {
                    status = closedStatus;
                    // add 1 day to end date and convert to string
                    estOpenDate = moment(hawkerData[0].q2_cleaningenddate, 'D/M/YYYY').add(1, 'd');
                    estOpenDate = moment(estOpenDate).format('D/M/YYYY');
                } else if (DateWithinInterval(hawkerData[0].q3_cleaningstartdate, hawkerData[0].q3_cleaningenddate)) {
                    status = closedStatus;
                    // add 1 day to end date and convert to string
                    estOpenDate = moment(hawkerData[0].q3_cleaningenddate, 'D/M/YYYY').add(1, 'd');
                    estOpenDate = moment(estOpenDate).format('D/M/YYYY');
                } else if (DateWithinInterval(hawkerData[0].q4_cleaningstartdate, hawkerData[0].q4_cleaningenddate)) {
                    status = closedStatus;
                    // add 1 day to end date and convert to string
                    estOpenDate = moment(hawkerData[0].q4_cleaningenddate, 'D/M/YYYY').add(1, 'd');
                    estOpenDate = moment(estOpenDate).format('D/M/YYYY');
                } else if (DateWithinInterval(hawkerData[0].others_startdate, hawkerData[0].others_enddate)) {
                    status = closedStatus;
                    // add 1 day to end date and convert to string
                    estOpenDate = moment(hawkerData[0].others_enddate, 'D/M/YYYY').add(1, 'd');
                    estOpenDate = moment(estOpenDate).format('D/M/YYYY');
                } else {
                    status = openedStatus;
                }
            }

            // some names contain address, need to filter away
            let regEx = /\(.+\)/;
            if (regEx.test(name)) {
                // remove all before (
                regEx = /[\s\S]*\(/;
                name = name.replace(regEx, '');
                // remove last char )
                name = name.slice(0, -1);
            }

            // set html for popup
            let popupHTML = `<table class="table table-striped">
            <tr>
                <th>
                    Name:
                </th>
                <td>
                    ${name}
                </td>
            </tr>
            <tr>
                <th>
                    Address:
                </th>
                <td>
                    ${address}
                </td>
            </tr>
            <tr>
                <th>
                    Description:
                </th>
                <td>
                    ${description}
                </td>
            </tr>
            <tr>
                <th>
                    Number of food stalls:
                </th>
                <td>
                    ${foodstalls}
                </td>
            </tr>`;
            if (hasMarket) {
                popupHTML += `<tr>
                    <th>
                        Number of market stalls:
                    </th>
                    <td>
                        ${marketstalls}
                    </td>
                </tr>`;
            }
            popupHTML += `<tr>
                <th>
                    Availability:
                </th>
                <td>
                    ${status}
                </td>
            </tr>`;
            if (estOpenDate != "" && estOpenDate != undefined) {
                popupHTML += `<th>
                        Est. opening date:
                    </th>
                    <td>
                        ${estOpenDate}
                    </td>
                </tr>`;
            }
            popupHTML += `<tr>
                    <td colspan="2">
                        <img src="${photourl}" style="width: 300px" />
                    </td>
                </tr>
                <tfoot>
                    <td colspan="2">
                        <a class="btn btn-success active" role="button" onClick="getDirections('${coordinates}', '${name}')">Get Directions</a>
                    </td>
                </tfoot>
            </table>`;

            const popup = L.popup({
                closeOnClick: false
            }).setContent(popupHTML);
            layer.bindPopup(popup);
            
            if (hasMarket) {
                marketClusterLayer.addLayer(layer);
            }
            else {
                hawkerClusterLayer.addLayer(layer);
            }
        }
    }).addTo(defaultClusterLayer);
};

function addMapLayers() {
    let baseLayers = {
        "<span class='control-layers-text pe-4'>All</span>": defaultClusterLayer,
        "<span class='control-layers-text'>Hawker Only</span><img src='images/hawker-pin-icon.png' class='control-hawker-img' />": hawkerClusterLayer,
        "<span class='control-layers-text pe-1'>Hawker & Market</span><img src='images/market-pin-icon.png' class='control-market-img' />": marketClusterLayer
    };

    L.control.layers(baseLayers, null, {collapsed: false}).addTo(map);
    defaultClusterLayer.addTo(map);
}

window.addEventListener('DOMContentLoaded', async () => {
    // load all local hawker data
    let csv = await loadCSVHawkerData();
    let geojson = await loadGEOJSONHawkerData();

    // create map layers
    createMapLayers(csv, geojson);

    // customise marker icons
    hawkerClusterLayer.eachLayer(function(layer) {
        layer.setIcon(hawkerIcon);
    });
    marketClusterLayer.eachLayer(function(layer) {
        layer.setIcon(marketIcon);
    });

    // add map layers and control to map
    addMapLayers();
});

// Get Directions custom map control
L.Control.Direction = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'leaflet-container div-direction');
        div.innerHTML = "Click on the map to create a start point.";
        // make the control not clickable
        L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
        return div;
    },

    onRemove: function(map) {
        // nothing to do here
    }
});

L.control.direction = function(opts) {
    return new L.Control.Direction(opts);
};

let destName;
let divDirection;
let infoDirection = document.getElementById('info-direction');
let btnClear = document.getElementById('clear-direction');

// Get Directions button click
function getDirections(coordinates, name) {
    endCoords = [coordinates.split(',')[0], coordinates.split(',')[1]];
    destName = name;
    divDirection = L.control.direction({ position: 'topright'}).addTo(map);
    currentStep = START;
}

function updateRoute() {
    // create the arcgis-rest-js authentication object to use later
    const authentication = new arcgisRest.ApiKey({
      key: apiKey
    });

    // make the API request
    arcgisRest
      .solveRoute({
        stops: [startCoords, endCoords],
        endpoint: "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve",
        authentication
      })
      .then((response) => {
        // show the result route on the map
        routeLinesLayer.clearLayers();
        L.geoJSON(response.routes.geoJson).addTo(routeLinesLayer);
        routeLinesLayer.addTo(map);

        // show the result text directions in info-direction div
        let directionsHTML = response.directions[0].features.map((f) => f.attributes.text).join("<br/>");
        directionsHTML = directionsHTML.replace("Location 1", "Start point");
        directionsHTML = directionsHTML.replace("Location 2", "Destination");
        infoDirection.className = "d-block";
        infoDirection.innerHTML = "<p>From Start point to " + destName + ":</p>";
        infoDirection.innerHTML += directionsHTML;
        btnClear.className = "d-block";

        startCoords = null;
        endCoords = null;
      })
      .catch((error) => {
        console.error(error);
        alert("There was a problem using the route service. Try again later.");
    });
}

// When the map is clicked, get the start coordinates, 
// and pass start and end coordinates to the updateRoute function 
// which calls the REST endpoint.
map.on("click", (e) => {
    const coordinates = [e.latlng.lng, e.latlng.lat];

    if (currentStep === START) {
        startPointLayer.clearLayers();
        routeLinesLayer.clearLayers();

        L.marker(e.latlng, {icon: startIcon}).addTo(startPointLayer);
        startPointLayer.addTo(map);
        startCoords = coordinates;
        currentStep = WAIT;
        divDirection.remove(map);
    }

    // ensure both start and end coordinates are defined
    if (startCoords && endCoords) {
        updateRoute();
    }
});

btnClear.addEventListener('click', function() {
    startPointLayer.clearLayers();
    routeLinesLayer.clearLayers();
    infoDirection.innerHTML = "";
    currentStep = WAIT;
    divDirection.remove(map);
})

// popovers at footer links
$(function () {
    $('.popover-about').popover({
        html: true,
        placement: 'top',
        title: 'About Us<a class="btn-close btn-sm close" role="button" aria-label="Close"></a>',
        content: '<p>HawkerGoWhere.sg is an info-site about your favourite hawker places in Singapore.</p>' + 
                  '<p>Whether you are a local or a visitor to our sunny island, you can find all ' +
                  'you need to know to explore our UNESCO recognised hawker culture.</p>'
    }).on('click', function (e) {
        // hide all other popovers
        $('[data-toggle="popover"]').not(e.target).popover('hide');
    });

    $('.popover-feedback').popover({
        html: true,
        sanitize: false,
        placement: 'top',
        title: 'Give your feedback<a class="btn-close btn-sm close" role="button" aria-label="Close"></a>',
        content: function () {
            return $('#feedback-form').html();
        }
    }).on('click', function (e) {
        // hide all other popovers
        $('[data-toggle="popover"]').not(e.target).popover('hide');
    });

    $('.popover-contact').popover({
        html: true,
        placement: 'top',
        title: 'Contact Us<a class="btn-close btn-sm close" role="button" aria-label="Close"></a>',
        content: 'We are open for collaborations, ideas and new hires. Drop us an email at <a href="#">contact@hawkergowhere.sg</a>.'
    }).on('click', function (e) {
        // hide all other popovers
        $('[data-toggle="popover"]').not(e.target).popover('hide');
    });

    $(document).on('click', '.popover .close', function () {
        $(this).parents('.popover').popover('hide');
        // clear feedback form
        $('.popover #thanks-msg').attr('class', 'd-none');
        $('.popover #feedback-textarea').val("");
    });

    $(document).on('click', '.popover #feedback-submit', function () {
        var feedback = $.trim($('.popover #feedback-textarea').val());
        console.log(feedback);
        if (feedback !== "") {
            // show thank you message
            $('.popover #thanks-msg').attr('class', 'd-block ps-2');
            $('.popover #feedback-textarea').val("");
        }
    });
})

// Geocoder search
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const geocoder = L.Control.geocoder({
    // fix location to SG
    geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {countrycodes: 'SG'}
    }),
    defaultMarkGeocode: false,
    placeholder: 'Where would you like to go?',
    collapsed: false
}).addTo(map);

let searchLocation;
geocoder.on('markgeocode', function(e) {
    // remove previous searches
    if (searchLocation) {
        map.removeLayer(searchLocation);
    }

    const latlng = e.geocode.center;
    searchLocation = L.marker(latlng).addTo(map);
    map.fitBounds(e.geocode.bbox);

    // clear text input
    geocoder.setQuery("");
}).addTo(map);

// pull the geocoder search out of map
document.querySelector('#search-box').appendChild(
    document.querySelector(".leaflet-control-geocoder")
);