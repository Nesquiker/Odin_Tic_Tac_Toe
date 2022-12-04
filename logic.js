CURRENT_GAME_BOARD = [];
let HUMAN;
let COMPUTER;
let MARK_COUNT;
let ACTIVE_PLAYER;

function build2DArray() {
    let output = [0, 0, 0];
    for (let i = 0; i < output.length; i++) {
        output[i] = [0, 0, 0];
    }
    return output;
}

class competitor {
    constructor(marker, is_human) {
        this.marker = marker;
        this.is_human = is_human;
    }
}

function transition(grid) {
    grid.textContent = ACTIVE_PLAYER.marker;
    grid.classList.remove("fade");
}

function humanMarkBoard(e) {
    // Tried a combined board marking approach early on but found that accessing via
    // the button event for a person and through a separate function was incompatible.
    if (ACTIVE_PLAYER === HUMAN) {
        return;
    }
    if (e.target.textContent !== "") {
        return 0;
    }
    MARK_COUNT++;
    ACTIVE_PLAYER = HUMAN;
    let grid_num = Number(e.target.id[1]);
    let row = Math.floor(grid_num / 3);
    let column = grid_num % 3;
    CURRENT_GAME_BOARD[row][column] = HUMAN.marker;
    transition(e.target);
    if (checkBoard()) {
        setTimeout(() => {computerTurn();}, 300);
    }
}

function computerTurn() {
    MARK_COUNT++;

    ACTIVE_PLAYER = COMPUTER;
    let next_play = computerLogic();
    CURRENT_GAME_BOARD[next_play[0]][next_play[1]] = COMPUTER.marker;
    let grid_num = next_play[0] * 3 + next_play[1];
    const grid = document.querySelector("#G" + grid_num);
    transition(grid);
    checkBoard();
}

function computerLogic() {
    let cell_danger_1 = build2DArray();
    let cell_danger_2 = build2DArray();
    let lose_location = null;
    let free_entry_pos = null;
    for (let line of lineGenerator()) {
        let line_o = 0;
        let line_x = 0;
        let free_entries = [];
        for (let entry of line) {
            let val = CURRENT_GAME_BOARD[entry[0]][entry[1]];
            if (val === "X") {
                line_x++;
            } else if (val === "O") {
                line_o++;
            } else {
                free_entries.push(entry);
                if (free_entry_pos === null) {
                    free_entry_pos = entry;
                }
            }
        }
        let comp = 0;
        let human = 0;
        if (line_o === 0 || line_x === 0) {
            if (COMPUTER.marker === 'X') {
                comp = line_x;
                human = line_o;
            } else {
                comp = line_o;
                human = line_x;
            }
            if (comp === 2) {
                return free_entries[0];
            } else if (human === 2) {
                lose_location = free_entries[0];
            }else if (human === 1) {
                for (let entry of free_entries) {
                    cell_danger_1[entry[0]][entry[1]]++;
                }
            } else if (human ===0 && comp === 0) {
                for (let entry of free_entries) {
                    cell_danger_2[entry[0]][entry[1]]++;
                }
            }
        }

    }
    if (lose_location) {
        return lose_location;
    }
    let curr_max = [0, 0];
    let curr_max_loc = [-1, -1];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let curr_loc = [i, j];
            let d_1 = cell_danger_1[i][j];
            let d_2 = cell_danger_2[i][j];
            if (d_1 > curr_max[0] || (d_1 === curr_max[0] && d_2 > curr_max[1])) {
                curr_max_loc = curr_loc;
                curr_max = [d_1, d_2];
            }
        }
    }
    if (curr_max_loc[0] === -1) {
        return free_entry_pos;
    }
    return curr_max_loc;
}

function checkBoard() {
    let result = checkWinner();
    if (result === 1) {
        makeResultPage("Tie Game!");
        return false;
    } else if (result === "X" || result === "O") {
        if (result === HUMAN.marker) {
            const u_score = document.querySelector("#user_score");
            let score = Number(u_score.textContent);
            score++;
            u_score.textContent = "" + score;
            makeResultPage("You Win!");
        } else {
            const c_score = document.querySelector("#comp_score");
            let score = Number(c_score.textContent);
            score++;
            c_score.textContent = "" + score;
            makeResultPage("You Lose!");
        }
        return false;
    }
    return true;
}

