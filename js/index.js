// explicações
//Lógica do movimento da cobra: sempre pegamos o primeiro elemento da cobra e o jogamos para o final quando estamos
// mudando a direção da cobra

// declarações de elementos
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d"); // propriedade do Canvas (está na documentação). Remete ao contexto do elemento
const size = 30;
const inititalPosition = { x: 270, y: 270 }
let snake = [inititalPosition]
let speed = 200
let direction, loopId;
const audio = new Audio('../assets/audio.mp3')
const score = document.querySelector('.score-value')
const finalScore = document.querySelector('.final-score > span')
const menu = document.querySelector('.menu-screen')
const buttonPlay = document.querySelector('.btn-play')
const decreaseSpeed = document.querySelector('#btn-decrease')
const increaseSpeed = document.querySelector('#btn-increase')
const inputVelocidade = document.querySelector('#input-velocidade')

//Propriedades do ctx (explicação):
// ctx.fillStyle = 'red' //estilo do preenchimento
// ctx.fillRect(300, 200, 50, 100) //é um retângulo preenchido que espera 4 parâmetros -> x e y + largura e altura.
// É ele que desenha a cobra no canva

//alterando a velocidade da cobra
inputVelocidade.value = speed

inputVelocidade.addEventListener('input', () => {
    speed = inputVelocidade.value
})

decreaseSpeed.addEventListener('click', () => {
    speed -= 10
    inputVelocidade.value = speed
})

increaseSpeed.addEventListener('click', () => {
    speed += 10
    inputVelocidade.value = speed
})


// funções
const incrementScore = () => {
    score.innerText = +score.innerText + 10
    //score.innerText = parseInt(score.innerText) + 10
}
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};
//Math.random gera um número aleatório entre 0 e 1
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / 30) * 30;
};

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);

    return `rgb(${red},${green},${blue})`;
};


// desenhando a cobra com as propriedades do canvas
const drawSnake = () => {
    ctx.fillStyle = "#ddd";
    snake.forEach((position, index) => {
        // se o index é igual a última posição da cobra, pintamos de branco para indicar a cabeça da cobra
        if (index === snake.length - 1) {
            ctx.fillStyle = "white";
        }
        ctx.fillRect(position.x, position.y, size, size);
    });
};

//mover a cobra nas direções
const moveSnake = () => {
    if (!direction) return;

    const head = snake[snake.length - 1]; // o começo da cobra na verdade é o seu final

    if (direction === "right") {
        snake.push({ x: head.x + size, y: head.y });
    }
    if (direction === "left") {
        snake.push({ x: head.x - size, y: head.y });
    }
    if (direction === "down") {
        snake.push({ x: head.x, y: head.y + size });
    }
    if (direction === "up") {
        snake.push({ x: head.x, y: head.y - size });
    }

    snake.shift();
    //removemos o primeiro elemento do array. Tiramos o primeiro elemento e jogamos no último elemento para move-la.
};

// desenhando o grid do canvas (caminhos da cobra)
const drawGrid = () => {
    ctx.lineWidth = 1; // espessura da linha do grid
    ctx.strokeStyle = "#191919"; //cor da linha do grid

    for (let i = size; i < canvas.width; i += size) {
        ctx.beginPath(); // impede que ao chegar no final seja traçado uma linha do final para o começo
        ctx.lineTo(i, 0); // começa no primeiro size (=30) e y=0 e vai indo até o final da largura do canva
        ctx.lineTo(i, 600);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
};

// definindo a localização da comida no canvas
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor(),
};
// renderizando a comida na tela
const drawFood = () => {
    const { x, y, color } = food;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.fillRect(food.x, food.y, size, size);
    ctx.shadowBlur = 0;
};

// checando se a cobra comeu a comida
const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x === food.x && head.y === food.y) {
        snake.push(head);
        audio.play()
        incrementScore()
        
        let x = randomPosition()
        let y = randomPosition()

        while(snake.find((position) => position.x === x && position.y === y)) {
            x = randomPosition()
            y = randomPosition()
        }
        food.x = x
        food.y = y
    }
};

// checando se cobra bateu na parede ou nela mesmo
const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y
    })

    if(wallCollision || selfCollision) {
        gameOver()
    }
}

// gerando o game over após colisão
const gameOver = () => {
    direction = undefined
    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    canvas.style.filter = 'blur(2px)'
}

// definindo o funcionamento de tudo de forma simultânea
const gameLoop = () => {
    ctx.clearRect(0, 0, 600, 600); // sempre resetamos o canvas de 0 a 600, senão ficam os "rastros" dos elementos
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision()

    loopId = setTimeout(() => {
        gameLoop();
    }, speed);
};
gameLoop();

// comandos para mover a cobra
document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") direction = "right";
    if (key === "ArrowLeft" && direction !== "right") direction = "left";
    if (key === "ArrowDown" && direction !== "up") direction = "down";
    if (key === "ArrowUp" && direction !== "down") direction = "up";
});
// jogar novamente após o game over
buttonPlay.addEventListener('click', () => {
    score.innerText = '00'
    menu.style.display = 'none'
    canvas.style.filter = 'none'
    snake = [ inititalPosition ]

})