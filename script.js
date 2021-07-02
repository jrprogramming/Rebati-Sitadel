const COLUMNS = 5;
const ROWS = 5;

let image;
const IMAGES = [
    'canon.jpg',
    'citadelle 2.jpg',
    'citadelle 3.jpg',
    'citadelle 4.PNG',
    'sans souci.jpg'
];

let CANVAS_WIDTH = 0;
let CANVAS_HEIGHT = 0;

let mistakes = 0;

let clock;
let time = 0;

let selectedCanvas;

document.body.addEventListener('dragover', e => {
    e.preventDefault();
})

document.body.addEventListener('drop', () => {
    if (selectedCanvas) {
        selectedCanvas.classList.remove('hide');
    }
});

document.getElementById('reset').addEventListener('click', () => {
    mistakes = 0;
    time = 0;
    resetPuzzle();
    createBoard();
    createPuzzle();
    
    clearInterval(clock);
    clock = setInterval(updateClock, 1000);
});


const resetPuzzle = () => {
    clearBoard();

    while (CANVAS_WIDTH === 0 || CANVAS_HEIGHT === 0) {
        image = new Image();
        image.src = getRandomImageSource();
        getImageWidthAndHeight();
    }

    document.getElementById('grid').style.display = 'visible';
    
    document.getElementById('points').textContent = '0';
    document.getElementById('clock').textContent = '0:00';
}

const clearBoard = () => {
    const board = document.getElementById('board');
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }

    const grid = document.getElementById('grid');
    while (grid.firstChild) {
        document.getElementById('grid').removeChild(grid.firstChild);
    }

}

const updateClock = () => {
    time ++;

    const minutes = Math.floor(time / 60);
    const seconds = (time % 60) < 10 ? `0${time % 60}` : time % 60;

    document.getElementById('clock').textContent = `${minutes}:${seconds}`;
}

const dragStart = canvas => {
    selectPiece(canvas);
    setTimeout(() => {
        selectedCanvas.classList.remove('selected');
        selectedCanvas.classList.add('hide');
    }, 0);
}

const selectPiece = canvas => {
    const canvases = Object.values(document.querySelectorAll('canvas'));
    canvases.forEach(canv => {
        canv.classList.remove('selected');
    });
    canvas.classList.add('selected');
    selectedCanvas = canvas;
}

const selectGrid = cell => {
    if (!selectedCanvas) {
        return;
    }
    if (cell.location === selectedCanvas.location) {
        cell.isDrawn = true;
        const context = cell.getContext('2d');
        context.drawImage(...selectedCanvas.imageDetails);
        setTimeout(() => {
            const grid = document.getElementById('grid');
            if (grid.contains(selectedCanvas)) {
                grid.removeChild(selectedCanvas);
            }
            selectedCanvas = null;
        }, 0);
    } else {
        selectedCanvas.classList.remove('selected');
        selectedCanvas.classList.remove('hide');
        selectedCanvas = null;
        cell.classList.add('wrong-cell');
        setTimeout(() => {
            cell.classList.remove('wrong-cell');
        }, 2000);
        mistakes ++;
        document.getElementById('points').textContent = mistakes;
    }
    if (puzzleCompleted()) {
        document.getElementById('grid').style.display = 'none';
        Object.values(document.getElementsByClassName('cell')).forEach(puzzleCell => puzzleCell.classList.add('completed-cell'));
        clearInterval(clock);
    }
}

const puzzleCompleted = () => Object.values(document.getElementsByClassName('cell')).every(cell => cell.isDrawn);

const createBoard = () => {
    let cellCount = 0;
    for (let r = 0; r < ROWS; r ++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.style.height = `${CANVAS_HEIGHT}px`;

        for (let c = 0; c < COLUMNS; c ++) {
            const canvas = document.createElement('canvas');
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            canvas.className = 'cell';
            canvas.location = cellCount;
            canvas.addEventListener('dragover', e => e.preventDefault());
            canvas.addEventListener('drop', () => selectGrid(canvas));
            canvas.addEventListener('click', () => selectGrid(canvas))
            row.appendChild(canvas);
            cellCount ++;
        }
        document.getElementById('board').appendChild(row);
    }

    const totalCells = ROWS * COLUMNS;

    const canvases = [];
    for (let i = 0; i < totalCells; i ++) {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.location = i;
        canvas.className = 'canvas';
        canvas.draggable = true;
        canvas.addEventListener('dragstart', () => dragStart(canvas));
        canvas.addEventListener('click', () => selectPiece(canvas));
        canvases.push(canvas);
    }
    shuffleCanvases(canvases);
    canvases.forEach(canvas => document.getElementById('grid').appendChild(canvas));
}

const createPuzzle = () => {
    const canvases = Object.values(document.getElementsByClassName('canvas'));

    canvases.forEach(canvas => {
        const index = canvas.location;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const imageDetails = [
            image, 
            Math.floor(index % COLUMNS) * (image.width / COLUMNS), 
            Math.floor(index / ROWS) * (image.height / ROWS), 
            image.width / COLUMNS, 
            image.height / ROWS, 
            0, 
            0, 
            CANVAS_WIDTH, 
            CANVAS_HEIGHT
        ];
        canvas.imageDetails = imageDetails;
        const context = canvas.getContext('2d');
        context.drawImage(...imageDetails);
    });  
}

const shuffleCanvases = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const getRandomImageSource = () => {
    const index = Math.floor(Math.random() * IMAGES.length);
    return `${IMAGES[index]}`;
}

const getImageWidthAndHeight = () => {
    let scale = 1;
    if (image.width > 1000 || image.height > 500) {
        scale = 1.5;
    } else if (image.width < 500 || image.height < 300) {
        scale = .5;
    }

    CANVAS_WIDTH = image.width / (COLUMNS * scale);
    CANVAS_HEIGHT = image.height / (ROWS * scale);
}

window.onload = () => resetPuzzle();

