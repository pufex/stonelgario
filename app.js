const playAudio = (url) => {
    new Audio(url).play();
}

const begin = document.querySelector(".begin");
const menu = document.querySelector(".menu");
begin.addEventListener("click", () => {
    menu.classList.toggle("hidden")
    playAudio("/run-sound.wav");
})

const game = document.querySelector("#game")
game.ctx = game.getContext("2d");

game.width = window.innerWidth;
game.height = window.innerHeight

const layout = document.querySelector("#layout")
layout.ctx = layout.getContext("2d");

layout.width = window.innerWidth;
layout.height = window.innerHeight

const scoreContainer = document.querySelector(".score");

let positionX = 200, positionY = 200, score = 500, speed = 2;
let oldTime, newTime;
let redraw = false;

const scoreInput = document.querySelector("#score");
const speedInput = document.querySelector("#speed");

scoreInput.value = score;
speedInput.value = speed;

scoreInput.addEventListener("change", () => {
    score = scoreInput.value;

})
speedInput.addEventListener("change", () => {
    speed = speedInput.value;
})

let amount = 200;
class Points {
    constructor(amount, w, h){
        this.amount = amount;
        this.colors = ["red", "green", "blue", "yellow", "pink", "purple"]
        this.setPoints = function(amount, w, h, colors){
            let array = [];
            for(let i = 0; i < amount; i++){
                const object = {
                    id: i,
                    color: colors[Math.floor(Math.random()*colors.length)],
                    score: 30,
                    x: Math.floor(w*Math.random()),
                    y: Math.floor(h*Math.random()),
                }
                array.push(object);
            }
            return array;
        };
        this.points = this.setPoints(this.amount, w, h, this.colors);
    }
}

let points = new Points(amount, game.width, game.height);


drawPoints = (ctx) => {
    if(redraw){
        ctx.save();
        ctx.fillStyle = "red";
        ctx.clearRect(0,0, 4000, 4000);
        ctx.restore();
    }
    points.points.map((point) => {
        ctx.save();
        ctx.translate(point.x, point.y)
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(0,0,Math.floor(point.score/4), 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    })
}

class Rivals{
    constructor(amount, w, h){
        this.amount = amount;
        this.colors = ["red", "green", "blue", "yellow", "pink", "purple"];
        this.w = w;
        this.h = h;
        this.setRivals = function(amount, w, h, colors){
            let array = [];
            for(let i = 0; i < amount; i++){
                const object = {
                    id: i,
                    color: colors[Math.floor(Math.random()*colors.length)],
                    score: 800,
                    // x: Math.floor(w*Math.random()),
                    // y: Math.floor(h*Math.random()),
                    x: 1000,
                    y: 800,
                }
                array.push(object)
            }
            return array;
        };
        this.rivals = this.setRivals(this.amount, w,h, this.colors);
    };
    rivalMovement(index, x,y, speed, seek){
        let angle = Math.atan((y-this.rivals[index].y)/(x-this.rivals[index].x));
        let vx = seek*speed*Math.cos(angle);
        let vy = seek*speed*Math.sin(angle);
        let radius = Math.floor(this.rivals[index].score/4);
        

        if(x < this.rivals[index].x){
            vx *= -1;
            vy *= -1;
        }

        if(this.rivals[index].x + radius >= this.w || this.rivals[index].x - radius <= 0){
            vx = 0;
        } 
        if(this.rivals[index].y + radius >= this.h || this.rivals[index].y - radius <= 0){
            vy = 0;
        } 


        this.rivals[index].x += vx 
        this.rivals[index].y += vy
    }
}

let rivals = new Rivals(1, game.width, game.height);

const drawRivals = (ctx, score) => {
    rivals.rivals.map((rival, index) => {
        let seek;
        rival.score > score ? seek = 1 : seek = -1;
        rivals.rivalMovement(index, positionX, positionY, 0.75, seek);
        ctx.save();
        ctx.translate(rival.x, rival.y);
        ctx.fillStyle = rival.color;
        ctx.beginPath();
        ctx.arc(0,0, Math.floor(rival.score/4), 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fillText
        ctx.restore();
    })
}



drawPlayer = (event, ctx, x, y, speed) => {
    let v, vx, vy, angle;
    let cursorX, cursorY;

    cursorX = event.clientX;
    cursorY = event.clientY;

    v = speed;
    angle = Math.atan((cursorY-y)/(cursorX-x));


    vx = v*Math.cos(angle);
    vy = v*Math.sin(angle);

    if(cursorX < x){
        vx *= -1;
        vy *= -1;
    } 
   
    positionX += vx; 
    positionY += vy; 
    
    points.points = points.points.map((point, index) => {
        let d = Math.sqrt(Math.pow(positionX-point.x, 2) + Math.pow(positionY-point.y, 2));
        if(d < Math.floor(score/4)){
            redraw = true;
            score+=2;
            scoreContainer.innerText = `score: ${score}`
            let newPoint = {
                id: index,
                color: points.colors[Math.floor(Math.random()*points.colors.length)],
                score: 30,
                x: Math.floor(window.innerWidth*Math.random()),
                y: Math.floor(window.innerHeight*Math.random()),
            }
            return newPoint;
        } 
        return point;
    })
    redraw ? drawPoints(layout.ctx) : null;
    
    rivals.rivals = rivals.rivals.map((rival, index) => {
        let d = Math.sqrt(Math.pow(positionX-rival.x, 2) + Math.pow(positionY-rival.y, 2))
        if(score > rival.score){
            if(d < Math.floor(score/4)){
                score += rival.score;
                scoreContainer.innerText = `score: ${score}`
                return undefined;
            }
            return rival;
        }else if(score != 0){
            if(d < Math.floor(rival.score/4)){
                rival.score += score;
                score = 0;
                scoreContainer.innerText = `You lost, boy!`

                playAudio("/lost.wav");

                const lost = document.createElement("div");
                lost.classList.add("lost");
                lost.innerHTML = "You LOST!"
                
                document.querySelector(".toggles")?.remove();
                document.querySelector(".score")?.remove()

                const body = document.querySelector("body");
                body.appendChild(lost);

                return rival;
            }
        }
        return rival;
    }).filter((rival) => rival != undefined);

    ctx.save();
    ctx.fillStyle = "red";
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,0, Math.floor(score/4), 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    
    ctx.fillStyle="blue"
    
    ctx.restore();
    redraw = false; 
}

let frameId;


drawPoints(layout.ctx);
scoreContainer.innerText = `score: ${score}`
game.addEventListener("mousemove", (e) => {
    frameId = requestAnimationFrame(() => {
        game.ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
        drawPlayer(e, game.ctx, positionX, positionY, speed);
        drawRivals(game.ctx, score);
    })
})