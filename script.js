const video = document.getElementById("video");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let snake = [{ x: 100, y: 100 }] // Initial position of snake
let direction = { x: 0, y: -10 } // Initial direction (Up)
let food = { x: 200, y: 200 } // Initial Food position
const size = 20; // Size of food and snake head



async function setupCamera() {
    video.width = 640;
    video.height = 480;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        }
    });
}

async function loadPoseNet() {
    return await posenet.load();
}

// Draws snake and food

function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ["red", "blue", "purple", "orange", "yellow"];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    snake.forEach(part => ctx.fillRect(part.x, part.y, size, size))

    ctx.fillStyle = "red"; //Snake food
    ctx.fillRect(food.x, food.y, size, size)
}

function moveSnake() {
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); // add new head

    if (Math.abs(head.x - food.x) < size && Math.abs(head.y - food.y) < size) { 
        food = { x: Math.floor(Math.random() * canvas.width / size) * size, 
                 y: Math.floor(Math.random() * canvas.height / size) * size };
    } else {
        snake.pop();
    }
}

// Check border Hitting
function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) return true; // Wall hitting

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y)
            return true;
    }
    return false; // No hitting
}


async function detectPose(net) {
    const pose = await net.estimateSinglePose(video, { flipHorizontal: true })

    const nose = pose.keypoints.find(p => p.part === "nose").position; // Get nose position

    if (nose.y < 200) direction = { x: 0, y: -10 }; // Move Up
    if (nose.y > 300) direction = { x: 0, y: 10 }; // Move Down
    if (nose.x < 200) direction = { x: -10, y: 0 }; // Move left
    if (nose.x > 400) direction = { x: 10, y: 0 }; // Move right
}

async function gameLoop(net) {
    moveSnake();
    drawSnake();

    if (checkCollision()) {
        alert("Game Over!");
        snake = [{ x: 100, y: 100 }];
        direction = { x: 0, y: -10 };
        food = { x: 200, y: 200 };
    }

    await detectPose(net);

    setTimeout(() => gameLoop(net), 70);
}


const bgMusic = document.getElementById("bgMusic");

function playMusic() {
    bgMusic.currentTime = 0; // The music will start from the beginning.
    bgMusic.volume = 0.5; // Reduce volume (0.5 means 50%)
    bgMusic.play();
}

// Play music when the game starts.
async function main() {
    await setupCamera();
    const net = await loadPoseNet();

    canvas.width = 640;
    canvas.height = 480;
    video.play();

    playMusic(); // Play background music.
    gameLoop(net);
}

// When the game is over, the music will play again from the beginning.
function gameOver() {
    alert("Game Over!");
    snake = [{ x: 100, y: 100 }];
    direction = { x: 0, y: -10 };
    food = { x: 200, y: 200 };

    playMusic(); // Restart the background music when the game is over.
}
main()