function makeResultPage(result) {
    // Reset Board to start game menu
    const board = document.querySelector(".board_container");
    board.classList.add("fade_board");
    const result_page = document.createElement("div");
    result_page.classList.add("start_menu");
    const title = document.createElement("h1");
    title.textContent = result + " Play Again?";
    const button_container = document.createElement("div");
    button_container.classList.add("button_container");
    const button_player = document.createElement("button");
    button_player.textContent = HUMAN.marker;
    button_player.addEventListener("click", makeBoard);

    // Add start menu elements to board
    button_container.appendChild(button_player);
    result_page.appendChild(title);
    result_page.appendChild(button_container);
    setTimeout(() => {board.replaceChildren(result_page);}, 1000);
    setTimeout(() => {board.classList.remove("fade_board");}, 1500);
}


function checkWinner() {
    for (let line of lineGenerator()) {
        let out = [];
        for (let entry of line) {
            out.push(CURRENT_GAME_BOARD[entry[0]][entry[1]]);
        }
        if ((out[0] === "X" || out[0] === "O") && new Set(out).size === 1) {
            return CURRENT_GAME_BOARD[line[0][0]][line[0][1]];
        }
    }
    if (MARK_COUNT === 9) {
        return 1;
    }
    return 0;
}

function* lineGenerator() {
    let size = 3;
    for (let i = 0; i < size; i++) {
        let current_line = [[i, 0], [i, 1], [i, 2]];
        yield current_line;
    }
    for (let i = 0; i < size; i++) {
        let current_line = [];
        for (let j = 0; j < size; j++) {
            current_line.push([j, i]);
        }
        yield current_line;
    }
    yield [[0, 0], [1, 1], [2, 2]];
    yield [[0, 2], [1, 1], [2, 0]];

}

function makeBoard(e) {
    // Make players
    HUMAN = new competitor(e.target.textContent, true);
    COMPUTER = new competitor((e.target.textContent === "X") ? "O" : "X", false);
    CURRENT_GAME_BOARD = build2DArray();
    MARK_COUNT = 0;

    // Make Board
    const game_board = document.createElement("div");
    game_board.classList.add("game_container");
    const board_size = 9;
    for (let i = 0; i < board_size; i++) {
        const grid = document.createElement("div");
        grid.classList.add("play_grid");
        grid.classList.add("fade");
        grid.id = "G" +  i;
        grid.addEventListener("click", humanMarkBoard);
        game_board.appendChild(grid);
    }

    // Add game board to page;
    const board_container = document.querySelector(".board_container");
    board_container.replaceChildren(game_board);

    // Randomly determine who has first turn
    let first_turn = Math.floor(Math.random()*2);
    if (first_turn) {
        computerTurn();
    }
}

function newGameScreen() {
    // Reset Game Initial Values
    const u_score = document.querySelector("#user_score");
    const c_score = document.querySelector("#comp_score");
    u_score.textContent = "0";
    c_score.textContent = "0";
    CURRENT_GAME_BOARD = build2DArray();
    MARK_COUNT = 0;

    // Reset Board to start game menu
    const board = document.querySelector(".board_container");
    const startMenu = document.createElement("div");
    startMenu.classList.add("start_menu");
    const title = document.createElement("h1");
    title.textContent = "Are you X's or O's"
    const button_container = document.createElement("div");
    button_container.classList.add("button_container");
    const button_x = document.createElement("button");
    button_x.textContent = "X";
    button_x.addEventListener("click", makeBoard);
    const button_o = document.createElement("button");
    button_o.textContent = "O";
    button_o.addEventListener("click", makeBoard);

    // Add start menu elements to board
    button_container.appendChild(button_x);
    button_container.appendChild(button_o);
    startMenu.appendChild(title);
    startMenu.appendChild(button_container);
    board.replaceChildren(startMenu);
}

function main() {
    newGameScreen();
    const new_game_button = document.querySelector("button");
    new_game_button.addEventListener("click", newGameScreen);
}

main();