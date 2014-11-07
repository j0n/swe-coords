// Author: Arnold Andreasson, info@mellifica.se
// Copyright (c) 2007-2013 Arnold Andreasson 
// License: MIT License as follows:
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// =============================================================================
// Javascript-implementation of "Gauss Conformal Projection 
// (Transverse Mercator), Krügers Formulas".
// - Parameters for SWEREF99 lat-long to/from RT90 and SWEREF99 
//   coordinates (RT90 and SWEREF99 are used in Swedish maps).
// Source: http://www.lantmateriet.se/geodesi/
 
var axis = null; // Semi-major axis of the ellipsoid.
var flattening = null; // Flattening of the ellipsoid.
var centralMeridian = null; // Central meridian for the projection.
var lat_of_origin = null; // Latitude of origin.
var scale = null; // Scale on central meridian.
var false_northing = null; // Offset for origo.
var false_easting = null; // Offset for origo.

var centraMeridian = require('./meridian')('tm');

// Conversion from geodetic coordinates to grid coordinates.
function geodetic_to_grid(latitude, longitude) {
	var x_y = new Array(2);
	if (centralMeridian == null) {
		return x_y;
	}
	// Prepare ellipsoid-based stuff.
	var e2 = flattening * (2.0 - flattening);
	var n = flattening / (2.0 - flattening);
	var a_roof = axis / (1.0 + n) * (1.0 + n*n/4.0 + n*n*n*n/64.0);
	var A = e2;
	var B = (5.0*e2*e2 - e2*e2*e2) / 6.0;
	var C = (104.0*e2*e2*e2 - 45.0*e2*e2*e2*e2) / 120.0;
	var D = (1237.0*e2*e2*e2*e2) / 1260.0;
	var beta1 = n/2.0 - 2.0*n*n/3.0 + 5.0*n*n*n/16.0 + 41.0*n*n*n*n/180.0;
	var beta2 = 13.0*n*n/48.0 - 3.0*n*n*n/5.0 + 557.0*n*n*n*n/1440.0;
	var beta3 = 61.0*n*n*n/240.0 - 103.0*n*n*n*n/140.0;
	var beta4 = 49561.0*n*n*n*n/161280.0;
	
	// Convert.
	var deg_to_rad = Math.PI / 180.0;
	var phi = latitude * deg_to_rad;
	var lambda = longitude * deg_to_rad;
	var lambda_zero = centralMeridian * deg_to_rad;
	
	var phi_star = phi - Math.sin(phi) * Math.cos(phi) * (A + 
					B*Math.pow(Math.sin(phi), 2) + 
					C*Math.pow(Math.sin(phi), 4) + 
					D*Math.pow(Math.sin(phi), 6));
	var delta_lambda = lambda - lambda_zero;
	var xi_prim = Math.atan(Math.tan(phi_star) / Math.cos(delta_lambda));
	var eta_prim = math_atanh(Math.cos(phi_star) * Math.sin(delta_lambda));
	var x = scale * a_roof * (xi_prim +
					beta1 * Math.sin(2.0*xi_prim) * math_cosh(2.0*eta_prim) +
					beta2 * Math.sin(4.0*xi_prim) * math_cosh(4.0*eta_prim) +
					beta3 * Math.sin(6.0*xi_prim) * math_cosh(6.0*eta_prim) +
					beta4 * Math.sin(8.0*xi_prim) * math_cosh(8.0*eta_prim)) + 
					false_northing;
	var y = scale * a_roof * (eta_prim +
					beta1 * Math.cos(2.0*xi_prim) * math_sinh(2.0*eta_prim) +
					beta2 * Math.cos(4.0*xi_prim) * math_sinh(4.0*eta_prim) +
					beta3 * Math.cos(6.0*xi_prim) * math_sinh(6.0*eta_prim) +
					beta4 * Math.cos(8.0*xi_prim) * math_sinh(8.0*eta_prim)) + 
					false_easting;
	x_y[0] = Math.round(x * 1000.0) / 1000.0;
	x_y[1] = Math.round(y * 1000.0) / 1000.0;
//	x_y[0] = x;
//	x_y[1] = y;
	return x_y;
}

