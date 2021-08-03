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

// load hawker markers into map
async function getHawkerLayer() {
    let response = await axios.get("data/hawker-centres.geojson");
    let hawkerLayer = L.geoJson(response.data, {
        filter: function (feature, layer) {
            // filter away 'under construction' status
            return (!feature.properties.Description.toLowerCase().includes("under construction"));
        },
        onEachFeature: function (feature, layer) {
            let e = document.createElement('div');
            e.innerHTML = feature.properties.Description;
            let tds = e.querySelectorAll('td');

            // extract info
            let photourl = tds[17].innerHTML;
            let name = tds[19].innerHTML;
            let address = tds[29].innerHTML;

            // some names contain address, need to filter away
            let regEx = /\(.+\)/;
            if (regEx.test(name)) {
                // remove all before (
                regEx = /[\s\S]*\(/;
                name = name.replace(regEx, '');
                // remove last char )
                name = name.slice(0, -1);
            }

            layer.bindPopup(`<table>
                <tr>
                    <th style="padding:5px">
                        Name:
                    </th>
                    <td style="padding:5px">
                        ${name}
                    </td>
                </tr>
                <tr>
                    <th style="padding:5px">
                        Address:
                    </th>
                    <td style="padding:5px">
                        ${address}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <img src="${photourl}" style="width: 300px" />
                    </td>
                </tr>
            </table>`);
        }
    }).addTo(map);
};

window.addEventListener('DOMContentLoaded', async () => {
    await getHawkerLayer();
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

