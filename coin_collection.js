let img;
let stimH = 50;
let stimW = 50;
let nStim = 10;
let remaining = nStim;
let coins = [];
let misses = [];
let countDownDate = null;

var terminate_subject_data_worker = false;
subject_data_worker.done = function (x) {
	// when all messages are processed save the information as a JATOS result
	if (terminate_subject_data_worker) {
		var subData = data_helper.get_subject_data(false);
		var currentRunData = subData[jatos.studyResultId];

		jatos.appendResultData(currentRunData).then(function () {
			console.log('finished');
		});
	}
};

function setup() {
	createCanvas(windowWidth, windowHeight);

	stimW = width / 5;
	stimH = stimW;

	Coin.prototype.setImage('images/outcome_win.png', stimH, stimW)

	// limit nStim to half the theoretical max amount
	nStim = min(nStim, 0.5 * floor((height*width)/(stimH* stimW)));

	subject_data_worker.postMessage({
		coins_task_init_data: { 
			windowWidth,
			windowHeight,
			nStim,
			stimW,
			stimH,
			start_time: new Date()
		}
	});

	for (var i = 0; i < nStim; i++) {
		var x = random(0, width - stimW);
		var y = random(0, height - stimH);		

		if (coins.some(c => dist(x,y,c.x,c.y) < max(stimW, stimW))) {
			i -=1
		} else {			
			coins.push(new Coin(x, y));
		}
	}

	textSize(windowHeight / 10);
	textAlign(CENTER, CENTER);

	var dt = new Date();
	dt.setSeconds( dt.getSeconds() + 30 );
	countDownDate = dt.getTime();
}

function draw () {
	background(200);
	
	var now = new Date();

	// calculate coundwon timer
	var distance = countDownDate - now.getTime();
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	fill(255, 0, 0);
	text(max(seconds, 0), windowWidth * 3 / 4, windowHeight / 10);

	if (!remaining || now.getTime() > countDownDate) {
		noLoop();
		
		fill(0, 0, 255);
		text("BYE BYE", windowWidth / 2, windowHeight / 2);

		subject_data_worker.postMessage({
			coin_task_finish_status: {
				remaining,
				finish_time: now
			}
		});
		terminate_subject_data_worker = true;		
	} else {
		for (var i = 0; i < remaining; i++) {
			coins[i].draw();
		}
	}
}

function mousePressed() {
	var hit = false;

	for (var i = 0; i < remaining; i++) {
		if (coins[i].isPressed()) {
			coins.splice(i, 1);
			remaining -= 1;
			hit = true;

			subject_data_worker.postMessage({
				coins_task_state: coins.map(c => c.serialize())
			});

			if (remaining == 0) {
				terminate_subject_data_worker = true;
			}
		}
	}

	if (!hit) {
		misses.push({
			mouseX,
			mouseY,
			miss_time: new Date()
		});

		subject_data_worker.postMessage({
			coins_task_misses: misses
		});
	}
}

// Setup coin object
function Coin (x, y) {
	this.x = x;
	this.y = y;
	this.clickTime = null;

	this.draw = function () {
		image(Coin.prototype.img, this.x, this.y);
	}

	this.isPressed = function () {
		if (mouseX > this.x && mouseX < (this.x + Coin.prototype.w) &&
				mouseY > this.y && mouseY < (this.y + Coin.prototype.h)) {
			this.clickTime = new Date();
			return true;
		} else {
			return false;
		}
	}

	this.serialize = function () {
		return {
			x: this.x,
			y: this.y,
			clickTime: this.clickTime
		};
	}
}

Coin.prototype.setImage = function (imgUrl, height, width) {
	Coin.prototype.img = loadImage(imgUrl, img => {
		img.resize(width, height);
	});	

	Coin.prototype.h = height;
	Coin.prototype.w = width;
}