class SokobanGame {
    constructor() {
        this.board = document.getElementById('gameBoard');

        // 关卡数据（0: 地板, 1: 墙, 2: 箱子, 3: 玩家, 4: 目标, 5: 箱子在目标上, 6: 玩家在目标上）
        this.levels = [
            {
                width: 8,
                height: 6,
                map: [
                    [1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,1],
                    [1,0,4,2,4,0,0,1],
                    [1,0,3,0,4,0,0,1],
                    [1,0,0,2,0,0,0,1],
                    [1,1,1,1,1,1,1,1]
                ]
            },
            {
                width: 10,
                height: 8,
                map: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,4,2,3,4,0,0,0,1],
                    [1,0,0,0,2,4,2,0,0,1],
                    [1,0,0,0,0,4,0,0,0,1],
                    [1,0,0,2,4,2,0,0,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            }
        ];

        this.currentLevel = 0;
        this.player = { x: 0, y: 0 };
        this.boxes = [];
        this.targets = [];
        this.moves = 0;
        this.history = [];

        this.init();
    }

    init() {
        this.loadLevel(this.currentLevel);
        this.bindEvents();
    }

    loadLevel(index) {
        const level = this.levels[index];
        this.currentLevel = index;
        this.moves = 0;
        this.history = [];
        this.boxes = [];
        this.targets = [];

        document.getElementById('levelNum').textContent = index + 1;
        document.getElementById('moves').textContent = 0;

        this.board.style.gridTemplateColumns = `repeat(${level.width}, 40px)`;
        this.board.innerHTML = '';

        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const tile = level.map[y][x];

                switch (tile) {
                    case 1:
                        cell.classList.add('wall');
                        break;
                    case 2:
                        cell.classList.add('floor');
                        this.boxes.push({ x, y });
                        cell.classList.add('box');
                        break;
                    case 3:
                        cell.classList.add('floor');
                        this.player = { x, y };
                        cell.classList.add('player');
                        break;
                    case 4:
                        cell.classList.add('target');
                        this.targets.push({ x, y });
                        break;
                    case 5:
                        cell.classList.add('target');
                        this.boxes.push({ x, y });
                        cell.classList.add('box-on-target');
                        break;
                    case 6:
                        cell.classList.add('target');
                        this.player = { x, y };
                        cell.classList.add('player-on-target');
                        break;
                    default:
                        cell.classList.add('floor');
                }

                this.board.appendChild(cell);
            }
        }

        document.getElementById('totalBoxes').textContent = this.boxes.length;
        this.updateBoxesCount();
    }

    bindEvents() {
        document.addEventListener('keydown', e => {
            const keyMap = {
                ArrowUp: 'up', w: 'up',
                ArrowDown: 'down', s: 'down',
                ArrowLeft: 'left', a: 'left',
                ArrowRight: 'right', d: 'right'
            };
            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
        });

        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.onclick = () => this.move(btn.dataset.dir);
        });
    }

    move(dir) {
        const dirs = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 }
        };

        const d = dirs[dir];
        const nx = this.player.x + d.dx;
        const ny = this.player.y + d.dy;

        // 保存历史
        this.history.push({
            player: { ...this.player },
            boxes: JSON.parse(JSON.stringify(this.boxes)),
            moves: this.moves
        });

        const box = this.boxes.find(b => b.x === nx && b.y === ny);
        if (box) {
            const bx = nx + d.dx;
            const by = ny + d.dy;

            if (
                this.boxes.some(b => b.x === bx && b.y === by) ||
                this.isWall(bx, by)
            ) return;

            box.x = bx;
            box.y = by;
        }

        if (this.isWall(nx, ny)) return;

        this.player.x = nx;
        this.player.y = ny;
        this.moves++;
        document.getElementById('moves').textContent = this.moves;

        this.render();
        this.checkWin();
    }

    isWall(x, y) {
        return this.levels[this.currentLevel].map[y][x] === 1;
    }

    render() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('player', 'box', 'box-on-target');

            const x = +cell.dataset.x;
            const y = +cell.dataset.y;

            if (this.boxes.some(b => b.x === x && b.y === y)) {
                cell.classList.add(
                    this.targets.some(t => t.x === x && t.y === y)
                        ? 'box-on-target'
                        : 'box'
                );
            }

            if (this.player.x === x && this.player.y === y) {
                cell.classList.add('player');
            }
        });

        this.updateBoxesCount();
    }

    updateBoxesCount() {
        const done = this.boxes.filter(b =>
            this.targets.some(t => t.x === b.x && t.y === b.y)
        ).length;
        document.getElementById('completed').textContent = done;
    }

    checkWin() {
        const win = this.boxes.every(b =>
            this.targets.some(t => t.x === b.x && t.y === b.y)
        );

        if (win) {
            document.getElementById('finalMoves').textContent = this.moves;
            document.getElementById('finalLevel').textContent = this.currentLevel + 1;
            document.getElementById('winMessage').classList.add('show');
        }
    }

    restart() {
        this.loadLevel(this.currentLevel);
    }

    undo() {
        if (!this.history.length) return;
        const s = this.history.pop();
        this.player = s.player;
        this.boxes = s.boxes;
        this.moves = s.moves;
        document.getElementById('moves').textContent = this.moves;
        this.render();
    }

    nextLevel() {
        this.loadLevel((this.currentLevel + 1) % this.levels.length);
    }
}

const game = new SokobanGame();

function hideWinMessage() {
    document.getElementById('winMessage').classList.remove('show');
}