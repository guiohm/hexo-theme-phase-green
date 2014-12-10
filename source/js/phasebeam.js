(function($){
	var canvas = $('#phasebeam').children('canvas'),
		background = canvas[0],
		foreground1 = canvas[1],
		foreground2 = canvas[2],
		config = {
			polygon: {
				sides: 5,
				amount: 7, // see in createItem() for other amount
				layer: 3,
				color: [97, 207, 157],
				alpha: 0.3
			},
			circle: {
				amount: 0,
				layer: 3,
				color: [157, 97, 207],
				alpha: 0.3
			},
			line: {
				amount: 18,
				layer: 3,
				color: [255, 255, 255],
				alpha: 0.3
			},
			interaction: {
				boxSize: 200, // a square side
				force: 420,
			},
			speed: 0.12,
			init_momentum: 200,
			angle: 36,
			drawAreaHeight: 241,
			shutdowntimer: 4000, // milliseconds
			friction: 0.992,
			version: 1 // randomly changed in createItem()
		},
		mouse = {x: 0, y: 0}
		stopAnimation = false;

	if (background.getContext){
		var bctx = background.getContext('2d'),
			fctx1 = foreground1.getContext('2d'),
			fctx2 = foreground2.getContext('2d'),
			M = window.Math, // Cached Math
			degree = config.angle/360*M.PI*2,
			circles = [],
			lines = [],
			polygons = [],
			wWidth, wHeight, timer, shutdowntimer;

		requestAnimationFrame = window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function(callback, element) { setTimeout(callback, 1000 / 60); };

		cancelAnimationFrame = window.cancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.msCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			clearTimeout;

		var resetAll = function() {
			cancelAnimationFrame(timer);
			shutdowntimer = config.shutdowntimer;
		}

		var setCanvasHeight = function(){
			wWidth = $(window).width();
			wHeight = $(window).height();

			canvas.each(function(){
				this.width = wWidth;
				if ($(this).hasClass('background')) {
					this.height = wHeight;
				} else {
					this.height = config.drawAreaHeight;
				}
			});
		};

		var drawPolygon = function(x, y, radius, sides, color, alpha, startAngle, convex) {
			if (sides < 3) return;
			var a = (M.PI * 2)/sides;
			a = convex ? 2*a : a;
			var gradient = fctx1.createRadialGradient(x, y, radius, x, y, 0);
			gradient.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+alpha+')');
			gradient.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha-0.1)+')');
			fctx1.save();
			fctx1.beginPath();
			fctx1.translate(x,y);
			if (startAngle) {
				fctx1.rotate(startAngle);
			}
			fctx1.moveTo(radius,0);
			for (var i = 1; i < sides; i++) {
				fctx1.lineTo(radius*M.cos(a*i),radius*M.sin(a*i));
			}
			fctx1.closePath();
			fctx1.restore();
			fctx1.fillStyle = gradient;
			fctx1.fill();
		}

		var drawCircle = function(x, y, radius, color, alpha){
			var gradient = fctx1.createRadialGradient(x, y, radius, x, y, 0);
			gradient.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+alpha+')');
			gradient.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha-0.1)+')');

			fctx1.beginPath();
			fctx1.arc(x, y, radius, 0, M.PI*2, true);
			fctx1.fillStyle = gradient;
			fctx1.fill();
		};

		var drawLine = function(x, y, width, color, alpha){
			var endX = x+M.sin(degree)*width,
				endY = y-M.cos(degree)*width,
				gradient = fctx2.createLinearGradient(x, y, endX, endY);
			gradient.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+','+alpha+')');
			gradient.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+','+(alpha-0.1)+')');

			fctx2.beginPath();
			fctx2.moveTo(x, y);
			fctx2.lineTo(endX, endY);
			fctx2.lineWidth = 3;
			fctx2.lineCap = 'round';
			fctx2.strokeStyle = gradient;
			fctx2.stroke();
		};

		var drawBack = function(){
			bctx.clearRect(0, 0, wWidth, wHeight);

			var gradient = [];

			gradient[0] = bctx.createRadialGradient(wWidth*0.3, wHeight*0.1, 0, wWidth*0.3, wHeight*0.1, wWidth*0.9);
			gradient[0].addColorStop(0, 'rgb(0, 77, 26)');
			gradient[0].addColorStop(1, 'transparent');

			bctx.translate(wWidth, 0);
			bctx.scale(-1,1);
			bctx.beginPath();
			bctx.fillStyle = gradient[0];
			bctx.fillRect(0, 0, wWidth, wHeight);

			gradient[1] = bctx.createRadialGradient(wWidth*0.1, wHeight*0.1, 0, wWidth*0.3, wHeight*0.1, wWidth);
			gradient[1].addColorStop(0, 'rgb(0, 240, 150)');
			gradient[1].addColorStop(0.8, 'transparent');

			bctx.translate(wWidth, 0);
			bctx.scale(-1,1);
			bctx.beginPath();
			bctx.fillStyle = gradient[1];
			bctx.fillRect(0, 0, wWidth, wHeight);

			gradient[2] = bctx.createRadialGradient(wWidth*0.1, wHeight*0.5, 0, wWidth*0.1, wHeight*0.5, wWidth*0.5);
			gradient[2].addColorStop(0, 'rgb(20, 105, 40)');
			gradient[2].addColorStop(1, 'transparent');

			bctx.beginPath();
			bctx.fillStyle = gradient[2];
			bctx.fillRect(0, 0, wWidth, wHeight);

		};

		var animate = function(){
			var sin = M.sin(degree),
				cos = M.cos(degree),
				friction,
				height = config.drawAreaHeight,
				max = config.interaction.boxSize;

			friction = shutdowntimer > 0 ? 1 : config.friction;

			if (config.polygon.amount > 0 && config.polygon.layer > 0){
				fctx1.clearRect(0, 0, wWidth, height);
				for (var i=0, len = polygons.length; i<len; i++){
					var item = polygons[i],
						x = item.x,
						y = item.y,
						radius = item.radius
						mouse_interact = false,
						interaction_distance= 0;

					item.momentum_x = item.momentum_x * item.friction;
					item.momentum_y = item.momentum_y * item.friction;

					if ((mouse.x - max) < x && x < (mouse.x + max) && (mouse.y - max) < y && y < (mouse.y + max)){
						mouse_interact = true;
						interaction_distance = M.pow(x-mouse.x, 2) + M.pow(y-mouse.y, 2);
					}

					if (x > wWidth + radius){
						item.x = -radius;
					} else if (x < -radius){
						item.x = wWidth + radius;
					} else if (mouse_interact){
						item.momentum_x += config.interaction.force / M.pow(interaction_distance,1.2) * (x-mouse.x);
					}

					if (y > height + radius){
						item.y = -radius;
					} else if (y < -radius){
						item.y = height + radius;
					} else if (mouse_interact){
						item.momentum_y += config.interaction.force / M.pow(interaction_distance,1.2) * (y-mouse.y);
					}

					if (shutdowntimer > 0) {
						item.momentum_x += item.speed_x;
						item.momentum_y += item.speed_y;
					}

					item.x += item.momentum_x;
					item.y += item.momentum_y;
					drawPolygon(item.x, item.y, radius, item.sides, item.color, item.alpha, item.angle);
					if (config.version > 1){
						drawPolygon(item.x, item.y, radius, item.sides, item.color, item.alpha, item.angle, true);
					}
				}
			}

			if (config.circle.amount > 0 && config.circle.layer > 0){
				fctx1.clearRect(0, 0, wWidth, height);
				for (var i=0, len = circles.length; i<len; i++){
					var item = circles[i],
						x = item.x,
						y = item.y,
						radius = item.radius;

					var speed = item.speed = item.speed*friction;

					if (x > wWidth + radius){
						x = -radius;
					} else if (x < -radius){
						x = wWidth + radius
					} else {
						x += sin*speed;
					}

					if (y > height + radius){
						y = -radius;
					} else if (y < -radius){
						y = height + radius;
					} else {
						y -= cos*speed;
					}

					if (shutdowntimer > 0) {
						x += sin*speed;
						y -= cos*speed;
					}

					item.x = x;
					item.y = y;
					drawCircle(x, y, radius, item.color, item.alpha);
				}
			}

			if (config.line.amount > 0 && config.line.layer > 0){
				fctx2.clearRect(0, 0, wWidth, height);
				for (var j=0, len = lines.length; j<len; j++){
					var item = lines[j],
						x = item.x,
						y = item.y,
						width = item.width
						speed;

					if (shutdowntimer > 0) {
						speed = item.speed = item.main_speed;
					} else {
						speed = item.speed = item.speed*friction;
					}

					if (speed < 0.1) {
						stopAnimation = true;
					}

					if (x > wWidth + width * sin){
						x = -width * sin;
					} else if (x < -width * sin){
						x = wWidth + width * sin;
					} else {
						x += sin*speed;
					}

					if (y > height + width * cos){
						y = -width * cos;
					} else if (y < -width * cos){
						y = height + width * cos;
					} else {
						y -= cos*speed;
					}

					item.x = x;
					item.y = y;
					drawLine(x, y, width, item.color, item.alpha);
				}
			}

			if (!stopAnimation) {
				timer = requestAnimationFrame(animate);
			} else {
				console.log("Animation Stopped!");
			}
			shutdowntimer -= 1000/60;
		};

		var createItem = function(){
			polygons = [];
			circles = [];
			lines = [];
			config.version = Math.random()*2;
			if (config.version < 1) {
				config.polygon.amount = 23;
			}

			if (config.polygon.amount > 0 && config.polygon.layer > 0){
				for (var i=0; i<config.polygon.amount/config.polygon.layer; i++){
					for (var j=0; j<config.polygon.layer; j++){
						var speed = config.speed*(1+j*0.5);
						polygons.push({
							sides: M.ceil(M.random()*2)+4,//config.polygon.sides,
							x: M.random() * wWidth,
							y: M.random() * config.drawAreaHeight,
							speed_x: M.sin(degree)*speed,
							speed_y: M.cos(degree)*speed,
							momentum_x: M.sin(degree)*speed*config.init_momentum,
							momentum_y: -M.cos(degree)*speed*config.init_momentum,
							friction: M.random()*0.1+0.88,
							radius: M.random()*(20+j*5)+(20+j*5),
							color: config.polygon.color,
							alpha: M.random()*0.2+(config.polygon.alpha-j*0.1),
							angle: M.random()*360/config.polygon.sides
						});
					}
				}
			}

			if (config.circle.amount > 0 && config.circle.layer > 0){
				for (var i=0; i<config.circle.amount/config.circle.layer; i++){
					for (var j=0; j<config.circle.layer; j++){
						circles.push({
							x: M.random() * wWidth,
							y: M.random() * config.drawAreaHeight,
							radius: M.random()*(20+j*5)+(20+j*5),
							color: config.circle.color,
							alpha: M.random()*0.2+(config.circle.alpha-j*0.1),
							speed: config.speed*(1+j*0.5)
						});
					}
				}
			}

			if (config.line.amount > 0 && config.line.layer > 0){
				for (var m=0; m<config.line.amount/config.line.layer; m++){
					for (var n=0; n<config.line.layer; n++){
						var speed = (config.speed+0.5)*(1+n*0.5)
						lines.push({
							x: M.random() * wWidth,
							y: M.random() * config.drawAreaHeight,
							width: M.random()*(20+n*5)+(20+n*5),
							color: config.line.color,
							alpha: M.random()*0.2+(config.line.alpha-n*0.1),
							speed: speed,
							main_speed: speed
						});
					}
				}
			}

			resetAll();
			timer = requestAnimationFrame(animate);
			drawBack();
		};

		var doMouseDown = function(event){
			console.log(event);
			if (event.y <= config.drawAreaHeight) {
				createItem();
			}
		}

		var doMouseMove = function(event){
			if (event.y <= config.drawAreaHeight+200) {
				mouse.x = event.x;
				mouse.y = event.y;
				shutdowntimer = config.shutdowntimer;
				if (stopAnimation) {
					stopAnimation = false;
					timer = requestAnimationFrame(animate);
				}
			}
		}

		$(document).ready(function(){
			setCanvasHeight();
			var b = document.getElementsByTagName('body');
			b[0].addEventListener("mousedown", doMouseDown);
			b[0].addEventListener("mousemove", doMouseMove);
			createItem();
		});
		$(window).resize(function(){
			setCanvasHeight();
			createItem();
		});
	}
})(jQuery);
