// set up sg map
let sgp = [1.35, 103.84];
let map = L.map('map').setView(sgp, 12);
map.setMaxBounds(map.getBounds());
// set min zoom based on screen size
let mq = window.matchMedia("(max-width: 768px)");
if (mq.matches) {
    map.setMinZoom(11); // mobile size
} else {
    map.setMinZoom(12); // desktop size
}

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
}).addTo(map);

// create marker cluster layer
let markerClusterLayer = L.markerClusterGroup();

const openedStatus = "<span style='color: green'>Available</span>"
const closedStatus = "<span style='color: red'>Closed</span>"

function DateWithinInterval(startDate, endDate) {
    // check inputs are valid dates
    var isStartDateValid = moment(startDate, "D/M/YYYY").isValid();
    var isEndDateValid = moment(endDate, "D/M/YYYY").isValid();
    if (!isStartDateValid || !isEndDateValid) {
        return false;
    }
    
    const now = moment().format("D/M/YYYY");
    return moment(now).isBetween(startDate, endDate, undefined, "[]");
}

// load hawker markers into cluster layer
async function getHawkerLayer(csvData) {
    let response = await axios.get("data/hawker-centres.geojson");
    L.geoJson(response.data, {
        filter: function (feature, layer) {
            // filter away 'under construction' status
            return (!feature.properties.Description.toLowerCase().includes("under construction"));
        },
        onEachFeature: function (feature, layer) {
            let e = document.createElement('div');
            e.innerHTML = feature.properties.Description;
            let tds = e.querySelectorAll('td');

            // extract geojson info
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
                console.log('No record for ' + name);
            }

            // take care of records with no data
            let description = (hawkerData == "" || hawkerData == undefined) ? "" : hawkerData[0].description;
            let foodstalls = (hawkerData == "" || hawkerData == undefined) ? "" : hawkerData[0].foodstalls;
            // create a <span> tag for availability
            let status;
            if (hawkerData == "" || hawkerData == undefined) {
                status = openedStatus;
            } else {
                if (DateWithinInterval(hawkerData[0].q1_cleaningstartdate, hawkerData[0].q1_cleaningenddate) ||
                    DateWithinInterval(hawkerData[0].q2_cleaningstartdate, hawkerData[0].q2_cleaningenddate) ||
                    DateWithinInterval(hawkerData[0].q3_cleaningstartdate, hawkerData[0].q3_cleaningenddate) ||
                    DateWithinInterval(hawkerData[0].q4_cleaningstartdate, hawkerData[0].q4_cleaningenddate) ||
                    DateWithinInterval(hawkerData[0].others_startdate, hawkerData[0].others_enddate)) {
                        status = closedStatus;
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

            layer.bindPopup(`<table class="table table-striped">
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
                </tr>
                <tr>
                    <th>
                        Availability:
                    </th>
                    <td>
                        ${status}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <img src="${photourl}" style="width: 300px" />
                    </td>
                </tr>
            </table>`);
        }
    }).addTo(markerClusterLayer);
};

// load CSV file data and combine with geojson
function loadHawkerData() {
    // papaparse is used to parse csv file into json string
    Papa.parse('data/dates-of-hawker-centres-closure.csv', {
        download: true,
        header: true,
        complete: async function(results) {
            await getHawkerLayer(results.data);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    loadHawkerData();
    markerClusterLayer.addTo(map);
});

// popovers at footer links
$(function () {
    $('.popover-about').popover({
        html: true,
        placement: 'top',
        title: 'About the site<a class="btn-close btn-sm close" role="button" aria-label="Close"></a>',
        content: 'HelloHelloHelloHelloHelloHelloHello'
    }).on('click', function (e) {
        // hide all other popovers
        $('[data-toggle="popover"]').not(e.target).popover('hide');
    });

    $('.popover-feedback').popover({
        html: true,
        sanitize: false,
        placement: 'top',
        title: 'Summit your feedback<a class="btn-close btn-sm close" role="button" aria-label="Close"></a>',
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
        content: 'HelloHelloHelloHelloHelloHelloHello'
    }).on('click', function (e) {
        // hide all other popovers
        $('[data-toggle="popover"]').not(e.target).popover('hide');
    });

    $(document).on('click', '.popover .close', function () {
        $(this).parents('.popover').popover('hide');
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
document.getElementById('search-box').appendChild(
    document.querySelector(".leaflet-control-geocoder")
);
