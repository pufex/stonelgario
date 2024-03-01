const game = document.querySelector("#game")
game.ctx = game.getContext("2d");

game.width = window.innerWidth;
game.height = window.innerHeight

const layout = document.querySelector("#layout")
layout.ctx = layout.getContext("2d");

layout.width = window.innerWidth;
layout.height = window.innerHeight

const scoreContainer = document.querySelector(".score");

let positionX = 400, positionY = 400, score = 500, speed = 2;
let oldTime, newTime;
let redraw = false;

const scoreInput = document.querySelector("#score");
const speedInput = document.querySelector("#speed");

scoreInput.value = score;
speedInput.value = speed;

scoreInput.addEventListener("change", () => {
    score = scoreInput.value;
    console.log(score);
})
speedInput.addEventListener("change", () => {
    speed = speedInput.value;
})

let amount = 10;
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

console.log(points.points);

drawPoints = (ctx) => {
    console.log(redraw);
    if(redraw){
        ctx.save();
        ctx.fillStyle = "red";
        ctx.clearRect(0,0, 2000, 2000);
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
        console.log(point.x, point.y, point.color, point.score)
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
    
    points.points = points.points.map((point) => {
        if(point !== undefined){
            let d = Math.sqrt(Math.pow(positionX-point.x, 2) + Math.pow(positionY-point.y, 2));
            if(d < Math.floor(score/4)){
                redraw = true;
                score+=point.score;
                scoreContainer.innerText = `score: ${score}`
                return undefined;
            } 
            return point;
        }
    }).filter(item => item != undefined)
    redraw ? drawPoints(layout.ctx) : null;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
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
        drawPlayer(e, game.ctx, positionX, positionY, speed);
    })
})