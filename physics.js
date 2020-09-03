// module aliases
var Engine = Matter.Engine,
	Events = Matter.Events,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

var pc = document.getElementById('physics-container');
var els = pc.children;

var pcWidth;
var pcHeight;
var physicsObjects = [];

var translate = function(x, y, angle) {
	return 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + angle + 'rad)';
};

var initialize = function() {
	pcWidth = pc.offsetWidth;
	pcHeight = pc.offsetHeight;

	for (var el of els) {
		physicsObjects.push({
			el: el,
			width: el.offsetWidth,
			height: el.offsetHeight,
			x: el.offsetLeft,
			y: el.offsetTop,
			style: el.style.cssText
		});
	}

	pc.style.width = pcWidth + 1 + 'px';
	pc.style.height = pcHeight + 1 + 'px';

	World.add(engine.world, [
		Bodies.rectangle(pcWidth / 2, pcHeight - 30, pcWidth, 60, { isStatic: true }),
		Bodies.rectangle(-30, pcHeight / 2, 60, pcHeight, { isStatic: true }),
		Bodies.rectangle(pcWidth + 30, pcHeight / 2, 60, pcHeight, { isStatic: true })
	]);


	for (var obj of physicsObjects) {
		obj.body = Bodies.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height);
		World.add(engine.world, [obj.body]);

		obj.el.style.position = 'absolute';
		obj.el.style.top = 0;
		obj.el.style.left = 0;
		obj.el.style.width = obj.width + 1 + 'px';
		obj.el.style.height = obj.height + 1 + 'px';
		obj.el.style.transform = translate(obj.x, obj.y, 0);
		obj.el.transformOrigin = '50% 50%';
	}
};

var setPosition = function(obj, x, y, angle) {
	obj.el.style.transform = translate(x, y, angle);
};

var setPositionFromBody = function(obj) {
	var pos = obj.body.position;
	var x = pos.x - obj.width / 2;
	var y = pos.y - obj.height / 2;
	var angle = obj.body.angle;

	setPosition(obj, x, y, angle)
};

var tween = function(start, end, progress) {
	var x = progress;
	// "easeInOutQuad" from easings.net
	var smoothed = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

	// "easeInOutCirc" from easings.net
	// var smoothed = x < 0.5
	// 				? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
	// 				: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;

	return smoothed * end + (1 - smoothed) * start;
};

var updatePositions = function() {
	for (var obj of physicsObjects) {
		setPositionFromBody(obj);
	}
};

var resetObject = function(obj) {
	obj.el.style.cssText = obj.style;
};

var revertToOriginal = function() {
	Events.off(engine, 'afterUpdate', updatePositions);
	World.clear(engine.world);
	Engine.clear(engine);

	var steps = 60;
	var currentStep = 1;

	var animate = function() {
		if (currentStep <= steps) {
			var progress = currentStep / steps;

			for (var obj of physicsObjects) {
				var pos = obj.body.position;
				var oldX = pos.x - obj.width / 2;
				var oldY = pos.y - obj.height / 2;
				var oldAngle = obj.body.angle;

				var x = tween(oldX, obj.x, progress);
				var y = tween(oldY, obj.y, progress);
				var angle = tween(oldAngle, 0, progress);

				setPosition(obj, x, y, angle);
			}

			currentStep++;
			requestAnimationFrame(animate);
		} else {
			for (var obj of physicsObjects) {
				resetObject(obj);
			}
		}
		
	};

	requestAnimationFrame(animate);
};

initialize();
console.log(physicsObjects);

Events.on(engine, 'afterUpdate', updatePositions);

// run the engine
Engine.run(engine);

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

Render.run(render);

setTimeout(revertToOriginal, 2000);
