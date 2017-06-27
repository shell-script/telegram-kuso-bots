'use strict';

const config = require('./config');
const bot = require('./bot.' + config.bot)(config.threesomeToken);

const data = require('./threesome.data')(config.threesomePathActions, config.threesomePathCommands);

const info = require('./threesome.info')(bot);
const command = require('./threesome.command')(bot, data.games, data.commands, data.writeCommand);
const gather = require('./threesome.gather')(bot, data.games, data.writeGame);
const init = require('./threesome.init')(bot, data.games);
const play = require('./threesome.play')(bot, data.games);

process.on('uncaughtException', (err) => {
    console.error(err);
});

const event = (handler) => {
    return (msg, match) => {
        console.log('[' + Date() + '] ' + msg.chat.id + ':' + msg.from.id + ' ' + match[0]);

        data.writeMessage(
            msg,
            match
        );

        if (config.threesomeBan[msg.from.id]) {
            bot.sendMessage(
                msg.chat.id,
                '妈的 JB 都没你啪个毛',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            handler(msg, match);
        }
    };
};

bot.onText(/^\/nextsex/, event((msg, match) => {
    info.next(msg);
}));

bot.onText(/^\/startmasturbate/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        }
    } else {
        init.masturbate(msg).then(() => {
            gather.join(msg);
        });
    }
}));

bot.onText(/^\/startsex/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        }
    } else {
        init.sex(msg).then(() => {
            gather.join(msg);
        });
    }
}));

bot.onText(/^\/startthreesome/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        }
    } else {
        init.threesome(msg).then(() => {
            gather.join(msg);
        });
    }
}));

bot.onText(/^\/startgroupsex/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        }
    } else {
        init.groupsex(msg).then(() => {
            gather.join(msg);
        });
    }
}));

bot.onText(/^\/start100kills/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        }
    } else {
        init.kills(msg).then(() => {
            gather.join(msg);
        });
    }
}));

bot.onText(/^\/extend[^ ]*( ([+\-]?\d+)\w*)?$/, event((msg, match) => {
    let time = parseInt(match[2] || '30', 10);

    if (time > 300) {
        time = 300;
    }
    if (time < -300) {
        time = -300;
    }

    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.extend(msg, time);
        } else {
            play.extend(msg, time);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/join/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.join(msg);
        } else {
            play.join(msg);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/flee/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.flee(msg);
        } else {
            play.flee(msg);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/smite[^ ]*( @?(\w+))?$/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            // TODO: get user id from message?
            //       if (match[2]) ...
            // gather.flee(msg);
        } else {
            play.smite(msg, match[2]);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/forcestart/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.start(msg);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/forcefallback/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time <= 0) {
            gather.fallback(msg);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/forceorgasm/, event((msg, match) => {
    if (data.games[msg.chat.id]) {
        const game = data.games[msg.chat.id];

        if (game.time > 0) {
            play.orgasm(msg);
        }
    } else {
        info.na(msg);
    }
}));

bot.onText(/^\/listall$/, event((msg, match) => {
    command.all(msg);
}));

bot.onText(/^\/list[^ ]*( ((?!_)\w*))?$/, event((msg, match) => {
    command.list(msg, match[2] || '');
}));

bot.onText(/^\/add[^ ]* ((?!_)\w*)@([^\r\n]+)$/, event((msg, match) => {
    command.add(msg, match[1], match[2]);
}));

bot.onText(/^\/((?!_)\w+)[^ ]*( ([^\r\n ]+))?( ([^\r\n ]+))?( ([^\r\n ]+))?$/, event((msg, match) => {
    // to avoid spam between bots
    if (Math.random() < 0.99) {
        command.get(msg, match[1], [match[3], match[5], match[7]]);
    }
}));

setInterval(() => {
    for (const i in data.games) {
        const game = data.games[i];

        if (game.time <= 0) {
            gather.tick({
                // mock object
                date: Date.now(),
                chat: {
                    id: i,
                },
            });
        } else {
            play.tick({
                // mock object
                date: Date.now(),
                chat: {
                    id: i,
                },
            });

            // TODO: move to threesome.command.js?
            if (game.time > 0 && game.time - game.total < -10) {
                let userbase = game.usercount;
                let userneed = 3;
                const args = [];

                for (const j in game.users) {
                    if (Math.random() < userneed / userbase) {
                        args.push(game.users[j].first_name || game.users[j].last_name);

                        userneed -= 1;
                    }

                    userbase -= 1;
                }

                if (Math.random() < 0.05) {
                    command.get({
                        // mock object
                        date: Date.now(),
                        chat: {
                            id: i,
                        },
                    }, '', args);
                }
            }
        }

        game.time += 1;
    }
}, 490);
