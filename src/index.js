import Game from './lib/game';
import CanvasView from './lib/canvas-view';
import Tank from './lib/tank';

const KEY_L = 37;
const KEY_U = 38;
const KEY_R = 39;
const KEY_D = 40;
const KEY_SPACE = 32;

const $domElem = $('.canvas-view');
const width = 40;
const height = Math.round(width / $domElem.width() * $domElem.height());

const game = new Game({
    width: width,
    height: height
})
    .on('tick', () => {
        view
            .setPixelRatio(window.devicePixelRatio)
            .doLayout(game);
    });

const view = new CanvasView($domElem[0], {
    width: game.params.width,
    height: game.params.height,
    resolution: 40
});

const hero = new Tank(game, {});

game.setPos(Math.round(width / 2), Math.round(height / 2), hero);

function isKey(e, ...keyCodes) {
    return keyCodes.some(keyCode => e.keyCode === keyCode);
}

function bindToHeroMoveKd() {
    $(window).on('keydown', onHeroMoveKd);
}

function unbindFromHeroMoveKd() {
    $(window).off('keydown', onHeroMoveKd);
}

function bindToHeroMoveKu() {
    $(window).on('keyup', onHeroMoveKu);
}

function unbindFromHeroMoveKu() {
    $(window).off('keyup', onHeroMoveKu);
}

function bindToHeroTurnKd() {
    $(window).on('keydown', onHeroTurnKd);
}

function unbindFromHeroTurnKd() {
    $(window).off('keydown', onHeroTurnKd);
}

function bindToHeroTurnKu() {
    $(window).on('keyup', onHeroTurnKu);
}

function unbindFromHeroTurnKu() {
    $(window).off('keyup', onHeroTurnKu);
}

function bindToHeroFireKd() {
    $(window).on('keydown', onHeroFireKd);
}

function unbindFromHeroFireKd() {
    $(window).off('keydown', onHeroFireKd);
}

function bindToHeroFireKu() {
    $(window).on('keyup', onHeroFireKu);
}

function unbindFromHeroFireKu() {
    $(window).off('keyup', onHeroFireKu);
}

function onHeroMoveKd(e) {
    if (isKey(e, KEY_U)) {
        unbindFromHeroMoveKd();
        hero.setBackward(false).start();
        bindToHeroMoveKu();
    } else if (isKey(e, KEY_D)) {
        unbindFromHeroMoveKd();
        hero.setBackward(true).start();
        bindToHeroMoveKu();
    }
}

function onHeroMoveKu(e) {
    if (isKey(e, KEY_U, KEY_D)) {
        unbindFromHeroMoveKu();
        hero.pause().reset();
        bindToHeroMoveKd();
    }
}

function onHeroTurnKd(e) {
    if (isKey(e, KEY_L)) {
        unbindFromHeroTurnKd();
        hero.turning.setBackward(true).start();
        bindToHeroTurnKu();
    } else if (isKey(e, KEY_R)) {
        unbindFromHeroTurnKd();
        hero.turning.setBackward(false).start();
        bindToHeroTurnKu();
    }
}

function onHeroTurnKu(e) {
    if (isKey(e, KEY_L, KEY_R)) {
        unbindFromHeroTurnKu();
        hero.turning.pause().reset();
        bindToHeroTurnKd();
    }
}

function onHeroFireKd(e) {
    if (isKey(e, KEY_SPACE)) {
        unbindFromHeroFireKd();
        hero.shooting.start();
        bindToHeroFireKu();
    }
}

function onHeroFireKu(e) {
    if (isKey(e, KEY_SPACE)) {
        unbindFromHeroFireKu();
        hero.shooting.pause().reset();
        bindToHeroFireKd();
    }
}

bindToHeroMoveKd();
bindToHeroTurnKd();
bindToHeroFireKd();

game.start();

// debug
// window.game = game;

// debug
// game.on('tick', () => {
//     $('#log').html([]
//         .join('<br/>')
//         .replace(/\s/g, '&nbsp;'));
// });
