# HawkerGoWhere.sg Infosite Project #

## Purpose ##

The rationale for this project is to create a website to provide user-friendly features for searching information related to hawker centers in Singapore.
The website is designed to be used on the go or for planning for a later trip.

## Strategy ##

### Context ###

The website is a single page site mainly created in HTML5 and CSS3.

The website provides features such as:
* Interactive map
* Detailed information of each hawker center 
* Location search
* Routing and step-by-step directions to destination

### Identifying Users ###

The main audience for the website is local users who like to explore unfamiliar areas of Singapore for hawker food. It also caters
to first-time visitors to Singapore who are interested in exploring hawker culture.

### Identifying Users' Needs and Goals ###

The main goal of the users is to find the location of desired hawker center and get there.

To do that, they need the address and directions. If they are unfamiliar with the area, they need to know landmarks or visual 
information.

Also, users may want to know if an area has a high congregation of hawker centers or the number of stalls in each hawker center or 
whether there is a presence of a market, so as to facilitate the decision if the trip is worthwhile. Users would also want to know 
if the hawker center is in operation and not closed for washing or renovation.

### Identifying Owners' Goals ###

Site owners' goal is mainly to raise awareness and provide support to Singapore's hawker culture.

The website should provide more than enough information, which is easy to retrieve, so as to encourage people to visit a hawker center.

### User Stories ###

As a user, I would like to:
* Find the nearest hawker centers in my location
* Find information of a particular hawker center, such as location, size or picture
* Check if a particular hawker center also provides a market for grocery needs
* Check if a particular hawker center is in operation today and when will it reopen if closed
* Get directions to a particular hawker center

## Demo ##

A live website can be accessed here: https://waihouc.github.io/Project-Assignment-1/

## Scope ##

### Current Feature List ###

1.	Interactive Map

The interactive map provides the overall view of hawker center locations in Singapore. The interactive map also provides a control 
at the top right corner to filter between ‘Hawker only’ and ‘Hawker and Marker’ categories. 

2.	Marker Popups

Marker popups provide detailed information about a hawker center such as:
* Name
* Address
* Description
* Number of hawker and market stalls
* Availability: whether it is in operation or not
* Estimated date of reopening
* Image of the hawker center

3.	Search Bar

The search bar allows users to input a location query to search on the map. The search bar displays search results in a dropdown for user selection.
Upon selection, the map will focus and drop a pin on the selected area.

4.	Routing and Direction Information

This feature can be found inside individual popups by clicking the ‘Get Directions’ button. The feature displays the fastest route from user 
selected starting point on the map to the hawker center as its destination. Step-by-step directions are listed in a textbox below the map.

5.	Submit Feedback and Site Information

Users can submit feedback to the site owner by clicking ‘Give Feedback’ link found on the right side of the site footer. 
Other site information can also be found here.

6.	Social Media Links

Media-savvy users can connect with site owners using social media links found on the left side of the site footer.

### Future Feature List ###

1.	Food recommendations feature can be added in the future. The information would be placed beside the Direction Information area.

2.	Hawker ratings can be considered a useful feature to be added in the future. This improves user interaction in the site.

3.	Direction information feature can be improved with directions for different mode of transport like on foot, driving or public transport.

## Structure ##

### UX ###

The site is designed to be a single page linear structure. The aim is to be user-friendly and allow users to retrieve information with minimal clicking. 
It also caters for a mobile-friendly website. 

The site is split into 3 parts: the interactive map, the search box and direction information section. 

The map is placed on top because it is the element with the most user interaction and information availability. The map is displayed with a maximum zoom
of 11 for mobile and 12 for desktop and tablet users. This will display the whole of Singapore nicely. For a local who is familiar to Singapore, the user
can immediately zoom in and out of the map to a specific location and get hawker information from marker popups. All markers are clustered on the map for
a less cluttered interface. The map provides a control to show all hawker centers, or filter for hawker only places or hawker and market hybrid places.

Each hawker center is represented by a unique marker: ‘Hawker only’ pin (represented by utensils icon) or ‘Hawker and Market’ pin 
(represented by shopping cart icon). Clicking the pin reveals a popup with information displayed in a tabular format.

The search box is located below the map. This feature is useful for people who not familiar with Singapore. User can simply enter a query in the box and
perform a search. Search results are displayed in a dropdown below the search box for user selection. Upon selection, the map will focus and drop a pin 
on the selected area.

Below the search box, the section is reserved for direction information. The feature can be accessed in a marker popup. User starts by clicking 
“Get directions’ button. User is prompted to click on a point in the map as its starting point. The popup closes and a route appears on the map from
the starting point to the hawker center as its destination. User can scroll down to view the travel directions given. User can click the ‘Clear’ button 
to reset the query.

### UI ###

The website is responsive to both mobile and desktop screens. In mobile, all elements are shrunk to fit the screen perfectly. In desktop screen, 
all elements will be aligned in the center.

The header, main body and footer are given different colours for good contrast. The body is split into 3 sections, each with its own colour. 
Light colours are used, so that they do not distract users and put focus on the information displayed. The chosen colours are based on research found 
in this article: https://www.newidea.com.au/colours-that-go-with-orange

