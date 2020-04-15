/*
 * Punycode
 *   Copyright (c) 2008 misttrap (MIT License)
 *   http://misttrap.s101.xrea.com/
 *
 * ver.1.0.2 (2008-12-22)
 *   Fixed big number calculation
 *   Improved function "adapt" performance
 * ver.1.0.1 (2008-06-04)
 *   Improved performance with long sentence
 * ver.1.0.0 (2008-05-18)
 *   Release version
 */

/*
 * interface Punycode {
 *   String decode(String input)
 *   String encode(String input)
 * }
 *
 * Punycode.decode(input)
 *   This method returns a raw string from a string encoded by Punycode.
 *   It is not specified the behavior when argument "input" is encoded incorrectly.
 *
 * Punycode.encode(input)
 *   This method returns a string encoded by Punycode.
 */

var Punycode = new function() {

	/* constant number */

	var BASE = 36;
	var TMIN = 1, TMAX = 26;
	// var SKEW = 38;
	var DAMP = 700;
	var INITIAL_BIAS = 72;
	var INITIAL_N    = 0x80;

	var DELIMITER = '-';

	var ENCODE_TABLE = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
		'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
		'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3',
		'4', '5', '6', '7', '8', '9'
	];
	var DECODE_TABLE = {
		'a' :  0, 'A' :  0, 'b' :  1, 'B' :  1, 'c' :  2, 'C' :  2, 'd' :  3, 'D' :  3,
		'e' :  4, 'E' :  4, 'f' :  5, 'F' :  5, 'g' :  6, 'G' :  6, 'h' :  7, 'H' :  7,
		'i' :  8, 'I' :  8, 'j' :  9, 'J' :  9, 'k' : 10, 'K' : 10, 'l' : 11, 'L' : 11,
		'm' : 12, 'M' : 12, 'n' : 13, 'N' : 13, 'o' : 14, 'O' : 14, 'p' : 15, 'P' : 15,
		'q' : 16, 'Q' : 16, 'r' : 17, 'R' : 17, 's' : 18, 'S' : 18, 't' : 19, 'T' : 19,
		'u' : 20, 'U' : 20, 'v' : 21, 'V' : 21, 'w' : 22, 'W' : 22, 'x' : 23, 'X' : 23,
		'y' : 24, 'Y' : 24, 'z' : 25, 'Z' : 25, '0' : 26, '1' : 27, '2' : 28, '3' : 29,
		'4' : 30, '5' : 31, '6' : 32, '7' : 33, '8' : 34, '9' : 35
	};

	/* bias offset */

	var ADAPT_DIV   = BASE - TMIN;           // 35
	var ADAPT_LIMIT = ADAPT_DIV * TMAX >> 1; // 455

	var ADAPT_TABLE = [ // Math.floor((BASE - TMIN + 1) * delta / (delta + SKEW))
		 0,  0,  1,  2,  3,  4,  4,  5,  6,  6,  7,  8,  8,  9,  9, 10, 10, 11, 11, 12,
		12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18,
		18, 18, 18, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21,
		22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26,
		26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27,
		27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28,
		28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29,
		29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
		29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
		30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
		30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31,
		31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31,
		31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31,
		31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31,
		31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
		32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
		32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
		32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
		32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32,
		32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 33, 33,
		33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
		33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33
	];

	var adapt = function(delta, firstTime, numPoints) {
		delta = firstTime ? (delta -  delta % DAMP) / DAMP
		                  : (delta - (delta & 1)  ) / 2;
		delta += (delta - delta % numPoints) / numPoints;
		for (var k = 0; delta > ADAPT_LIMIT; k += BASE)
			delta = (delta - delta % ADAPT_DIV) / ADAPT_DIV;
		return k + ADAPT_TABLE[delta];
	};

	/* decode */

	this.decode = function(input) {
		var n    = INITIAL_N;
		var i    = 0;
		var bias = INITIAL_BIAS;

		input = new String(input);
		var b = input.lastIndexOf(DELIMITER);
		var output = b > 0 ? input.substring(0, b) : '';
		b++;

		var len = input.length, h = output.length, f = String.fromCharCode;
		while (b < len) {
			var old_i = i, w = 1, k = BASE, kmax = bias + TMAX, digit, t;
			while (i += (digit = DECODE_TABLE[input.charAt(b++)]) * w, (
				t = k <= bias ? TMIN : k >= kmax ? TMAX : k - bias
			) <= digit) {
				w *= BASE - t;
				k += BASE;
			}
			bias = adapt(i - old_i, old_i == 0, ++h);
			n += (i - (i %= h)) / h;
			output = output.substring(0, i) + f(n) + output.substring(i++);
		}

		return output;
	};

	/* encode */

	var descend = function(a, b) { return b - a; };

	this.encode = function(input) {
		var n      = INITIAL_N;
		var delta  = 0;
		var bias   = INITIAL_BIAS;
		var output = [];

		input = new String(input);
		var j = 0, len = input.length, b = 0, f = String.fromCharCode, buf = [], chk = {}, ext = [], c = 0;
		while (j < len) {
			var code = input.charCodeAt(j);
			code < n ? (
				output[b++] = f(code),
				buf[j++] = 0
			) : code in chk ? (
				buf[j++] = code
			) : (
				chk[buf[j++] = ext[c++] = code] = null
			);
		}

		var h = b;
		if (b) output[b] = DELIMITER;

		for (ext.sort(descend); c; delta++, n++) {
			delta -= (n - (n = ext[--c])) * (h + 1);
			j = 0;
			do switch (buf[j]) {
				case 0 :
					delta++; break;
				case n :
					for (var q = delta, k = BASE, kmax = bias + TMAX, t; (
						t = k <= bias ? TMIN : k >= kmax ? TMAX : k - bias
					) <= q; k += BASE) {
						var div = BASE - t, mod = (q -= t) % div;
						output[output.length] = ENCODE_TABLE[t + mod];
						q = (q - mod) / div;
					}
					output[output.length] = ENCODE_TABLE[q];
					bias = adapt(delta, h == b, ++h);
					buf[j] = delta = 0;
			} while (++j < len);
		}

		return output.join('');
	};

};