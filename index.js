var GAME = (function () {
    var SIZE = 150;
    var game = new TheGame({
        size: SIZE,
        unitsCount: 5
    });
    var $view = $('.view');

    var fpsAvg = 0;
    var framesCount = 0;
    var start = new Date();

    function renderGame(game) {
        var v = new Array(SIZE);
        var now = new Date();
        var dur = now - start;
        framesCount += 1;

        if (dur > 1000) {
            fpsAvg += framesCount;
            fpsAvg /= 2;
            framesCount = 0;
            start = now - (dur - 1000);
        }

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
                if (unit.getDirection()) {
                    v[i] = '\u204d';
                } else {
                    v[i] = '\u204c';
                }
            } else {
                v[i] = ' ';
            }
        });

        var text = v.join('') + ' FPS: ' + fpsAvg.toFixed(2);

        $view.html(text.replace(/\s/g, '&nbsp;'));

        return Boolean(game.getHero());
    }

    renderGame(game);

    function onArrowKd(e) {
        if (e.key === 'ArrowRight') {
            $(window)
                .off('keydown', onArrowKd)
                .on('keyup', onArrowKu);
            game.getHero().
                setDirection(true).
                startMoving();
        } else if (e.key === 'ArrowLeft') {
            $(window)
                .off('keydown', onArrowKd)
                .on('keyup', onArrowKu);
            game.getHero().
                setDirection(false).
                startMoving();
        }
    }

    function onArrowKu(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            game.getHero().stopMoving();
            $(window)
                .off('keyup', onArrowKu)
                .on('keydown', onArrowKd);
        }
    }

    function onSpaceKd(e) {
        if (e.key === ' ') {
            $(window)
                .off('keydown', onSpaceKd)
                .on('keyup', onSpaceKu);
            game.getHero().startFire();
        }
    }

    function onSpaceKu(e) {
        if (e.key === ' ') {
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

        if (!renderGame(game)) {
            game.stop();
            $('.page')
                .addClass('page_pause');
        }

        TheGame.pushFrame(doLayout);
    }

    $('.button_action_reset').click(function () {
        $('.page')
            .removeClass('page_playing')
            .addClass('page_pause');

        game.init();
        renderGame(game);
    });

    $('.button_action_start').click(function () {
        if (game.start()) {
            $(window)
                .on('keydown', onArrowKd)
                .on('keydown', onSpaceKd);

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

    return game;
})();
