window.requestAnimationFrame =
    window.__requestAnimationFrame ||
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        (function () {
            return function (callback, element) {
                var lastTime = element.__lastTime;
                if (lastTime === undefined) {
                    lastTime = 0;
                }
                var currTime = Date.now();
                var timeToCall = Math.max(1, 33 - (currTime - lastTime));
                window.setTimeout(callback, timeToCall);
                element.__lastTime = currTime + timeToCall;
            };
        })();
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));
var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;
    let backgroundColor = "#000000";
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    var heartPosition = function (rad) {
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    var starPosition = function (rad) {
        var outerRadius = 1;
        var innerRadius = 0.5;
        var spikes = 5;
        var rot = Math.PI / 2 * 3;
        var x = Math.cos(rad);
        var y = Math.sin(rad);
        var radius = (rad % (Math.PI * 2 / spikes) < Math.PI * 2 / (spikes * 2)) ? outerRadius : innerRadius;
        return [x * radius, y * radius];
    };
    var circlePosition = function (rad) {
        return [Math.cos(rad), Math.sin(rad)];
    };
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    let traceCount = mobile ? 20 : 50;
    var heartPoints = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    var shape = 'heart';
    var shapePoints = [];
    function calculateShapePoints() {
        shapePoints = [];
        var positionFunction;
        if (shape === 'heart') {
            positionFunction = heartPosition;
        } else if (shape === 'star') {
            positionFunction = starPosition;
        } else if (shape === 'circle') {
            positionFunction = circlePosition
        }
        for (i = 0; i < Math.PI * 2; i += dr) shapePoints.push(scaleAndTranslate(positionFunction(i), 210, 13, 0, 0));
        for (i = 0; i < Math.PI * 2; i += dr) shapePoints.push(scaleAndTranslate(positionFunction(i), 150, 9, 0, 0));
        for (i = 0; i < Math.PI * 2; i += dr) shapePoints.push(scaleAndTranslate(positionFunction(i), 90, 5, 0, 0));
    }
    calculateShapePoints();
    var heartPointsCount = shapePoints.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < shapePoints.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * shapePoints[i][0] + width / 2;
            targetPoints[i][1] = ky * shapePoints[i][1] + height / 2;
        }
    };

    var e = [];
    function initializeParticles() {
        e = [];
        for (i = 0; i < heartPointsCount; i++) {
            var x = rand() * width;
            var y = rand() * height;
            e[i] = {
                vx: 0,
                vy: 0,
                R: 2,
                speed: rand() + 5,
                q: ~~(rand() * heartPointsCount),
                D: 2 * (i % 2) - 1,
                force: 0.2 * rand() + 0.7,
                f: "hsla(" + ~~(rand() * 360) + ",100%,50%,.3)",
                trace: [],
                isHeart: false
            };
            for (var k = 0; k < traceCount; k++) e[i].trace[k] = {x: x, y: y};
        }
    }
    initializeParticles();

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    let colorToggle = false;
    let animationSpeed = 1;
    let isPaused = false;
    const speedControl = document.getElementById('speed');
    const colorControl = document.getElementById('color');
    const toggleButton = document.getElementById('toggle');
    const shapeControl = document.getElementById('shape');
    const backgroundColorControl = document.getElementById('backgroundColor');
    const trailLengthControl = document.getElementById('trailLength');

    speedControl.addEventListener('input', () => {
        animationSpeed = parseFloat(speedControl.value);
    });

    toggleButton.addEventListener('click', () => {
        isPaused = !isPaused;
        toggleButton.textContent = isPaused ? 'Start' : 'Pause';
    });

    shapeControl.addEventListener('change', () => {
        shape = shapeControl.value;
        calculateShapePoints();
        heartPointsCount = shapePoints.length;
        pulse((1 + Math.cos(time)) * .5, (1 + Math.cos(time)) * .5);
    });

    backgroundColorControl.addEventListener('input', () => {
        backgroundColor = backgroundColorControl.value;
        resizeCanvas();
    });

    trailLengthControl.addEventListener('input', () => {
        traceCount = parseInt(trailLengthControl.value);
        initializeParticles();
    });

    let heartColor = "#800080";
    colorControl.addEventListener('input', () => {
        heartColor = colorControl.value;
    });

    function resizeCanvas() {
        var aspectRatio = 1; // You can adjust this to change the aspect ratio
        var newWidth = koef * innerWidth;
        var newHeight = koef * innerHeight;

        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Handle high-DPI displays
        var devicePixelRatio = window.devicePixelRatio || 1;
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
        canvas.width = newWidth * devicePixelRatio;
        canvas.height = newHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);


        width = canvas.width;
        height = canvas.height;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        pulse((1 + Math.cos(time)) * .5, (1 + Math.cos(time)) * .5);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createFractalHeart(x, y, size, level, color) {
        if (level === 0) return;
        var fractalHeartPoints = [];
        var i;
        var dr = mobile ? 0.3 : 0.1;
        var fractalHeartPointsCount = fractalHeartPoints.length;
        var fractalTargetPoints = [];
        for (i = 0; i < fractalHeartPoints.length; i++) {
            fractalTargetPoints[i] = [];
            fractalTargetPoints[i][0] = fractalHeartPoints[i][0] * size + x;
            fractalTargetPoints[i][1] = fractalHeartPoints[i][1] * size + y;
        }
        for (i = 0; i < fractalTargetPoints.length; i++) {
            ctx.fillStyle = color;
            ctx.fillRect(fractalTargetPoints[i][0], fractalTargetPoints[i][1], 1, 1);
        }
        createFractalHeart(x + size * 50, y + size * 50, size * 0.5, level - 1, adjustColor(color, 20));
        createFractalHeart(x - size * 50, y - size * 50, size * 0.5, level - 1, adjustColor(color, -20));
    }

    var loop = function () {
        if (isPaused) {
            requestAnimationFrame(loop);
            return;
        }

        var n = -Math.cos(time);
        pulse((1 + n) * .5, (1 + n) * .5);
        time += config.timeDelta * animationSpeed;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);
        colorToggle = !colorToggle;
        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
             if (10 > length && !u.isHeart) {
                u.isHeart = true;
            }
            if (u.isHeart) {
                u.f = colorToggle ? heartColor :  adjustColor(heartColor, 20);
            }
            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                }
                else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        createFractalHeart(width / 2, height / 2, 0.5, 3, heartColor);
        window.requestAnimationFrame(loop, canvas);
    };

    function adjustColor(hex, amount) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const newR = Math.min(255, Math.max(0, r + amount));
        const newG = Math.min(255, Math.max(0, g + amount));
        const newB = Math.min(255, Math.max(0, b + amount));
        return `hsla(${rgbToHsl(newR, newG, newB)[0]},100%,50%,.3)`;
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    }

    loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);
