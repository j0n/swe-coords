# Swee-coords
NPM module to convert Sweref 99-cordinates to lat/lang. 

Uses Arnold Andreasson, info@mellifica.se converter.
## usage
<pre>
var sweCoords = require('swe-coords');

var coords = sweCoords.toLatLng('N 7308014', 'E 518078');

console.log(coords) // output { lat: 54.234324, lng: 53.23234 } or what the cord is
</pre>
