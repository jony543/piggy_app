(async () => {

	await jatos.loaded();

	let bg_img_path = 'images/cave.jpg';
	let stimSizeProportionOfScreen = 0.2; // will determine the size (width and height of the stimuli)
	let textSizeProportionOfScreenWidth = 0.1;
	let ProportionOfScreenWidthToPlaceCounter = 0.9;
	let ProportionOfScreenHeightToPlaceCounter = 0.05;

	let counterTextColor = [255, 0, 0]; // can be one value for gray, 3 for RGB, 4 to include alpha
	let finishMessage = "BYE BYE";
	let finishMessageTextColor = [0, 0, 255]; // can be one value for gray, 3 for RGB, 4 to include alpha
	let duration = 25; // in seconds
	let nStim = 10; // needs to be an even number here
	let remaining = nStim; // 
	let coins = [];
	let rocks = [];
	let misses = [];
	let countDownDate = null;
	let counterXposition = null;
	let counterYposition = null;
	let text_size = null;
	
	let outcomeImageHeightWidthRatio = 325/349; // namely the height = 325 and width = 349


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

	window.setup = function () {
		createCanvas(windowWidth - 17, windowHeight - 20); // The canvas does not start from the real x=0 and y=0 and this is why I do this. * to see the offsets of the body do document.body.getBoundingClientRect() in the console.

		// setting some important sizes:
		counterXposition = windowWidth * ProportionOfScreenWidthToPlaceCounter;
		counterYposition = windowHeight * ProportionOfScreenHeightToPlaceCounter;
		text_size = windowWidth * textSizeProportionOfScreenWidth;

		document.body.style.backgroundColor = "black"; // set the background color (around and behind the background image)
		bg_img = loadImage(bg_img_path);

		stimW = width * stimSizeProportionOfScreen;
		stimH = stimW * outcomeImageHeightWidthRatio;

		Coin.prototype.setImage('images/outcome_win.png', stimH, stimW)
		Rock.prototype.setImage('images/outcome_no_win.png', stimH, stimW)

		// limit nStim to half the theoretical max amount
		nStim = min(nStim, 0.5 * floor((height * width) / (stimH * stimW)) - 1); // Rani: I added -1 to the theoretical max amount to cover for the lack of stimulus on the time counter.
		remaining = nStim;

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

		for (var i = 0; i < nStim / 2; i++) {
			var x = random(0, width - stimW);
			var y = random(0, height - stimH);
			if (rocks.some(c => abs(x-c.x) <= stimW && abs(y-c.y) <= stimH) || // making sure they are not going over each other
				coins.some(c => abs(x-c.x) <= stimW && abs(y-c.y) <= stimH) ||
				(x > (counterXposition - stimW - 0.75 * text_size) && y < (counterYposition + 0.75 * text_size))) { //makeing sure they does not cover the remaining time counter.
				i -= 1
			} else {
				coins.push(new Coin(x, y));
			}
		}

		for (var i = 0; i < nStim / 2; i++) {
			var x = random(0, width - stimW);
			var y = random(0, height - stimH);
			if (rocks.some(c => abs(x-c.x) <= stimW && abs(y-c.y) <= stimH) || // making sure they are not going over each other
				coins.some(c => abs(x-c.x) <= stimW && abs(y-c.y) <= stimH) ||
				(x > (counterXposition - stimW - 0.75 * text_size) && y < (counterYposition + 0.75 * text_size))) { //makeing sure they does not cover the remaining time counter.
				i -= 1
			} else {
				rocks.push(new Rock(x, y));
			}
		}


		textSize(text_size);
		textAlign(CENTER, CENTER);

		var dt = new Date();
		dt.setSeconds(dt.getSeconds() + duration);
		countDownDate = dt.getTime();
	}

	window.draw = function () {
		background(bg_img);

		var now = new Date();

		// calculate coundwon timer
		var distance = countDownDate - now.getTime();
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

		fill(...counterTextColor);
		text(max(seconds + 1, 0), counterXposition, counterYposition); // seconds + relative x,y position of the counter

		if (!remaining || now.getTime() > countDownDate) {

			noLoop();

			fill(...finishMessageTextColor);
			text(finishMessage, windowWidth / 2, windowHeight / 2); // position of the finish text

			subject_data_worker.postMessage({
				coin_task_finish_status: {
					remaining,
					finish_time: now
				}
			});
			terminate_subject_data_worker = true;
		} else {
			coins.filter(c => !c.isCollected()).forEach(c => {
				c.draw();
			});
			rocks.filter(c => !c.isCollected()).forEach(c => {
				c.draw();
			});
		}
	}

	window.mouseClicked = function () {
		var hit = false;

		coins.filter(c => !c.isCollected()).forEach(c => {
			if (c.isPressed()) {
				remaining -= 1;
				hit = true;

				subject_data_worker.postMessage({
					coins_task_coin_state: coins.map(c => c.serialize())
				});

				if (remaining == 0) {
					terminate_subject_data_worker = true;
				}
			}
		});

		rocks.filter(c => !c.isCollected()).forEach(c => {
			if (c.isPressed()) {
				remaining -= 1;
				hit = true;

				subject_data_worker.postMessage({
					coins_task_rock_state: rocks.map(c => c.serialize())
				});

				if (remaining == 0) {
					terminate_subject_data_worker = true;
				}
			}
		});

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
	function Coin(x, y) {
		this.x = x;
		this.y = y;
		this.clickTime = null;

		this.isCollected = () => !!this.clickTime;

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

	// Setup rock object
	function Rock(x, y) {
		this.x = x;
		this.y = y;
		this.clickTime = null;

		this.isCollected = () => !!this.clickTime;

		this.draw = function () {
			image(Rock.prototype.img, this.x, this.y);
		}

		this.isPressed = function () {
			if (mouseX > this.x && mouseX < (this.x + Rock.prototype.w) &&
				mouseY > this.y && mouseY < (this.y + Rock.prototype.h)) {
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

	Rock.prototype.setImage = function (imgUrl, height, width) {
		Rock.prototype.img = loadImage(imgUrl, img => {
			img.resize(width, height);
		});

		Rock.prototype.h = height;
		Rock.prototype.w = width;
	}

})();