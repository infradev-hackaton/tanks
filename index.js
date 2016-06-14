import TheGame from './thegame';
import Bullet from './bullet';
import Protagonist from './protagonist';
import Antagonist1 from './antagonist1';
import Antagonist2 from './antagonist2';
import Antagonist3 from './antagonist3';
import Antagonist4 from './antagonist4';
import Antagonist5 from './antagonist5';

const SIZE = 100;
let game = new TheGame({
    size: SIZE,
    unitsCount: 2
});
let $view = $('.view');

let avgFps = 0;
let framesCount = 0;
let start = 0;

function renderGame() {
    let v = new Array(SIZE);

    game.each(function (unit, i) {
        if (unit instanceof Protagonist) {
            if (unit.getDirection()) {
                v[i] = '\ud83d\ude0e\ud83d\udc49';
            } else {
                v[i] = '\ud83d\udc48\ud83d\ude0e';
            }
        } else if (unit instanceof Antagonist5) {
            v[i] = '\ud83d\udc80';
        } else if (unit instanceof Antagonist4) {
            v[i] = '\ud83d\ude08';
        } else if (unit instanceof Antagonist3) {
            v[i] = '\ud83d\ude21';
        } else if (unit instanceof Antagonist2) {
            v[i] = '\ud83d\ude01';
        } else if (unit instanceof Antagonist1) {
            v[i] = '\ud83d\ude2c';
        } else if (unit instanceof Bullet) {
            v[i] = '-';
        } else {
            v[i] = ' ';
        }
    });

    let text = v.join('') + ' FRAMES/TIME: ' + Math.round(avgFps);

    $view.html(text.replace(/\s/g, '&nbsp;'));

    framesCount += 1;
    avgFps = framesCount / (Date.now() - start) * 1000;

    return Boolean(game.getHero());
}

function initView() {
    start = Date.now();
    framesCount = 0;
    avgFps = 0;
    renderGame();
}

initView();

function onArrowKd(e) {
    if (e.keyCode === 39) {
        $(window)
            .off('keydown', onArrowKd)
            .on('keyup', onArrowKu);
        game.getHero()
            .setDirection(true)
            .startMoving();
    } else if (e.keyCode === 37) {
        $(window)
            .off('keydown', onArrowKd)
            .on('keyup', onArrowKu);
        game.getHero()
            .setDirection(false)
            .startMoving();
    }
}

function onArrowKu(e) {
    if (e.keyCode === 39 || e.keyCode === 37) {
        game.getHero().stopMoving();
        $(window)
            .off('keyup', onArrowKu)
            .on('keydown', onArrowKd);
    }
}

function onSpaceKd(e) {
    if (e.keyCode === 32) {
        $(window)
            .off('keydown', onSpaceKd)
            .on('keyup', onSpaceKu);
        game.getHero().startFire();
    }
}

function onSpaceKu(e) {
    if (e.keyCode === 32) {
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
