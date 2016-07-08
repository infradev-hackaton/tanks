import TheGame from './thegame';
import Bullet from './bullet';
import Protagonist from './protagonist';
// import Antagonist1 from './antagonist1';
// import Antagonist2 from './antagonist2';
// import Antagonist3 from './antagonist3';
// import Antagonist4 from './antagonist4';
// import Antagonist5 from './antagonist5';

const SIZE = 40;

const KEY_L = 37;
const KEY_U = 38;
const KEY_R = 39;
const KEY_D = 40;
const KEY_SPACE = 32;

let game = new TheGame({
    w: SIZE,
    h: SIZE,
    unitsCount: 2
});
let $view = $('.view');
let $fps = $('.fps');

let avgFps = 0;
let framesCount = 0;
let start = 0;

function renderGame() {
    let v = new Array(game.params.h);

    game.each(function (unit, x, y) {
        let row = v[y];

        if (!Array.isArray(row)) {
            v[y] = new Array(game.params.w);
        }

        if (unit instanceof Protagonist) {
            let d = unit.getDirection();

            if (d === 'r') {
                v[y][x] = '→';
            } else if (d === 'l') {
                v[y][x] = '←';
            } else if (d === 't') {
                v[y][x] = '↑';
            } else if (d === 'b') {
                v[y][x] = '↓';
            }

        } else if (unit instanceof Bullet) {
            v[y][x] = '•';
        } else {
            v[y][x] = ' ';
        }
    });

    let text = v.map(function (row) {
        return row.join('');
    }).join('\n');

    $view.html(text);

    framesCount += 1;
    avgFps = framesCount / (Date.now() - start) * 1000;

    $fps.text(avgFps.toFixed(2));

    return Boolean(game.getHero());
}

function initView() {
    start = Date.now();
    framesCount = 0;
    avgFps = 0;
    renderGame();
}

initView();

var currentKdCode = 0;
var toRight = true;

function onArrowKd(e) {
    var hero = game.getHero();

    if (e.keyCode === currentKdCode) {
        return;
    }

    currentKdCode = e.keyCode;

    if (e.keyCode === KEY_U) {
        hero.startMoving();

    } else if (e.keyCode === KEY_L) {
        toRight = false;
        hero.stopRotation();
        hero.startRotation(false);
    } else if (e.keyCode === KEY_R) {
        toRight = true;
        hero.stopRotation();
        hero.startRotation(true);
    }
}

function onArrowKu(e) {
    var hero = game.getHero();

    currentKdCode = 0;

    if (e.keyCode === KEY_U) {
        hero.stopMoving();
    } else if (e.keyCode === KEY_R && toRight) {
        hero.stopRotation();
    } else if (e.keyCode === KEY_L && !toRight) {
        hero.stopRotation();
    }
}

function onSpaceKd(e) {
    if (e.keyCode === KEY_SPACE) {
        $(window)
            .off('keydown', onSpaceKd)
            .on('keyup', onSpaceKu);
        game.getHero().startFire();
    }
}

function onSpaceKu(e) {
    if (e.keyCode === KEY_SPACE) {
        $(window)
            .on('keydown', onSpaceKd)
            .off('keyup', onSpaceKu);
        game.getHero().stopFire();
    }
}

function doLayout() {
    if (game.isPaused()) {
        $(window)
            .off('keydown', onArrowKd)
            .off('keyup', onArrowKu)
            .off('keydown', onSpaceKd)
            .off('keyup', onSpaceKu);

        return;
    }

    if (!renderGame()) {
        game.stop();
        $('.page').addClass('page_pause');
    }

    TheGame.pushFrame(doLayout);
}

$('.button_action_reset').click(function () {
    $('.page')
        .removeClass('page_playing')
        .addClass('page_pause');

    game.init();
    initView();
});

$('.button_action_start').click(function () {
    if (game.start()) {
        $(window)
            .on('keydown', onArrowKd)
            .on('keyup', onArrowKu)
            .on('keydown', onSpaceKd);

        initView();
        doLayout();
    }

    $('.page')
        .removeClass('page_pause')
        .addClass('page_playing');
});

$('.button_action_pause').click(function () {
    game.stop();

    $('.page')
        .removeClass('page_playing')
        .addClass('page_pause');
});
