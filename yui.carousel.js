YUI().use('event-base-ie', 'node', 'event', 'transition', function(Y) {
    if (typeof window.console == 'undefined') {
        window.console = { log: function() {}, info: function() {}, warn: function() {} }
    }
    Y.Event.define('windowresize', {
        on: (Y.UA.gecko && Y.UA.gecko < 1.91) ? function(node, sub, notifier) {
            sub._handle = Y.Event.attach('resize', function(e) {
                notifier.fire(e);
            });
        } : function(node, sub, notifier) {
            var delay = Y.config.windowResizeDelay || 100;
            sub._handle = Y.Event.attach('resize', function(e) {
                if (sub._timer) {
                    sub._timer.cancel();
                }
                sub._timer = Y.later(delay, Y, function() {
                    notifier.fire(e);
                });
            });
        },
        detach: function(node, sub) {
            if (sub._timer) {
                sub._timer.cancel();
            }
            sub._handle.detach();
        }
    });
    var interval;
    var bw = Y.one('body').get('winWidth');
    var showcase = Y.one('#dhShowcase');
    var carousel = Y.one('#dhCarousel');
    var carouselNav = Y.one('#dhCarouselNav');
    var cars = Y.all('#dhCarousel li');
    var carws, cl, cw, pos, cur;
    var loopCount = 0;
    var carw;
    var shift = 0;
    var clickCount = 0;
    
    var reset = function() {
        carws = cars.get('offsetWidth');
        carw = carws[0];
        cl = carws.length;
        cw = 0,
            pos = 0,
            cur = 0;
        loopCount = 0;
        Y.each(carws, function(val, key) {
            cw += val;
        });
        carousel.setStyles({
            'width': cw + 'px',
            'left': '0'
        });
    };
    reset();
    var rearrange = function(arr, n) {
        var c = arr;
        var prependValue;
        for (var i = 0; i < c.length; i++) {
            if (n + 1 == c[i]) {
                prependValue = c[i];
                c.splice(i, 1);
            }
        }
        if (typeof prependValue != 'undefined') {
            c.unshift(prependValue);
        }
        return c;
    }
    var slide = function(e) {
        e.preventDefault();
        clearInterval(interval);
        Y.all('.dhSlideNav').removeClass('active');
        var x;
        var navItem;
        var that = this;
        if (this.hasClass('dhSlideNav')) {
            var id = this.get('id');
            var index = id.split('-')[1];
            clickCount = index - 1;
            if (index == 1) {
                clickCount = 4;
            }
            var shiftIndex = Y.all('#dhCarousel li').indexOf(Y.one('#dhSlide-' + index));
            var nodeIndex = index - 1;
            Y.one('#dhNavItem-' + index).addClass('active');
            var carsArr = [];
            Y.all('#dhCarousel li').each(function(el) {
                var i = Y.all('#dhCarousel li').indexOf(el);
                if (i != nodeIndex) {
                    carsArr.push(i + 1);    
                }
            });
            var carsArrRe = rearrange(carsArr, nodeIndex + 1);
            shift = '-' + (carw * shiftIndex);
            x = shift + 'px';
            carousel.transition({
                duration: 0.5,
                left: x,
                easing: 'ease-out'
            }, function() {
                for (var i = 0; i < carsArrRe.length; i++) {
                    Y.one('#dhCarousel').append(Y.one('#dhSlide-' + carsArrRe[i]));
                }
                carousel.setStyle('left', '0');
            });
            return;
        } else {
            if (this.hasClass('dhNext')) {
                clickCount++;
                if (clickCount > cl) {
                    clickCount = 1;
                }
                navItem = clickCount + 1 == 5 ? 1 : clickCount + 1;
                Y.one('#dhNavItem-' + (navItem)).addClass('active');
                shift = '-' + carw;
            } else if (this.hasClass('dhPrev')) {
                if (clickCount < 1) {
                    clickCount = cl;
                }
                shift = '0';
                carousel.setStyle('left', '-' + carw + 'px');
                var $lastSlide = Y.one('#dhSlide-' + clickCount);
                navItem = clickCount;
                Y.one('#dhNavItem-' + navItem).addClass('active');
                carousel.prepend($lastSlide);
                clickCount--;
            }
        }
        x = shift + 'px';
        carousel.transition({
            duration: 0.5,
            left: x,
            easing: 'ease-out'
        }, function() {
            var $firstSlide = Y.one('#dhSlide-' + (clickCount));
            if (that.hasClass('dhNext')) {
                carousel.setStyle('left', '0');
                $firstSlide.appendTo('#dhCarousel');
            }
        });
    }
    var slideNext = function() {
        carousel.transition({
            duration: 0.5,
            left: '-' + carw + 'px',
            easing: 'ease-out'
        }, function() {
            var $firstSlide = Y.one('#dhSlide-' + (clickCount));
            carousel.setStyle('left', '0');
            $firstSlide.appendTo('#dhCarousel');
        });
    }
    var automatic = function() {
        interval = setInterval(function() {
            clickCount++;
            if (clickCount > cl) {
                clickCount = 1;
            }
            var navItem = clickCount + 1 == 5 ? 1 : clickCount + 1;
            Y.all('.dhSlideNav').removeClass('active');
            Y.one('#dhNavItem-' + (navItem)).addClass('active');
            slideNext();
        }, 3500);
    }
    automatic();
    var createNavigation = function() {
        var nav = Y.Node.create('<div>').setAttribute('id', 'dhNavigation');
        for (var i = 0; i < cl; i++) {
            var item = Y.Node.create('<a>').setAttribute('href', '#').set('id', 'dhNavItem-' + (i + 1)).addClass('dhSlideNav');
            if (i == 0) {
                item.addClass('active');
            }
            carouselNav.append(item);
        }
    }
    createNavigation();
    var nxt = Y.Node.create('<a>').setAttribute('href', '#').addClass('dhNext dhBtn').set('text', 'Next');
    var prev = Y.Node.create('<a>').setAttribute('href', '#').addClass('dhPrev dhBtn').set('text', 'Prev');
    showcase.append(nxt);
    showcase.append(prev);
    showcase.delegate('click', slide, '.dhBtn, .dhSlideNav');
    Y.on('windowresize', function(e) {
        var nbw = Y.one('body').get('winWidth');
        if (bw >= 1260 && nbw < 1260) reset();
        if (bw < 1260 && nbw >= 1260) reset();
        bw = nbw;
    });
});