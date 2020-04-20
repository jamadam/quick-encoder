document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    /*jslint browser: true */
    /*global window */
    
    var settingInputString = document.querySelector('#input');
    
    document.querySelectorAll("#presets .currentTimestamp")[0].addEventListener('click', function() {
        var a = new Date();
        settingInputString.textContent = a.iso8601();
        triggerEvent(settingInputString, 'change');
    });
    
    document.querySelectorAll('.result dt').forEach(function(dt){
        var dd = dt.nextElementSibling;
        dt.querySelector('span').addEventListener('click', function(e) {
            if (dd.textContent.length > 0) {
                settingInputString.textContent = dd.textContent;
                triggerEvent(settingInputString, 'change');
            }
        });
    });
    
    var handle = function() {
        var input = this.textContent;
        urlencodeUTF8(input);
        urlencodeUnicode(input);
        urlencodeEUCJP(input);
        urlencodeSJIS(input);
        urlencodeJIS7(input);
        urlencodeJIS8(input);
        urldecode(input);
        htmlEscape(input);
        htmlUnescape(input);
        punycode_encode(input);
        punycode_decode(input);
        md5_encode(input);
        sha1_encode(input);
        base64_encode(input);
        base64_decode(input);
        crypt3(input);
        epochToDate(input);
        dateToEpoch(input);
        text2hex(input);
        hex2text(input);
    };
    settingInputString.addEventListener('change', handle);
    settingInputString.addEventListener('keyup', handle);
    
    function triggerEvent(element, event) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type, bubbling, cancelable
        return element.dispatchEvent(evt);
    }

    function generateSalt() {
        var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
        var res1 = a[Math.floor(Math.random() * a.length)];
        var res2 = a[Math.floor(Math.random() * a.length)];
        return res1 + res2;
    }
    
    function crypt3(input) {
        var crypt = new Crypt();
        var str = (crypt.crypt(generateSalt(), input))[0];
        document.querySelector('#result-crypt3').textContent = str;
    }
    
    function htmlEscape(input) {
        var str = input;
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        document.querySelector('#result-html-escape').textContent = str;
    }
    
    function htmlUnescape(input) {
        var str = input;
        str = str.replace(/&gt;/g, '>');
        str = str.replace(/&lt;/g, '<');
        str = str.replace(/&amp;/g, '&');
        document.querySelector('#result-html-unescape').textContent = str;
    }
    
    function urlencodeUTF8(input) {
        var str = EscapeUTF8(input);
        document.querySelector('#result-url-encode-utf8').textContent = str;
    }
    
    function urlencodeSJIS(input) {
        var str = EscapeSJIS(input);
        document.querySelector('#result-url-encode-sjis').textContent = str;
    }
    
    function urlencodeEUCJP(input) {
        var str = EscapeEUCJP(input);
        document.querySelector('#result-url-encode-eucjp').textContent = str;
    }
    
    function urlencodeJIS7(input) {
        var str = EscapeJIS7(input);
        document.querySelector('#result-url-encode-jis7').textContent = str;
    }
    
    function urlencodeJIS8(input) {
        var str = EscapeJIS8(input);
        document.querySelector('#result-url-encode-jis8').textContent = str;
    }
    
    function urlencodeUnicode(input) {
        var str = EscapeUnicode(input);
        document.querySelector('#result-url-encode-unicode').textContent = str;
    }
    
    function urldecode(input) {
        var UnescapeAutoDetect = function(str){
            return window["Unescape"+GetEscapeCodeType(str)](str);
        };
        var str = UnescapeAutoDetect(input);
        document.querySelector('#result-url-decode').textContent = str;
    }
    
    function base64_encode(input) {
        var dom = document.querySelector('#result-base64-encode');
        try {
            var str = Base64.encode(input);
            dom.textContent = str;
            dom.classList.remove('error');
        } catch (e) {
            dom.classList.add('error');
        }
    }
    
    function base64_decode(input) {
        var dom = document.querySelector('#result-base64-decode');
        try {
            var str = Base64.decode(input);
            dom.textContent = str;
            dom.classList.remove('error');
        } catch (e) {
            dom.classList.add('error');
        }
    }
    function sha1_encode(input) {
        var str = CybozuLabs.SHA1.calc(utf16to8(input));
        document.querySelector('#result-sha1').textContent = str;
    }
    
    function md5_encode(input) {
        var str = CybozuLabs.MD5.calc(utf16to8(input));
        document.querySelector('#result-md5').textContent = str;
    }
    
    function punycode_encode(input) {
        
        var re_fullstop = new RegExp(
            '[\u002E\u0589\u06D4\u0701\u0702\u1362\u166E\u1803'
          + '\u1809\u2CF9\u2CFE\u3002\uFE12\uFE52\uFF0E\uFF61]'
        );
        
        var encodeIDN = function(str){
            var words = str.toLowerCase().split(re_fullstop);
            for (var i = 0, l = words.length; i < l; i++){
                if (! words[i].match(/[^0-9a-z\-]/)) continue;
                words[i] = 'xn--' + Punycode.encode(words[i]);
            }
            return words.join('.');
        };
        
        var str = encodeIDN(input);
        document.querySelector('#result-punycode-encode').textContent = str;
    }
    
    function punycode_decode(input) {
        
        var decodeIDN = function(str){
            return str.replace(/xn--([0-9a-z\-]+)/g, function(m0, m1){
                return Punycode.decode(m1);
            });
        };
        
        var str = decodeIDN(input);
        document.querySelector('#result-punycode-decode').textContent = str;
    }
    
    function utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for(i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            }
        }
        return out;
    }
    
    function text2hex(a) {
        var hoge = Array.from((new TextEncoder('utf-8')).encode(a));
        var hex = hoge.map(x => x.toString(16)).join('');
        document.querySelector('#result-text2hex').textContent = hex;
    }
    
    function hex2text(a) {
        var array = a.match(/.{1,2}/g) || [];
        array = array.map(x => parseInt(x, 16));
        var text = (new TextDecoder('utf-8')).decode(new Uint8Array(array));
        document.querySelector('#result-hex2text').textContent = text;
    }
    
    Date.prototype.iso8601 = function() {
        var year = this.getFullYear();
        var mon  = this.getMonth()+1;
        var day  = this.getDate();
        var hour = this.getHours();
        var min  = this.getMinutes();
        var sec  = this.getSeconds();
        // time zone
        var tzos = this.getTimezoneOffset();
        var tzpm = ( tzos > 0 ) ? "-" : "+";
        if ( tzos < 0 ) tzos *= -1;
        var tzhour = tzos / 60;
        var tzmin  = tzos % 60;
    
        // sprintf( "%02d", ... )
        if ( mon  < 10 ) mon  = "0"+mon;
        if ( day  < 10 ) day  = "0"+day;
        if ( hour < 10 ) hour = "0"+hour;
        if ( min  < 10 ) min  = "0"+min;
        if ( sec  < 10 ) sec  = "0"+sec;
        if ( tzhour < 10 ) tzhour = "0"+tzhour;
        if ( tzmin  < 10 ) tzmin  = "0"+tzmin;
        var dtf = year+"-"+mon+"-"+day+"T"+hour+":"+min+":"+sec+tzpm+tzhour+":"+tzmin;
        return dtf;
    };
    
    function isValidDate(d) {
        if ( Object.prototype.toString.call(d) !== "[object Date]" ) {
            return false;
        }
        return !isNaN(d.getTime());
    }

    function dateToEpoch(input) {
        var dom = document.querySelector('#result-iso86012unix');
        var d = new Date(input);
        var a;
        if (isValidDate(d)) {
            a = Math.round(d.getTime() / 1000);
            dom.textContent = a;
            dom.classList.remove('error');
        } else {
            input = input.replace(/([\-+]\d\d):(\d\d)/, '$1$2');
            input = input.replace("+", ' +');
            d = new Date(input);
            if (isValidDate(d)) {
                a = Math.round(d.getTime() / 1000);
                dom.textContent = a;
                dom.classList.remove('error');
            } else {
                input = input.replace(/(\d+)\-(\d+)\-(\d+)/, '$1/$2/$3');
                input = input.replace('T', ' ');
                d = new Date(input);
                if (isValidDate(d)) {
                    a = Math.round(d.getTime() / 1000);
                    dom.textContent = a;
                    dom.classList.remove('error');
                } else {
                    dom.classList.add('error');
                }
            }
        }
    }
    
    function epochToDate(seed) {
        var dom = document.querySelector('#result-unix2iso8601');
        var d = new Date(seed * 1000);
        if (isValidDate(d)) {
            dom.textContent = d.iso8601();
            dom.classList.remove('error');
        } else {
            dom.classList.add('error');
        }
    }
});