// Conversion from grid coordinates to geodetic coordinates.
function grid_to_geodetic(x, y) {
	var lat_lon = new Array(2);
	if (centralMeridian == null) {
		return lat_lon;
	}
	// Prepare ellipsoid-based stuff.
	var e2 = flattening * (2.0 - flattening);
	var n = flattening / (2.0 - flattening);

	var a_roof = axis / (1.0 + n) * (1.0 + n*n/4.0 + n*n*n*n/64.0);
	var delta1 = n/2.0 - 2.0*n*n/3.0 + 37.0*n*n*n/96.0 - n*n*n*n/360.0;
	var delta2 = n*n/48.0 + n*n*n/15.0 - 437.0*n*n*n*n/1440.0;
	var delta3 = 17.0*n*n*n/480.0 - 37*n*n*n*n/840.0;
	var delta4 = 4397.0*n*n*n*n/161280.0;
	
	var Astar = e2 + e2*e2 + e2*e2*e2 + e2*e2*e2*e2;
	var Bstar = -(7.0*e2*e2 + 17.0*e2*e2*e2 + 30.0*e2*e2*e2*e2) / 6.0;
	var Cstar = (224.0*e2*e2*e2 + 889.0*e2*e2*e2*e2) / 120.0;
	var Dstar = -(4279.0*e2*e2*e2*e2) / 1260.0;

	// Convert.
	var deg_to_rad = Math.PI / 180;
	var lambda_zero = centralMeridian * deg_to_rad;
	var xi = (x - false_northing) / (scale * a_roof);		
	var eta = (y - false_easting) / (scale * a_roof);
	var xi_prim = xi - 
					delta1*Math.sin(2.0*xi) * math_cosh(2.0*eta) - 
					delta2*Math.sin(4.0*xi) * math_cosh(4.0*eta) - 
					delta3*Math.sin(6.0*xi) * math_cosh(6.0*eta) - 
					delta4*Math.sin(8.0*xi) * math_cosh(8.0*eta);
	var eta_prim = eta - 
					delta1*Math.cos(2.0*xi) * math_sinh(2.0*eta) - 
					delta2*Math.cos(4.0*xi) * math_sinh(4.0*eta) - 
					delta3*Math.cos(6.0*xi) * math_sinh(6.0*eta) - 
					delta4*Math.cos(8.0*xi) * math_sinh(8.0*eta);
	var phi_star = Math.asin(Math.sin(xi_prim) / math_cosh(eta_prim));
	var delta_lambda = Math.atan(math_sinh(eta_prim) / Math.cos(xi_prim));
	var lon_radian = lambda_zero + delta_lambda;
	var lat_radian = phi_star + Math.sin(phi_star) * Math.cos(phi_star) * 
					(Astar + 
					 Bstar*Math.pow(Math.sin(phi_star), 2) + 
					 Cstar*Math.pow(Math.sin(phi_star), 4) + 
					 Dstar*Math.pow(Math.sin(phi_star), 6));  	
	return { 
        lat: lat_radian * 180.0 / Math.PI,
        lng: lon_radian * 180.0 / Math.PI
    }
}

// Missing functions in the Math library.
function math_sinh(value) {
	return 0.5 * (Math.exp(value) - Math.exp(-value));
}
function math_cosh(value) {
	return 0.5 * (Math.exp(value) + Math.exp(-value));
}
function math_atanh(value) {
	return 0.5 * Math.log((1.0 + value) / (1.0 - value));
}


module.exports = {
    toLatLng: function(northValue, eastValue, type) {
        northValue = northValue.replace(/\D/g,'')
        eastValue = eastValue.replace(/\D/g,'')
        axis = 6378137.0, // GRS 80.
        flattening = 1.0 / 298.257222101, // GRS 80.
        false_northing = 0.0,
        centralMeridian = typeof type !== 'undefined' ? meridian(type.replace(/\D/g,'')) : 15.00;
        if (centralMeridian == 15.00) {
            scale = 0.9996;
            false_easting = 500000.0;
        }
        else {
            scale = 1.0,
            false_easting = 150000.0;
        }
        return grid_to_geodetic(northValue, eastValue);
    }
}

