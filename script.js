class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'ai';
        this.aiDifficulty = 'hard';
        this.isGameActive = true;
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.initBoard();
        this.setupEventListeners();
        this.createParticles();
    }

    initBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-index', i);
            boardElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setGameMode(btn.dataset.mode));
        });

        document.getElementById('board').addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            if (index && this.isGameActive &&
                (this.gameMode === 'multiplayer' || this.currentPlayer === 'X')) {
                this.handleMove(index);
            }
        });
    }

    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn =>
            btn.classList.toggle('active', btn.dataset.mode === mode));
        this.resetGame();
        document.getElementById('status').textContent =
            mode === 'ai' ? 'Play against AI!' : 'Waiting for player...';
    }

    handleMove(index) {
        if (this.board[index] || !this.isGameActive) return;

        this.board[index] = this.currentPlayer;
        this.updateBoard();

        if (this.checkWin()) {
            this.handleWin();
        } else if (this.isBoardFull()) {
            this.handleDraw();
        } else {
            this.currentPlayer = 'O';
            if (this.gameMode === 'ai') {
                setTimeout(() => this.aiMove(), 500);
            }
        }
    }

    aiMove() {
        let index;
        switch (this.aiDifficulty) {
            case 'hard':
                index = this.minimax(this.board, 'O').index;
                break;
            case 'medium':
                index = Math.random() < 0.5 ?
                    this.minimax(this.board, 'O').index :
                    this.getRandomMove();
                break;
            default:
                index = this.getRandomMove();
        }

        this.board[index] = 'O';
        this.updateBoard();

        if (this.checkWin()) {
            this.handleWin();
        } else if (this.isBoardFull()) {
            this.handleDraw();
        } else {
            this.currentPlayer = 'X';
        }
    }

    minimax(newBoard, player) {
        const availableSpots = this.getEmptyCells(newBoard);

        if (this.checkWinForBoard(newBoard, 'X')) return { score: -10 };
        if (this.checkWinForBoard(newBoard, 'O')) return { score: 10 };
        if (availableSpots.length === 0) return { score: 0 };

        const moves = [];
        for (const spot of availableSpots) {
            const move = { index: spot };
            newBoard[spot] = player;

            move.score = this.minimax(newBoard, player === 'O' ? 'X' : 'O').score;

            newBoard[spot] = '';
            moves.push(move);
        }

        return player === 'O'
            ? moves.reduce((best, m) => m.score > best.score ? m : best)
            : moves.reduce((best, m) => m.score < best.score ? m : best);
    }

    getEmptyCells(board = this.board) {
        return board.reduce((acc, cell, index) => {
            if (!cell) acc.push(index);
            return acc;
        }, []);
    }

    getRandomMove() {
        const emptyCells = this.getEmptyCells();
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    checkWin() {
        return this.checkWinForBoard(this.board, this.currentPlayer);
    }

    checkWinForBoard(board, player) {
        return this.winningCombos.some(combo =>
            combo.every(index => board[index] === player));
    }

    isBoardFull() {
        return this.board.every(cell => cell !== '');
    }

    updateBoard() {
        this.board.forEach((cell, index) => {
            const cellElement = document.querySelector(`[data-index="${index}"]`);
            cellElement.className = `cell ${cell.toLowerCase()}`;
            cellElement.textContent = cell;
        });
    }

    handleWin() {
        this.isGameActive = false;
        document.getElementById('status').textContent =
            `${this.currentPlayer} wins!`;
        this.highlightWinningCombo();
    }

    handleDraw() {
        this.isGameActive = false;
        document.getElementById('status').textContent = "It's a draw!";
    }

    highlightWinningCombo() {
        const winningCombo = this.winningCombos.find(combo =>
            combo.every(index => this.board[index] === this.currentPlayer));

        winningCombo.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning-cell');
        });
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.updateBoard();
        document.querySelectorAll('.cell').forEach(cell =>
            cell.classList.remove('winning-cell'));
    }

    createParticles() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        document.getElementById('particles').appendChild(canvas);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (particles.length < 100) particles.push(new Particle());

            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.size <= 0.2) particles.splice(index, 1);
            });

            requestAnimationFrame(animate);
        }

        animate();
    }
}

// Initialize game
const game = new TicTacToe();

// Multiplayer functionality
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('game-state', (state) => {
    // Handle multiplayer game state updates
});

socket.on('player-joined', (room) => {
    document.getElementById('status').textContent = 'Game started!';
});
