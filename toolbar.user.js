// ==UserScript==
// @name        GalaxytoolNG Toolbar: Messages
// @namespace   https://foro.gt.linaresdigital.com
// @description Galaxytool Toolbar compatible with Ogame 6
// @version     0.5.3
// @author      Óscar Javier García Baudet
// @namespace   https://github.com/GalaxytoolNG
// @downloadURL https://raw.githubusercontent.com/GalaxytoolNG/GalaxytoolNG-Toolbar/master/toolbar.user.js
// @resource    strings.es    https://raw.githubusercontent.com/GalaxytoolNG/GalaxytoolNG-Toolbar/a345aa5553dcec575477d41568a1deecb161c314/strings.es.json
// @grant       GM_xmlhttpRequest
// @grant       GM_log
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @include     *://*.ogame.gameforge.com/game/index.php?page=*
// @copyright   2015+, Óscar Javier García Baudet
// ==/UserScript==

/* jshint browser:true, newcap: false */
/* jshint -W097 */
/* Fix: JSHint doesn't know about greasemonkey environment as eslint */
/* global GM_xmlhttpRequest:false, GM_log:false, GM_getResourceText:false */

/* eslint-env browser, greasemonkey */

'use strict';

(function() {
    /* Translation code */
    var translation = {};
    try {
        translation = JSON.parse(GM_getResourceText('strings.' + navigator.language));
    } catch (err) { }
    function _(string) {
        if (translation !== null && translation.hasOwnProperty(string)) {
            return translation[string];
        }
        return string;
    }

    /* Menu */
    var menuTableTools = document.getElementById('menuTableTools');
    var menuGTNG = document.createElement('li');
    var menuVisible = false;
    function toogleMenu() {
        if (menuVisible === false) {
            var bottonz = document.getElementById('buttonz');
            bottonz.style.display = 'none';
            var settingsGTNG = document.createElement('div');
            settingsGTNG.id = 'settingsGTNG';
            settingsGTNG.innerHTML = '<div class="header c-left galaxytoolbar_header"><h2>GalaxytoolNG settings:</h2></div><div class="content">HELLO</div>';
            document.getElementById("contentWrapper").appendChild(settingsGTNG);
        } else {
            bottonz.style.display = 'block';
        }
    }
    menuGTNG.innerHTML = '<a class="menubutton" href="#"><span class="textlabel">' + _('GalaxyToolNG') + '</span></a>';
    menuGTNG.addEventListener('click', function(e) {
        toogleMenu();
    },false);
    menuTableTools.appendChild(menuGTNG);

    /* Get page */
    var page = window.location.search.match(/[?&]page=([^&]*)/)[1];
    GM_log("Page detected: " + page);
    switch(page) {
        case 'messages':
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            var base = document.querySelector('#buttonz > div.content');
            var observer = new MutationObserver(function(mutations) {  
                mutations.forEach(function(mutation) {
                    GM_log('---------[ MUTATION EVENT STARTS HERE ]-------------');
                    /* Discard this nodes */
                    if (mutation.target.className != 'ui-tabs-panel ui-widget-content ui-corner-bottom') {
                        return;
                    }
                    GM_log('---------[ MUTATION EVENT WILL BE PROCESSED ]-------------');
                    var apiList = [];
                    for (var i = 0; i < mutation.addedNodes.length; ++i) {
                        var xpathResult = document.evaluate(".//li[@data-msg-id]", mutation.addedNodes.item(i), null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
                        var thisNode = xpathResult.iterateNext();
                        while (thisNode) {
                            GM_log('---------[ XPATH NODE ]-------------');
                            var apiKey = thisNode.getAttribute('data-api-key');
                            if (apiKey !== null) {
                                GM_log('API key found: ' + apiKey);
                            } else {
                                /* Debug node content */
                                GM_log(thisNode);
                                apiKey = document.evaluate(".//span[contains(@class,' icon_apikey ')]", thisNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE , null );
                                if (apiKey.singleNodeValue !== null && apiKey.singleNodeValue.getAttribute('title') !== null) {
                                    apiKey = apiKey.singleNodeValue.getAttribute('title').match(/["'](.r-[^\-]+-[^\-]+-[^"']+)["']/);
                                    if (apiKey != null) {
                                        apiKey = apiKey[1];
                                    }
                                }
                            }
                            if (apiKey === null) {
                                GM_log('API key not found in this message');
                            } else {
                                GM_log('API key found: ' + apiKey);
                                apiList.push(apiKey);
                            }
                            thisNode = xpathResult.iterateNext();
                        }
                    }
                    GM_log('---------[ MUTATION EVENT ENDS HERE ]-------------');
                    /* Set testing URL with localStorage.getItem('Galaxytoolng_url', 'http://...'); in console */
                    // Use here GM_getValue
                    if (GM_getValue('Galaxytoolng_url') === false) {
                        return;
                    }
                    /* Send results to every destination configured */
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: localStorage.getItem('Galaxytoolng_url'),
                        data: apiList,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        onload: function(response) {
                            GM_log(response.responseText);
                        }
                    });
                });
            });
            observer.observe(base, {
                subtree: true,
                childList: true
            });
            break;
        default:
            GM_log('Nothing to do here');
    }
 })();
