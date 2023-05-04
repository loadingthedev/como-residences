window.isMobile = !1;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.isMobile = !0
}
window.isiOS = !1;
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.isiOS = !0
}
window.isiOSVersion = '';
if (window.isiOS) {
    var version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (version !== null) {
        window.isiOSVersion = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)]
    }
}
window.isSafari = !1;
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    window.isSafari = !0
}
window.isSafariVersion = '';
if (window.isSafari) {
    var version = (navigator.appVersion).match(/Version\/(\d+)\.(\d+)\.?(\d+)? Safari/);
    if (version !== null) {
        window.isSafariVersion = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)]
    }
}
function t_throttle(fn, threshhold, scope) {
    var last;
    var deferTimer;
    threshhold || (threshhold = 250);
    return function () {
        var context = scope || this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + threshhold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args)
            }, threshhold)
        } else {
            last = now;
            fn.apply(context, args)
        }
    }
}
function t395_init(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var allRecords = document.getElementById('allrecords');
    var tildaMode = allRecords ? allRecords.getAttribute('data-tilda-mode') : '';
    var tildaLazyMode = allRecords ? allRecords.getAttribute('data-tilda-lazy') : '';
    var tabs = rec ? rec.querySelectorAll('.t395__tab') : [];
    if (tildaMode !== 'edit' && tildaMode !== 'preview') {
        setTimeout(function () {
            t395_scrollToTabs(recid);
            var activeTab = rec.querySelector('.t395__tab_active');
            if (activeTab) {
                var currentButton = activeTab.querySelector('.t395__title');
                if (currentButton) {
                    currentButton.setAttribute('tabindex', 0);
                    currentButton.setAttribute('aria-selected', !0)
                }
            }
        }, 300)
    }
    t395_addAttributesToBlocksInsideTabs(recid, tabs);
    Array.prototype.forEach.call(tabs, function (tab, i) {
        tab.addEventListener('click', function (event) {
            var tabNumber = i + 1;
            var targetTab = event.target.closest('.t395__tab');
            if (targetTab && targetTab.classList.contains('t395__tab_active') && !event.isTrusted)
                return;
            t395_switchBetweenTabs(recid, tabNumber, targetTab, tildaMode, tildaLazyMode)
        });
        tab.addEventListener('keydown', function (event) {
            var currentIndex = Number(rec.querySelector('.t395__wrapper').getAttribute('data-tab-current'));
            var targetTab = event.target.closest('.t395__tab');
            if (targetTab && targetTab.classList.contains('t395__tab_active') && !event.isTrusted)
                return;
            var prevent = !1;
            switch (event.key) {
                case 'Left':
                case 'ArrowLeft':
                    currentIndex = currentIndex === 1 ? tabs.length : currentIndex - 1;
                    targetTab = rec.querySelector('[data-tab-number="' + currentIndex + '"]');
                    t395_switchBetweenTabs(recid, currentIndex, targetTab, tildaMode, tildaLazyMode);
                    t395_showActiveTabFromKeyboard(recid, currentIndex, tabs);
                    prevent = !0;
                    break;
                case 'Right':
                case 'ArrowRight':
                    currentIndex = currentIndex === tabs.length ? 1 : currentIndex + 1;
                    targetTab = rec.querySelector('[data-tab-number="' + currentIndex + '"]');
                    t395_switchBetweenTabs(recid, currentIndex, targetTab, tildaMode, tildaLazyMode);
                    t395_showActiveTabFromKeyboard(recid, currentIndex, tabs);
                    prevent = !0;
                    break;
                default:
                    break
            }
            if (prevent) {
                event.stopPropagation();
                event.preventDefault()
            }
        })
    });
    if (tabs.length) {
        t395_alltabs_updateContent(recid);
        t395_updateContentBySelect(recid);
        var bgColor = rec ? rec.style.backgroundColor : '#ffffff';
        var bgColorTargets = rec.querySelectorAll('.t395__select, .t395__firefoxfix');
        Array.prototype.forEach.call(bgColorTargets, function (target) {
            target.style.background = bgColor
        })
    }
}
function t395_addAttributesToBlocksInsideTabs(recid, tabs) {
    var allBlocksInsideTabsIds = [];
    if (tabs.length > 0) {
        Array.prototype.forEach.call(tabs, function (tab, i) {
            tab.getAttribute('data-tab-rec-ids').split(',').forEach(function (id) {
                allBlocksInsideTabsIds.push(id)
            });
            var firstBlockInsideTabId = tab.getAttribute('data-tab-rec-ids').split(',')[0];
            var firstBlockInsideTab = document.querySelector('#rec' + firstBlockInsideTabId);
            if (firstBlockInsideTab && !firstBlockInsideTab.getAttribute('aria-labelledby')) {
                firstBlockInsideTab.setAttribute('aria-labelledby', 'tab' + (i + 1) + '_' + recid)
            }
        })
    }
    allBlocksInsideTabsIds.forEach(function (id) {
        var block = document.querySelector('#rec' + id);
        if (!block)
            return;
        if (!block.getAttribute('role')) {
            block.setAttribute('role', 'tabpanel')
        }
        if (!block.getAttribute('tabindex')) {
            block.setAttribute('tabindex', '0')
        }
    })
}
function t395_switchBetweenTabs(recid, tabNumber, targetTab, tildaMode, tildaLazyMode) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var activeTab = rec.querySelector('.t395__tab_active');
    if (activeTab)
        activeTab.classList.remove('t395__tab_active');
    targetTab.classList.add('t395__tab_active');
    t395_removeUrl();
    if (tildaMode !== 'edit' && tildaMode !== 'preview' && tabNumber && typeof history.replaceState !== 'undefined') {
        try {
            window.history.replaceState('', '', window.location.href + '#!/tab/' + recid + '-' + tabNumber)
        } catch (err) { }
    }
    rec.querySelector('.t395__wrapper').setAttribute('data-tab-current', tabNumber);
    t395_alltabs_updateContent(recid);
    t395_updateSelect(recid);
    var hookBlocks = targetTab.getAttribute('data-tab-rec-ids').split(',');
    var event = document.createEvent('Event');
    event.initEvent('displayChanged', !0, !0);
    var hooksCopy = hookBlocks.slice();
    hooksCopy.forEach(function (recid) {
        var currentRec = document.getElementById('rec' + recid);
        if (!currentRec)
            return;
        var recordType = currentRec.getAttribute('data-record-type');
        if (recordType === '395' || recordType === '397') {
            var selector = '.t' + recordType + '__tab_active';
            var activeIDs = currentRec.querySelector(selector).getAttribute('data-tab-rec-ids');
            activeIDs = activeIDs.split(',');
            hookBlocks = hookBlocks.concat(activeIDs)
        }
    });
    hookBlocks.forEach(function (curRecid) {
        var currentRec = document.getElementById('rec' + curRecid);
        if (!currentRec)
            return;
        var currentRecChildren = currentRec.querySelectorAll('.t-feed, .t-store, .t-store__product-snippet, .t117, .t121, .t132, .t223, .t226, .t228, .t229, .t230, .t268, .t279, .t341, .t346, .t347, .t349, .t351, .t353, .t384, .t385, .t386, .t396, .t400, .t404, .t409, .t410, .t412, .t418, .t422, .t425, .t428, .t433, .t448, .t456, .t477, .t478, .t480, .t486, .t498, .t504, .t506, .t509, .t511, .t517, .t518, .t519, .t520, .t532, .t533, .t538, .t539, .t544, .t545, .t552, .t554, .t569, .t570, .t577, .t592, .t598, .t599, .t601, .t604, .t605, .t609, .t615, .t616, .t650, .t659, .t670, .t675, .t686, .t688, .t694, .t698, .t700, .t726, .t728, .t730, .t734, .t738, .t740, .t744, .t754, .t760, .t762, .t764, .t774, .t776, .t778, .t780, .t786, .t798, .t799, .t801, .t813, .t814, .t822, .t826, .t827, .t829, .t842, .t843, .t849, .t850, .t851, .t856, .t858, .t859, .t860, .t881, .t889, .t902, .t912, .t923, .t937, .t958, .t959, .t979, .t982, .t983, .t989, .t994, .t1053, .t1067, .t1068, .t1069, .t1070, .t1071, .t1072');
        Array.prototype.forEach.call(currentRecChildren, function (child) {
            child.dispatchEvent(event)
        });
        var displayChangedBlock = currentRec.querySelector('[data-display-changed="true"]');
        if (displayChangedBlock)
            displayChangedBlock.dispatchEvent(event)
    });
    var galaxyEffectBlocks = document.querySelectorAll('.t826');
    Array.prototype.forEach.call(galaxyEffectBlocks, function (galaxyEffectBlock) {
        galaxyEffectBlock.dispatchEvent(event)
    });
    if (window.lazy === 'y' || tildaLazyMode === 'yes') {
        t_onFuncLoad('t_lazyload_update', function () {
            t_lazyload_update()
        })
    }
}
function t395_showActiveTabFromKeyboard(recid, currentIndex, tabs) {
    var rec = document.querySelector('#rec' + recid);
    Array.prototype.forEach.call(tabs, function (tabItem) {
        tabItem.classList.remove('t395__tab_active');
        var button = tabItem.querySelector('.t395__title');
        if (button) {
            button.setAttribute('tabindex', -1);
            button.setAttribute('aria-selected', !1)
        }
    });
    var currentTab = rec.querySelector('[data-tab-number="' + currentIndex + '"]');
    if (!currentTab)
        return;
    currentTab.classList.add('t395__tab_active');
    var currentButton = currentTab.querySelector('.t395__title');
    if (currentButton) {
        currentButton.setAttribute('tabindex', 0);
        currentButton.setAttribute('aria-selected', !0);
        currentButton.focus()
    }
    var tabList = rec.querySelector('.t395__wrapper');
    if (tabList)
        tabList.setAttribute('data-tab-current', currentIndex)
}
function t395_alltabs_updateContent(recid) {
    var rec = document.getElementById('rec' + recid);
    var activeTabs = rec ? rec.querySelectorAll('.t395__tab_active') : null;
    var select = rec ? rec.querySelector('.t395__select') : null;
    var tabs = rec.querySelectorAll('.t395__tab');
    if (activeTabs.length !== 1)
        return !1;
    var activeTab = activeTabs[0];
    var hookBlocks = activeTab.getAttribute('data-tab-rec-ids').split(',');
    var noActive = [];
    var popupBlocks = [190, 217, 312, 331, 358, 364, 365, 390, 702, 706, 746, 750, 756, 768, 862, 868, 890, 945, 1013, 1014];
    Array.prototype.forEach.call(tabs, function (tab) {
        if (tab !== activeTab) {
            var noActiveHooks = tab.getAttribute('data-tab-rec-ids').split(',');
            noActiveHooks.forEach(function (hook) {
                if (noActive.indexOf(hook) === -1 && hookBlocks.indexOf(hook) === -1)
                    noActive.push(hook)
            })
        }
    });
    if (t395_checkVisibillityEl(activeTab) || t395_checkVisibillityEl(select)) {
        hookBlocks.forEach(function (hook) {
            if (hook) {
                var hookEl = document.getElementById('rec' + hook);
                var hookElRecordType = hookEl ? hookEl.getAttribute('data-record-type') : '';
                if (hookEl) {
                    hookEl.classList.remove('t395__off');
                    hookEl.classList.remove('t397__off');
                    hookEl.style.opacity = ''
                }
                t395_updateTabsByHook(hookElRecordType, hookEl, hook, recid)
            }
        })
    } else {
        hookBlocks.forEach(function (hook) {
            var hookEl = document.getElementById('rec' + hook);
            var hookElRecordType = hookEl ? hookEl.getAttribute('data-record-type') : '';
            var isPopupBlock = popupBlocks.some(function (id) {
                return hookElRecordType == id
            });
            if (hookEl && !isPopupBlock) {
                hookEl.setAttribute('data-animationappear', 'off');
                hookEl.classList.add('t395__off')
            }
        })
    }
    noActive.forEach(function (noActiveID) {
        if (!noActiveID)
            return;
        var hookEl = document.getElementById('rec' + noActiveID);
        var hookElRecordType = hookEl ? hookEl.getAttribute('data-record-type') : '';
        var isPopupBlock = popupBlocks.some(function (id) {
            return hookElRecordType == id
        });
        if (hookEl && !isPopupBlock) {
            hookEl.setAttribute('data-connect-with-tab', 'yes');
            hookEl.setAttribute('data-animationappear', 'off');
            hookEl.classList.add('t395__off')
        }
        t395_updateTabsByHook(hookElRecordType, hookEl, noActiveID, recid)
    });
    var scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
    if (scrollHeight - window.innerHeight < window.pageYOffset) {
        window.scrollTo(0, 0)
    }
}
function t395_updateTabsByHook(hookElRecordType, hookEl, currentID, recid) {
    var hookElTab;
    switch (hookElRecordType) {
        case '395':
            if (window.t395_alltabs_updateContent && window.t395_updateSelect && recid !== currentID) {
                window.t395_alltabs_updateContent(currentID);
                window.t395_updateSelect(currentID);
                hookElTab = hookEl ? hookEl.querySelector('.t395__tab') : null;
                if (hookElTab)
                    hookElTab.click()
            }
            break;
        case '397':
            if (recid !== currentID) {
                t397_alltabs_updateContent(currentID);
                t397_updateSelect(currentID);
                hookElTab = hookEl ? hookEl.querySelector('.t397__tab') : null;
                if (hookElTab)
                    hookElTab.click()
            }
            break
    }
}
function t395_checkVisibillityEl(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length))
}
function t395_updateContentBySelect(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return !1;
    var select = rec.querySelector('.t395__select');
    if (select) {
        select.addEventListener('change', function () {
            var currentValue = select.value;
            var tabIndex = rec.querySelector('.t395__tab[data-tab-rec-ids=\'' + currentValue + '\']');
            if (tabIndex)
                tabIndex.click()
        })
    }
}
function t395_updateSelect(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return !1;
    var activeTab = rec.querySelector('.t395__tab_active');
    var currentTabHooks = activeTab ? activeTab.getAttribute('data-tab-rec-ids') : '';
    var select = rec.querySelector('.t395__select');
    if (select)
        select.value = currentTabHooks
}
function t395_scrollToTabs(recid) {
    var rec = document.getElementById('rec' + recid);
    var curUrl = window.location.href;
    var tabIndexNumber = curUrl.indexOf('#!/tab/');
    if (tabIndexNumber === -1)
        return !1;
    var tabIndexNumberStart = curUrl.indexOf('tab/');
    var firstOptionSelect = rec ? rec.querySelector('.t395__wrapper_mobile .t395__select option') : null;
    if (firstOptionSelect)
        firstOptionSelect.selected = !1;
    var tabRec = curUrl.substring(tabIndexNumberStart + 4, tabIndexNumberStart + 4 + recid.length);
    if (tabRec !== recid)
        return !1;
    var tabBlock = rec ? rec.querySelector('.t395') : null;
    var tabNumber = parseInt(curUrl.slice(tabIndexNumberStart + 4 + recid.length + 1), 10);
    var tabs = rec.querySelectorAll('.t395__tab');
    Array.prototype.forEach.call(tabs, function (tab, i) {
        if (i === tabNumber - 1) {
            tab.click();
            tab.classList.add('t395__tab_active')
        } else {
            tab.classList.remove('t395__tab_active')
        }
    });
    var tabsMob = rec.querySelectorAll('.t395__wrapper_mobile .t395__select option');
    var activeTabMob = tabsMob.length ? tabsMob[tabNumber - 1] : null;
    if (activeTabMob)
        activeTabMob.selected = !0;
    var targetOffset = tabBlock.getBoundingClientRect().top + window.pageYOffset;
    var target = window.innerWidth > 960 ? targetOffset - 200 : targetOffset - 100;
    if (target < 0)
        target = 0;
    t395_scrollToEl(target)
}
function t395_scrollToEl(elTopPos) {
    if (elTopPos === window.pageYOffset)
        return !1;
    var duration = 300;
    var difference = window.pageYOffset;
    var cashedDiff = window.pageYOffset;
    var step = 10 * (elTopPos || window.pageYOffset) / duration;
    var timer = setInterval(function () {
        if (cashedDiff > elTopPos) {
            difference -= step
        } else {
            difference += step
        }
        window.scrollTo(0, difference);
        document.body.setAttribute('data-scrollable', 'true');
        if (cashedDiff > elTopPos && window.pageYOffset <= elTopPos || cashedDiff <= elTopPos && window.pageYOffset >= elTopPos) {
            document.body.removeAttribute('data-scrollable');
            clearInterval(timer)
        }
    }, 10);
    var timer2 = setTimeout(function () {
        clearInterval(timer);
        document.body.removeAttribute('data-scrollable');
        clearTimeout(timer2)
    }, duration * 2)
}
function t395_removeUrl() {
    var curUrl = window.location.href;
    var indexToRemove = curUrl.indexOf('#!/tab/');
    if (indexToRemove === -1) {
        indexToRemove = curUrl.indexOf('%23!/tab/')
    }
    curUrl = curUrl.substring(0, indexToRemove);
    if (indexToRemove !== -1) {
        if (typeof history.replaceState != 'undefined') {
            try {
                window.history.replaceState('', '', curUrl)
            } catch (err) { }
        }
    }
}
function t746_initPopup(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return !1;
    rec.setAttribute('data-animationappear', 'off');
    rec.style.opacity = '1';
    var popup = rec.querySelector('.t-popup');
    var iframeBody = rec.querySelectorAll('.t746__frame');
    var hook = popup ? popup.getAttribute('data-tooltip-hook') : '';
    var analitics = popup ? popup.getAttribute('data-track-popup') : '';
    t746_imageHeight(recid);
    t746_arrowWidth(recid);
    t746_show(recid);
    t746_hide(recid);
    window.addEventListener('resize', t_throttle(function () {
        t746_arrowWidth(recid)
    }, 200));
    window.addEventListener('orientationchange', function () {
        setTimeout(function () {
            t_onFuncLoad('t_slds_updateSlider', function () {
                t_slds_updateSlider(recid)
            })
        }, 500)
    });
    if (hook) {
        t_onFuncLoad('t_popup__addAttributesForAccessibility', function () {
            t_popup__addAttributesForAccessibility(hook)
        });
        if (popup) {
            popup.addEventListener('click', function (e) {
                if (e.target === popup) {
                    Array.prototype.forEach.call(iframeBody, function (iframeB) {
                        iframeB.innerHTML = '';
                        iframeB.style.zIndex = ''
                    });
                    t746_closePopup(recid)
                }
            })
        }
        var popupClose = rec.querySelector('.t-popup__close');
        if (popupClose) {
            popupClose.addEventListener('click', function () {
                Array.prototype.forEach.call(iframeBody, function (iframeB) {
                    iframeB.innerHTML = '';
                    iframeB.style.zIndex = ''
                });
                t746_closePopup(recid)
            })
        }
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === 27) {
                Array.prototype.forEach.call(iframeBody, function (iframeB) {
                    iframeB.innerHTML = '';
                    iframeB.style.zIndex = ''
                });
                t746_closePopup(recid)
            }
        });
        var allRec = document.getElementById('allrecords');
        var lazyMode = allRec ? allRec.getAttribute('data-tilda-lazy') : '';
        var isInitSlds = !1;
        document.addEventListener('click', function (e) {
            var href = e.target.closest('a[href="' + hook + '"]');
            if (href) {
                e.preventDefault();
                t746_showPopup(recid);
                if (isInitSlds) {
                    t_onFuncLoad('t_slds_updateSlider', function () {
                        t_slds_updateSlider(recid)
                    })
                } else {
                    t_onFuncLoad('t_sldsInit', function () {
                        t_sldsInit(recid);
                        isInitSlds = !0
                    })
                }
                t746_arrowWidth(recid);
                t_onFuncLoad('t_popup__resizePopup', function () {
                    t_popup__resizePopup(recid)
                });
                if (window.lazy === 'y' || lazyMode === 'yes') {
                    t_onFuncLoad('t_lazyload_update', function () {
                        t_lazyload_update()
                    })
                }
                if (analitics && window.Tilda) {
                    var virtTitle = hook;
                    if (virtTitle.substring(0, 7) === '#popup:') {
                        virtTitle = virtTitle.substring(7)
                    }
                    Tilda.sendEventToStatistics(analitics, virtTitle)
                }
            }
        });
        t_onFuncLoad('t_popup__addClassOnTriggerButton', function () {
            t_popup__addClassOnTriggerButton(document, hook)
        })
    }
}
function t746_showPopup(recid) {
    var rec = document.getElementById('rec' + recid);
    var popup = rec ? rec.querySelector('.t-popup') : null;
    t_onFuncLoad('t_popup__showPopup', function () {
        t_popup__showPopup(popup)
    });
    document.body.classList.add('t-body_popupshowed')
}
function t746_closePopup(recid) {
    var rec = document.getElementById('rec' + recid);
    var popup = rec ? rec.querySelector('.t-popup') : null;
    var popupHook = popup ? popup.getAttribute('data-tooltip-hook') : '';
    var popupHookLink = document.querySelectorAll('[data-tooltip-hook="' + popupHook + '"]');
    if (popup && !popup.classList.contains('t-popup_show')) {
        return
    } else if (popup) {
        Array.prototype.forEach.call(popupHookLink, function (popup) {
            popup.classList.remove('t-popup_show')
        })
    }
    if (!document.querySelector('.t-popup_show')) {
        document.body.classList.remove('t-body_popupshowed')
    }
    var allCovers = rec.querySelectorAll('.t-bgimg');
    Array.prototype.forEach.call(allCovers, function (cover) {
        if (cover.style.opacity === '0') {
            cover.style.opacity = ''
        }
    });
    t_onFuncLoad('t_popup__addFocusOnTriggerButton', function () {
        t_popup__addFocusOnTriggerButton()
    });
    setTimeout(function () {
        if (popup)
            popup.style.display = 'none'
    }, 300)
}
function t746_sendPopupEventToStatistics(popupname) {
    var virtPage = '/tilda/popup/';
    var virtTitle = 'Popup: ';
    if (popupname.substring(0, 7) === '#popup:') {
        popupname = popupname.substring(7)
    }
    virtPage += popupname;
    virtTitle += popupname;
    if (ga) {
        if (window.mainTracker !== 'tilda') {
            ga('send', {
                'hitType': 'pageview',
                'page': virtPage,
                'title': virtTitle,
            })
        }
    }
    if (window.mainMetrika > '' && window[window.mainMetrika]) {
        window[window.mainMetrika].hit(virtPage, {
            title: virtTitle,
            referer: window.location.href,
        })
    }
}
function t746_show(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var playBtns = rec ? rec.querySelectorAll('.t746__play') : [];
    Array.prototype.forEach.call(playBtns, function (play) {
        play.addEventListener('click', function () {
            var videoType = play.getAttribute('data-slider-video-type');
            var url;
            var nextEl;
            var prevEl;
            var iframe;
            switch (videoType) {
                case 'youtube':
                    url = play.getAttribute('data-slider-video-url');
                    nextEl = play.nextElementSibling;
                    prevEl = play.previousElementSibling.previousElementSibling;
                    if (nextEl) {
                        iframe = document.createElement('iframe');
                        iframe.classList.add('t746__iframe');
                        iframe.width = '100%';
                        iframe.height = '100%';
                        iframe.src = 'https://www.youtube.com/embed/' + url + '?autoplay=1&enablejsapi=1';
                        iframe.frameBorder = '0';
                        iframe.setAttribute('webkitallowfullscreen', '');
                        iframe.setAttribute('mozallowfullscreen', '');
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.setAttribute('allow', 'autoplay');
                        if (nextEl)
                            nextEl.innerHTML = '';
                        if (nextEl)
                            nextEl.appendChild(iframe)
                    }
                    if (prevEl && prevEl.classList.contains('t-bgimg'))
                        prevEl.style.opacity = '0';
                    break;
                case 'vimeo':
                    url = play.getAttribute('data-slider-video-url');
                    nextEl = play.nextElementSibling;
                    prevEl = play.previousElementSibling.previousElementSibling;
                    var idMatch = /vimeo[^/]*\/(\d+)\/?(\w*)\/?/i.exec(url);
                    var id = idMatch ? idMatch[1] : null;
                    var hash = idMatch ? '?h=' + idMatch[2] : null;
                    if (nextEl) {
                        iframe = document.createElement('iframe');
                        iframe.classList.add('t746__iframe');
                        iframe.width = '100%';
                        iframe.height = '100%';
                        iframe.src = 'https://player.vimeo.com/video/' + id + hash + '?autoplay=1&amp;api=1';
                        iframe.frameBorder = '0';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.setAttribute('allow', 'autoplay; fullscreen');
                        if (nextEl)
                            nextEl.innerHTML = '';
                        if (nextEl)
                            nextEl.appendChild(iframe)
                    }
                    if (prevEl && prevEl.classList.contains('t-bgimg'))
                        prevEl.style.opacity = '0';
                    break
            }
            if (nextEl)
                nextEl.style.zIndex = '3'
        })
    })
}
function t746_hide(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var popupBody = rec ? rec.querySelector('.t746__frame') : null;
    rec.addEventListener('updateSlider', function () {
        popupBody.innerHTML = '';
        popupBody.style.zIndex = ''
    })
}
function t746_imageHeight(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var images = rec.querySelectorAll('.t746__separator');
    Array.prototype.forEach.call(images, function (img) {
        var width = img.getAttribute('data-slider-image-width') || 0;
        var height = img.getAttribute('data-slider-image-height') || 0;
        var ratio = height / width;
        var padding = ratio * 100;
        img.style.paddingBottom = padding + '%'
    })
}
function t746_arrowWidth(recid) {
    var rec = document.getElementById('rec' + recid);
    if (!rec)
        return;
    var arrows = rec ? rec.querySelectorAll('.t-slds__arrow_wrapper') : [];
    var slide = rec ? rec.querySelector('.t-slds__wrapper') : null;
    var slideWidth = slide ? slide.offsetWidth : 0;
    var arrowWidth = window.innerWidth - slideWidth;
    Array.prototype.forEach.call(arrows, function (arrow) {
        var arrowContainer = arrow ? arrow.closest('.t-slds__arrow_container') : null;
        var isArrowNearPic = arrowContainer ? arrowContainer.classList.contains('t-slds__arrow-nearpic') : !1;
        if (window.innerWidth > 960 && isArrowNearPic) {
            arrow.style.width = (arrowWidth / 2) + 'px'
        } else {
            arrow.style.width = ''
        }
    })
}
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.oMatchesSelector
}
if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;
        while (el && el.nodeType === 1) {
            if (Element.prototype.matches.call(el, s)) {
                return el
            }
            el = el.parentElement || el.parentNode
        }
        return null
    }
}
function t702_initPopup(recId) {
    var rec = document.getElementById('rec' + recId);
    if (!rec)
        return;
    var container = rec.querySelector('.t702');
    if (!container)
        return;
    rec.setAttribute('data-animationappear', 'off');
    rec.setAttribute('data-popup-subscribe-inited', 'y');
    rec.style.opacity = 1;
    var documentBody = document.body;
    var popup = rec.querySelector('.t-popup');
    var popupTooltipHook = popup.getAttribute('data-tooltip-hook');
    var analitics = popup.getAttribute('data-track-popup');
    var popupCloseBtn = popup.querySelector('.t-popup__close');
    var hrefs = rec.querySelectorAll('a[href*="#"]');
    var submitHref = rec.querySelector('.t-submit[href*="#"]');
    if (popupTooltipHook) {
        t_onFuncLoad('t_popup__addAttributesForAccessibility', function () {
            t_popup__addAttributesForAccessibility(popupTooltipHook)
        });
        document.addEventListener('click', function (event) {
            var target = event.target;
            var href = target.closest('a[href$="' + popupTooltipHook + '"]') ? target : !1;
            if (!href)
                return;
            event.preventDefault();
            t702_showPopup(recId);
            t_onFuncLoad('t_popup__resizePopup', function () {
                t_popup__resizePopup(recId)
            });
            t702__lazyLoad();
            if (analitics && window.Tilda) {
                Tilda.sendEventToStatistics(analitics, popupTooltipHook)
            }
        });
        t_onFuncLoad('t_popup__addClassOnTriggerButton', function () {
            t_popup__addClassOnTriggerButton(document, popupTooltipHook)
        })
    }
    popup.addEventListener('scroll', t_throttle(function () {
        t702__lazyLoad()
    }));
    popup.addEventListener('click', function (event) {
        var windowWithoutScrollBar = window.innerWidth - 17;
        if (event.clientX > windowWithoutScrollBar)
            return;
        if (event.target === this)
            t702_closePopup(recId)
    });
    popupCloseBtn.addEventListener('click', function () {
        t702_closePopup(recId)
    });
    if (submitHref) {
        submitHref.addEventListener('click', function () {
            if (documentBody.classList.contains('t-body_scroll-locked')) {
                documentBody.classList.remove('t-body_scroll-locked')
            }
        })
    }
    for (var i = 0; i < hrefs.length; i++) {
        hrefs[i].addEventListener('click', function () {
            var url = this.getAttribute('href');
            if (!url || url.substring(0, 7) != '#price:') {
                t702_closePopup(recId);
                if (!url || url.substring(0, 7) == '#popup:') {
                    setTimeout(function () {
                        documentBody.classList.add('t-body_popupshowed')
                    }, 300)
                }
            }
        })
    }
    function t702_escClosePopup(event) {
        if (event.key === 'Escape')
            t702_closePopup(recId)
    }
    popup.addEventListener('tildamodal:show' + popupTooltipHook, function () {
        document.addEventListener('keydown', t702_escClosePopup)
    });
    popup.addEventListener('tildamodal:close' + popupTooltipHook, function () {
        document.removeEventListener('keydown', t702_escClosePopup)
    })
}
function t702_lockScroll() {
    var documentBody = document.body;
    if (!documentBody.classList.contains('t-body_scroll-locked')) {
        var bodyScrollTop = typeof window.pageYOffset !== 'undefined' ? window.pageYOffset : (document.documentElement || documentBody.parentNode || documentBody).scrollTop;
        documentBody.classList.add('t-body_scroll-locked');
        documentBody.style.top = '-' + bodyScrollTop + 'px';
        documentBody.setAttribute('data-popup-scrolltop', bodyScrollTop)
    }
}
function t702_unlockScroll() {
    var documentBody = document.body;
    if (documentBody.classList.contains('t-body_scroll-locked')) {
        var bodyScrollTop = documentBody.getAttribute('data-popup-scrolltop');
        documentBody.classList.remove('t-body_scroll-locked');
        documentBody.style.top = null;
        documentBody.removeAttribute('data-popup-scrolltop');
        document.documentElement.scrollTop = parseInt(bodyScrollTop)
    }
}
function t702_showPopup(recId) {
    var rec = document.getElementById('rec' + recId);
    if (!rec)
        return;
    var container = rec.querySelector('.t702');
    if (!container)
        return;
    var windowWidth = window.innerWidth;
    var screenMin = rec.getAttribute('data-screen-min');
    var screenMax = rec.getAttribute('data-screen-max');
    if (screenMin && windowWidth < parseInt(screenMin, 10))
        return;
    if (screenMax && windowWidth > parseInt(screenMax, 10))
        return;
    var popup = rec.querySelector('.t-popup');
    var popupTooltipHook = popup.getAttribute('data-tooltip-hook');
    var ranges = rec.querySelectorAll('.t-range');
    var documentBody = document.body;
    if (ranges.length) {
        Array.prototype.forEach.call(ranges, function (range) {
            t702__triggerEvent(range, 'popupOpened')
        })
    }
    t_onFuncLoad('t_popup__showPopup', function () {
        t_popup__showPopup(popup)
    });
    documentBody.classList.add('t-body_popupshowed');
    documentBody.classList.add('t702__body_popupshowed');
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream && window.isiOSVersion && window.isiOSVersion[0] === 11) {
        setTimeout(function () {
            t702_lockScroll()
        }, 500)
    }
    t702__lazyLoad();
    t702__triggerEvent(popup, 'tildamodal:show' + popupTooltipHook)
}
function t702_closePopup(recId) {
    var rec = document.getElementById('rec' + recId);
    var popup = rec.querySelector('.t-popup');
    var popupTooltipHook = popup.getAttribute('data-tooltip-hook');
    var popupAll = document.querySelectorAll('.t-popup_show:not(.t-feed__post-popup):not(.t945__popup)');
    if (popupAll.length == 1) {
        document.body.classList.remove('t-body_popupshowed')
    } else {
        var newPopup = [];
        for (var i = 0; i < popupAll.length; i++) {
            if (popupAll[i].getAttribute('data-tooltip-hook') === popupTooltipHook) {
                popupAll[i].classList.remove('t-popup_show');
                newPopup.push(popupAll[i])
            }
        }
        if (newPopup.length === popupAll.length) {
            document.body.classList.remove('t-body_popupshowed')
        }
    }
    popup.classList.remove('t-popup_show');
    document.body.classList.remove('t702__body_popupshowed');
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream && window.isiOSVersion && window.isiOSVersion[0] === 11) {
        t702_unlockScroll()
    }
    t_onFuncLoad('t_popup__addFocusOnTriggerButton', function () {
        t_popup__addFocusOnTriggerButton()
    });
    setTimeout(function () {
        var popupHide = document.querySelectorAll('.t-popup:not(.t-popup_show)');
        for (var i = 0; i < popupHide.length; i++) {
            popupHide[i].style.display = 'none'
        }
    }, 300);
    t702__triggerEvent(popup, 'tildamodal:close' + popupTooltipHook)
}
function t702_sendPopupEventToStatistics(popupName) {
    var virtPage = '/tilda/popup/';
    var virtTitle = 'Popup: ';
    if (popupName.substring(0, 7) == '#popup:') {
        popupName = popupName.substring(7)
    }
    virtPage += popupName;
    virtTitle += popupName;
    if (window.Tilda && typeof Tilda.sendEventToStatistics == 'function') {
        Tilda.sendEventToStatistics(virtPage, virtTitle, '', 0)
    } else {
        if (ga) {
            if (window.mainTracker != 'tilda') {
                ga('send', {
                    hitType: 'pageview',
                    page: virtPage,
                    title: virtTitle
                })
            }
        }
        if (window.mainMetrika && window[window.mainMetrika]) {
            window[window.mainMetrika].hit(virtPage, {
                title: virtTitle,
                referer: window.location.href
            })
        }
    }
}
function t702_onSuccess(form) {
    t_onFuncLoad('t_forms__onSuccess', function () {
        t_forms__onSuccess(form)
    })
}
function t702__lazyLoad() {
    if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        t_onFuncLoad('t_lazyload_update', function () {
            t_lazyload_update()
        })
    }
}
function t702__triggerEvent(el, eventName) {
    var event;
    if (typeof window.CustomEvent === 'function') {
        event = new CustomEvent(eventName)
    } else if (document.createEvent) {
        event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, !0, !1)
    } else if (document.createEventObject) {
        event = document.createEventObject();
        event.eventType = eventName
    }
    event.eventName = eventName;
    if (el.dispatchEvent) {
        el.dispatchEvent(event)
    } else if (el.fireEvent) {
        el.fireEvent('on' + event.eventType, event)
    } else if (el[eventName]) {
        el[eventName]()
    } else if (el['on' + eventName]) {
        el['on' + eventName]()
    }
}
