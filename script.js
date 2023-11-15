// Element koji predstavlja canvas i samu igru
let myGamePiece;

let asteroids = [];
let myBackground;

//Potrebne slike
const playerImage = new Image();
playerImage.src = '/images/player.png';
const asteroidImage = new Image();
asteroidImage.src = '/images/asteroid.png';
const backgroundImage = new Image();
backgroundImage.src = '/images/background.png';
const crashImage = new Image();
crashImage.src = '/images/crash.png';

let music = false;

//Pocetno vrijeme i vrijeme koje je proteklo u ms
let startTime;
let diff;

//Vrijednosti koje upravljaju kako brzo se generiraju asteroidi, koje velicine i brzine i u kojem broju
const asteroidInterval = 7500; // 7.5 sekundi
const asteroidMaxSize = 100;
const asteroidMinSize = 75;
const asteroidMaxSpeed = 6;
const asteroidMinSpeed = 1;
let nmbOfAsteroids = 7;

let asteroidSpawn;

//Brzina igraca (svemirskog broda)
const playerSpeed = 7;

/**
 * Funkcija koja svaki puta ponovno crta prikaz na ekranu i provjerava kolizije
 */
function updateGameArea() {
    //Ocisti trenutni prikaz i racunaj nove pozicije elemenata i vrijeme
    myGameArea.clear();
    myBackground.update();
    asteroids.forEach(x => {
        x.newPos();
        x.update();
    } )
    myGamePiece.update();
    myGamePiece.newPos();
    updateTime();
    //Provjeri za svaki asteroid je li doslo do kolizije i je li i dalje unutar ekrana
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i];
        //Provjera kolizije sa tolerancijom 10 kod osi X zbog izgleda svemirskog broda radi boljeg UX
        if (
            myGamePiece.x - myGamePiece.width / 2 + 10 < asteroid.x + asteroid.width / 2 - 10 &&
            myGamePiece.x + myGamePiece.width / 2 - 10 > asteroid.x - asteroid.width / 2 + 10 &&
            myGamePiece.y - myGamePiece.height / 2 < asteroid.y + asteroid.height / 2 &&
            myGamePiece.y + myGamePiece.height / 2 > asteroid.y - asteroid.height / 2
        ) {
            //U slucaju kolizije ocisti zaslon, prikazi eksploziju i pusti zvucni zapis eksplozije 
            myGameArea.stop()
            myGameArea.clear()
            myBackground.update()
            document.getElementById("crashMusic").play()
            myGameArea.context.drawImage(crashImage, myGamePiece.x - myGamePiece.width / 2, 
                myGamePiece.y - myGamePiece.height / 2,
                myGamePiece.width + 50, myGamePiece.height + 50)
            //Pogledaj je li ostvareni highScore
            setHighScore(diff)
            document.getElementById("highScore").innerText = "High score: " + 
                formatTime(localStorage.getItem("highScore"))
            reset()
        }
        //Ako je asteroid van okvira, makni referencu na njega
        if (asteroid.x < - asteroidMaxSize || asteroid.y < -asteroidMaxSize 
            || asteroid.x > myGameArea.canvas.width + asteroidMaxSize 
            || asteroid.y > myGameArea.canvas.height + asteroidMaxSize) {
            asteroids.splice(i, 1);
            i--;
            console.log(asteroids)
        }
    }
}

/**
 * Postavlja uvjete igre na pocetne vrijednosti
 */
function reset() {
    myGamePiece = undefined
    asteroids = []
    startTime = undefined
    nmbOfAsteroids = 7
    clearInterval(asteroidSpawn)
    document.getElementById("start").hidden = false;
}

/**
 * Azurira highScore ako je diff veci od trenutnog highScore
 * @param diff - vrijeme trenutnog pokusaja
 */
function setHighScore(diff) {
    if(localStorage.getItem("highScore")) {
        if(diff > localStorage.getItem("highScore")) {
            localStorage.setItem("highScore", diff)
        }
    } else localStorage.setItem("highScore", diff)
}

/**
 * Azurira proteklo vrijeme
 */
function updateTime() {
    if (!startTime) {
        startTime = Date.now();
    }
    
    diff = Date.now() - startTime;

    document.getElementById('timer').innerText = 'Current time: ' + formatTime(diff);
}

/**
 * Zapis vremena u ms pretvara u oblik 00:00:000 (min,sec,ms)
 * @param difference - zapis vremena u ms
 * @returns {string} - zapis vremena u obliku 00:00:000 (min,sec,ms)
 */
