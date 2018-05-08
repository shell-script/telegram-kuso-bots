'use strict';

// tags
// '#' = wall
// ' ' = floor
// '.' = goal square
// '@' = player
// '+' = player on a goal square
// '$' = box
// '*' = box on a goal square

const init = (level) => {
    const map = [];

    for (const i in level) {
        map.push([]);

        for (const j in level[i]) {
            if ('# .@+$*'.indexOf(level[i][j]) >= 0) {
                map[i].push(level[i][j]);
            } else {
                map[i].push(' ');
            }
        }
    }
};

const isBox = (map, i, j) => {
    return map[i][j] === '$' || map[i][j] === '*';
};

const win = (map) => {
    let goal = false;
    let box = false;

    for (const i in map) {
        for (const j in map[i]) {
            goal = goal || map[i][j] === '.' || map[i][j] === '+';
            box = box || map[i][j] === '$';
        }
    }

    return !goal || !box;
};

const findPlayer = (map) => {
    let playerI = null;
    let playerJ = null;

    for (const i in map) {
        for (const j in map[i]) {
            if (map[i][j] === '@' || map[i][j] === '+') {
                playerI = i;
                playerJ = j;
            }
        }
    }

    return [playerI, playerJ];
};

const pushPlayer = (map, i, j) => {
    if (map[i][j] === '@') {
        map[i][j] = ' ';
    } else if (map[i][j] === '+') {
        map[i][j] = '.';
    }
};

const popPlayer = (map, i, j) => {
    if (map[i][j] === ' ') {
        map[i][j] = '@';
    } else if (map[i][j] === '.') {
        map[i][j] = '+';
    }
};

const pushBox = (map, i, j) => {
    if (map[i][j] === '$') {
        map[i][j] = ' ';
    } else if (map[i][j] === '*') {
        map[i][j] = '.';
    }
};

const popBox = (map, i, j) => {
    if (map[i][j] === ' ') {
        map[i][j] = '$';
    } else if (map[i][j] === '.') {
        map[i][j] = '*';
    }
};

const findPath = (map, playerI, playerJ, targetI, targetJ) => {
    const visited = {};

    const dfs = (i, j) => {
        if (visited[i + '_' + j]) {
            return false;
        }

        visited[i + '_' + j] = true;

        if (map[i][j] === ' ' || map[i][j] === '.') {
            return i === targetI && j === targetJ
                || i - 1 >= 0 && dfs(i - 1, j)
                || i + 1 < map.length && dfs(i + 1, j)
                || j - 1 >= 0 && dfs(i, j - 1)
                || j + 1 < map[i].length && dfs(i, j + 1);
        }

        return false;
    };

    return dfs(playerI, playerJ);
};

const move = (map, targetI, targetJ) => {
    const player = findPlayer(map);
    const playerI = player[0];
    const playerJ = player[1];

    if (targetI === playerI && targetJ === playerJ) {
        return false;
    }

    popPlayer(playerI, playerJ);

    if (findPath(map, playerI, playerJ, targetI, targetJ)) {
        pushPlayer(targetI, targetJ);

        return true;
    }

    pushPlayer(playerI, playerJ);

    return false;
};

const push = (map, boxI, boxJ, targetI, targetJ) => {
    let deltaI = null;
    let deltaJ = null;

    if (targetJ === boxJ && targetI < boxI) {
        deltaI = -1;
        deltaJ = 0;
    } else if (targetJ === boxJ && targetI > boxI) {
        deltaI = 1;
        deltaJ = 0;
    } else if (targetI === boxI && targetJ < boxJ) {
        deltaI = 0;
        deltaJ = -1;
    } else if (targetI === boxI && targetJ > boxJ) {
        deltaI = 0;
        deltaJ = 1;
    } else {
        return false;
    }

    let scanI = boxI;
    let scanJ = boxJ;

    while (scanI !== targetI && scanJ !== targetJ) {
        scanI += deltaI;
        scanJ += deltaJ;

        if (map[scanI][scanJ] !== ' ' && map[scanI][scanJ] !== '.') {
            return false;
        }
    }

    const player = findPlayer(map);
    const playerI = player[0];
    const playerJ = player[1];

    popPlayer(playerI, playerJ);

    if (findPath(map, playerI, playerJ, boxI - deltaI, boxJ - deltaJ)) {
        popBox(boxI, boxJ);
        pushBox(targetI, targetJ);
        pushPlayer(targetI - deltaI, targetJ - deltaJ);

        return true;
    }

    pushPlayer(playerI, playerJ);

    return false;
};

module.exports = {
    init: init,
    isBox: isBox,
    win: win,
    move: move,
    push: push,
};
