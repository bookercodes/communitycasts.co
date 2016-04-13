// ==UserScript==
// @name        communitycasts
// @namespace   communitycasts
// @include     https://www.youtube.com/watch?v=*
// @version     1
// @grant       none
// ==/UserScript==

var menuUl = document.getElementById('action-panel-overflow-menu')
var submitLi = document.createElement('li')
var submitBtn = document.createElement('button')
submitBtn.innerHTML = 'Submit'
submitBtn.onclick = function() {
  alert('clicked')
}
submitBtn.classList.add('yt-ui-menu-item')
submitBtn.classList.add('yt-uix-menu-close-on-select')
submitBtn.classList.add('has-icon')
submitLi.appendChild(submitBtn)
menuUl.appendChild(submitLi)