function formatTime(difference) {
    const minutes = Math.floor(difference / (60 * 1000)).toString().padStart(2, '0');
    const seconds = Math.floor((difference % (60 * 1000)) / 1000).toString().padStart(2, '0');
    const milliseconds = (difference % 1000).toString().padStart(3, '0');

    return `${minutes}:${seconds}:${milliseconds}`;
}

/**
 * Stvara broj asteroida jednak nmbOfAsteroids i povecava tu vrijednost za jedan
 */
function createAsteroids () {
    for (let i = 0; i < nmbOfAsteroids; i++) {
        asteroids.push(new Asteroid())
    }
    nmbOfAsteroids++;
}

/**
 * Predstavlja sam canvas (igru)
 */
const myGameArea = {
    canvas: document.createElement("canvas"),
    /**
     * Postavlja velicinu canvasa
     */
    setup: function () {
        this.canvas.id = "myCanvas";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
    /**
     * Zapocinje samu igru tako sto postavlja interval na funkciju updateGameArea svakih 16.67 sto je otprilike 60 FPS
     */
    start: function () {
        this.interval = setInterval(updateGameArea, 16.67);
    },
    /**
     * Zaustavlja igru tako sto prekida interval
     */
    stop: function () {
        clearInterval(this.interval);
    },
    /**
     * Brise sve elemeneta sa canvasa, tj. brise sve elemente igre
     */
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

/**
 * Animirana pozadina igre
 * @constructor
 */
function Background() {
    this.image = backgroundImage;
    this.speed = 5;
    this.x = 0;
    this.y = 0;

    /**
     * Pomice pozadinu i tako naizgled imamo osjecaj kretanja, ustvari slika dvije slike jednu ispod druge
     */
    this.update = function () {
        let ctx = myGameArea.context;
        ctx.drawImage(this.image, this.x, this.y, myGameArea.canvas.width, myGameArea.canvas.height);
        ctx.drawImage(this.image, this.x, this.y - myGameArea.canvas.height, myGameArea.canvas.width, myGameArea.canvas.height);
        this.y += this.speed;
        
        if (this.y >= myGameArea.canvas.height) {
            this.y = 0;
        }
    };
}

/**
 * Klasa koja predstavlja asteroid
 * @constructor
 */
function Asteroid() {
    //Generira nasumicnu velicinu asteroida unutar zadanih granica
    this.width = Math.floor(Math.random() * (asteroidMaxSize - asteroidMinSize + 1) + asteroidMinSize);
    this.height = Math.floor(Math.random() * (asteroidMaxSize - asteroidMaxSize + 1) + asteroidMinSize);
    //Nasumicno generira poziciju asteroid malo izvan ekrana i konfigurira njegovu brzinu
    if(Math.random() < 0.5) {
        if(Math.random() < 0.5) {
            this.x = - asteroidMaxSize;
            this.speed_x = Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed);
        } else {
            this.x = myGameArea.canvas.width + asteroidMaxSize
            this.speed_x =  - Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed);
        }
        this.y = Math.floor(Math.random() * (myGameArea.canvas.height + 1));
        if(this.y < myGameArea.canvas.height / 2) {
            this.speed_y = Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
        } else this.speed_y = - Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
    } else {
        if(Math.random() < 0.5) {
            this.y = - asteroidMaxSize;
            this.speed_y = Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
        } else {
            this.y = myGameArea.canvas.height + asteroidMaxSize;
            this.speed_y = - Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
        }
        this.x = Math.floor(Math.random() * (myGameArea.canvas.width + 1));
        if(this.x < myGameArea.canvas.width / 2) {
            this.speed_x = Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
        } else this.speed_x = - Math.floor(Math.random() * (asteroidMaxSpeed - asteroidMinSpeed + 1) + asteroidMinSpeed)
    }
    /**
     * Crta asteroid i njegovu sjenu
     */
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 50;
        ctx.shadowColor = "grey";
        ctx.drawImage(asteroidImage, this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    /**
     * Odreduje novu poziciju asteroida
     */
    this.newPos = function() {
        this.x += this.speed_x;
        this.y += this.speed_y;
    }
}

/**
 * Klasa koja predstavlja igraca (svemirski brod)
 * @param width - sirina svemirskog broda
 * @param height - visina svemirskog broda
 * @param x - pocetna pozicija na X osi
 * @param y - pocetna pozicija na Y osi
 * @constructor
 */
function Player(width, height, x, y) {
    //Brzina igraca
    this.speed = playerSpeed
    this.width = width;
    this.height = height;
    //Pamti koje su trenutno stisnute tipke, vazno zbog dijagonalnog kretanja
    this.keys = {};
    this.x = x;
    this.y = y;
    /**
     * Crta svemirski brod i njegovu sjenu
     */
    this.update = function() {
        let ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 50;
        ctx.shadowColor = "grey";
        ctx.drawImage(playerImage, this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    /**
     * Azurira koje su pritisnute tipke
     * @param event - pritisak ili otpustanje tipke
     */
    this.updateKeys = function (event) {
        this.keys[event.key] = event.type === 'keydown';
    }
    /**
     * Racuna novu poziciju svemirskog broda ovisno o pritisnutim tipkama
     */
    this.newPos = function() {
        if (this.keys['ArrowUp'] && this.keys['ArrowLeft']) {
            if (!((this.y - this.height / 2) <= 0) && !((this.x - this.width / 2) <= 0)) {
                this.y -= this.speed;
                this.x -= this.speed;
            } else {
                if ((this.y - this.height / 2) <= 0) this.y = myGameArea.canvas.height - this.height / 2;
                if ((this.x - this.width / 2) <= 0) this.x = myGameArea.canvas.width - this.width / 2;
            }
        } else if(this.keys['ArrowUp'] && this.keys['ArrowRight']) {
            if (!((this.y - this.height / 2) <= 0) && !((this.x + this.width / 2) >= myGameArea.canvas.width)) {
                this.y -= this.speed;
                this.x += this.speed;
            } else {
                if ((this.y - this.height / 2) <= 0) this.y = myGameArea.canvas.height - this.height / 2;
                if ((this.x + this.width / 2) >= myGameArea.canvas.width) this.x = this.width / 2;
            }
        } else if(this.keys['ArrowDown'] && this.keys['ArrowLeft']) {
            if (!((this.y + this.height / 2) >= myGameArea.canvas.height) && !((this.x - this.width / 2) <= 0)) {
                this.y += this.speed;
                this.x -= this.speed;
            } else {
                if ((this.y + this.height / 2) >= myGameArea.canvas.height) this.y = this.height / 2;
                if ((this.x - this.width / 2) <= 0) this.x = myGameArea.canvas.width - this.width / 2;
            }
        } else if(this.keys['ArrowDown'] && this.keys['ArrowRight']) {
            if (!((this.y + this.height / 2) >= myGameArea.canvas.height) && !((this.x + this.width / 2) >= myGameArea.canvas.width)) {
                this.y += this.speed;
                this.x += this.speed;
            } else {
                if ((this.y + this.height / 2) >= myGameArea.canvas.height) this.y = this.height / 2;
                if ((this.x + this.width / 2) >= myGameArea.canvas.width) this.x = this.width / 2;
            }
        } else if(this.keys['ArrowUp']) {
            if (!((this.y - this.height / 2) < 0)) this.y -= this.speed;
            else this.y = myGameArea.canvas.height - this.height / 2
        } else if(this.keys['ArrowDown']) {
            if (!((this.y + this.height / 2) > myGameArea.canvas.height)) this.y += this.speed;
            else this.y = this.height / 2
        } else if(this.keys['ArrowLeft']) {
            if (!((this.x - this.width / 2) < 0)) this.x -= this.speed;
            else this.x = myGameArea.canvas.width - this.width / 2
        }  else if(this.keys['ArrowRight']) {
            if (!((this.x + this.width / 2) > myGameArea.canvas.width)) this.x += this.speed;
            else this.x = this.width / 2
        }
    }
}

/**
 * Funkcija koja upravlja pozadinskom glazbom
 */
function toggleSound() {
    if (music) {
        document.getElementById("backgroundMusic").pause()
        document.getElementById('musicIcon').src = '/images/mute.png';
    } else {
        document.getElementById("backgroundMusic").play()
        document.getElementById('musicIcon').src = '/images/sound.png';
    }
    music = !music;
}

/**
 * Funkcija ucitava pozadinu i highScore
 */
function loadBackground() {
    myGameArea.setup();
    myBackground = new Background();
    myBackground.update();
    if(localStorage.getItem("highScore")) {
        document.getElementById("highScore").innerText = "High score: " +
            formatTime(localStorage.getItem("highScore"))
    }
}

/**
 * Funkcija koja pokrece igru
 */
function startGame() {
    myGameArea.clear()
    myGameArea.start();
    document.getElementById("start").hidden = true;
    myBackground = new Background();
    myGamePiece = new Player(75, 92,  myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
    createAsteroids();
    myGameArea.clear();
    asteroidSpawn = setInterval(createAsteroids, asteroidInterval)
}

/**
 * Listener za pritisak gumba na tipkovnici
 */
document.addEventListener('keydown', function (event) {
    myGamePiece.updateKeys(event);
});

/**
 * Listener za otpustanje gumba na tipkovnici
 */
document.addEventListener('keyup', function (event) {
    myGamePiece.updateKeys(event);
});