The map is given the most estate space because it gives the most user interaction and information displayed. The font family used is mainly 
Arial, Helvetica and Verdana with some bold fonts for headers.

Footer links are placed horizontally so as to keep the footer narrow. This is to minimize scrolling for mobile users.
The wireframes of the website are shown below:

![Desktop wireframe](https://github.com/waihouC/Project-Assignment-1/blob/main/images/readme/Desktop_Wireframe.jpg)

![Mobile wireframe](https://github.com/waihouC/Project-Assignment-1/blob/main/images/readme/Mobile_Wireframe.jpg)

### Technologies Used ###

The programming languages, frameworks, tools and APIs used in the creation of the website are listed below:

**UI**
* HTML5
* CSS3
* JavaScript
* jQuery
* Bootstrap
* Bootstrap Social
* Font Awesome

**Data Processing**
* Moment.js
* Nodejs Axios
* Nodejs CSVTOJSON

**Map, routing and search**
* Leaflet
* Esri Leaflet
* ArcGIS location services

## Testing ##

Testing is done mainly on the following devices, and in conjunction with Chrome Developer Console:
* Google Chrome on desktop
* Microsoft Edge on desktop
* Google Chrome on Samsung S21+
* Safari on iPhone X

1. **Page On Load**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Open a browser and enter URL: https://waihouc.github.io/Project-Assignment-1/ | Website is loaded with map containing clusters of both hawker only icons and hawker and market icons. Radio button for **All** selection in layer control is checked.

2. **Markers, Clusters and Popups**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Click on a marker. | Popup with hawker information is displayed.
2   | Click on 'X' on popup. | Popup closes.
3   | Click on a cluster marker. | Map zooms in to focus and displays more markers.

3. **Layer Control**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Select **Hawker Only** radio button. | Hawker and Market pin icons are removed, displaying only Hawker Only pin icons.
2   | Select **Hawker & Market** radio button. | Hawker Only pin icons are removed, displaying only Hawker and Market pin icons.
3   | Select **All** radio button. | Both Hawker Only pin icons and Hawker and Market pin icons are displayed.

4. **Search Bar**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | In the search bar input, type in "maxwell road" and press **Enter**. | A list of search results appears under the search bar.
2   | Click on the first option. | Map drops a pin and zooms in to Maxwell Road.

5. **Get Directions**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Click on a marker. | Popup with hawker information is displayed.
2   | Click on **Get Directions** button. | A prompt appears on the top right corner of the map. The prompt displays "Click on the map to create a start point.".
3   | Click anywhere on the map. | A pin appears at the click location and create a route to the selected hawker center pin. Popup closes. Direction information is displayed in textbox below the search bar.
4   | Click **Clear** button beside textbox. | Start pin, route and direction information are removed.

6. **Submit Feedback**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Scroll down to footer and click on **Give Feedback** link. | "Give your feedback" popover appears.
2   | Enter input in the textbox and click **Submit** button. | Input is removed and "Thank you for your feedback!" message beside Submit button.

7. **Site Information**

No. | Testing steps | Expected result
--- | ------------- | ----------------
1   | Scroll down to footer and click on **About Us** link. | "About Us" popover appears.
2   | Click on **Contact Us** link. | "Contact Us" popover appears.

## Deployment ##

The project is deployed using GitHub Pages. You can download a copy to run locally or fork a copy to your repository.

### Download/Clone ###

1. Click **Code** button, click **Download Zip** or clone the project with the given URL using this command:
```
$ git clone <https_url>
```
2. Have Node.js and npm installed. Install **http-server** by running this command in CMD:
```
npm install http-server -g
```
3. Navigate to the path of the downloaded folder in CMD and run command:
```
http-server
```
4. To start the website, run command:
```
http-server index.html
```

### Forking ###

1. Click Fork button at top-right corner.
2. Click Settings tab.
3. Go to Github Pages settings.
4. At source, select a branch and click Save button.
5. The site is ready to be accessed at the given URL.

## Credits ##

This project is made possible with the following help:

### Data ###

CSV and GEOJSON hawker data are taken from https://data.gov.sg/

### Images ###

* https://www.flaticon.com/free-icon/food_333293
* https://www.pinclipart.com/pindetail/hJTxJJ_orange-map-pin-orange-location-icon-png-clipart/
* https://www.freeiconspng.com/img/4892
* https://icon-icons.com/icon/placeholder-map-marker-pin-location/142416

### Code ###

* https://developers.arcgis.com/esri-leaflet/route-and-directions/find-a-route-and-directions/
* https://github.com/perliedman/leaflet-control-geocoder/tree/1.13.0#api
* https://stackoverflow.com/questions/66489387/leaflet-geosearch-search-control-outside-the-map-container
* https://stackoverflow.com/questions/61496677/leaflet-js-changing-the-size-of-the-geocoder-control
* https://stackoverflow.com/questions/16150163/show-one-popover-and-hide-other-popovers
* https://stackoverflow.com/questions/13202762/html-inside-twitter-bootstrap-popover
* https://stackoverflow.com/questions/48291870/how-to-add-custom-ui-to-leaflet-map

**And instructors’ advice from Trent Global College.**
