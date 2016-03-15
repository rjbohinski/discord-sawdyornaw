/**
 * @author Kevin Bohinski <bohinsk1@tcnj.edu>
 * @version 1.0.1
 * @since 2016-2-26
 *
 * Project Name:  sawdyornaw
 * Description:   Discord bot that uses classification to
 *                determine if the last message was positive
 *                or negative.
 *                Application made to practice with Node.js
 *                and Amazon Elastic Beanstalk.
 *
 * Filename:      /app.js
 * Description:   Main bot for sawdyornaw.
 * Last Modified: 2016-3-15
 *
 * Copyright (c) 2016 Kevin Bohinski. All rights reserved.
 */

/* Bring in requirements */
var Discord = require('discord.js');
var request = require('request');
var creds = require('./creds.json');

/* Setup discord.js */
var discord = new Discord.Client();
discord.login(creds.user, creds.pass);

/* Variable to store last message in */
var last = '';

/* Variable for Options */
var opts = new Object();

var version = '1.0.1';

/* For each message received */
discord.on('message', function (msg) {
    /* Save message, ignore included metadata */
    var m = msg['content'];

    /* If sentiment analysis is requested */
    if (m.split(' ')[0] === '/sawdyornaw') {
        /* Sent POST request to API */
        request.post({
            url: 'http://www.kevinbohinski.com/discordbot/api.php',
            form: {content: last}
        }, function (e, r, b) {
            /* On reply, parse response */
            var json = JSON.parse(b);

            /* If no errors */
            if (r.statusCode === 200 && !e && json['status'] === 'success') {
                /* Parse sentiment, and write back on discord */
                if (json['sentiment'] === 'positive') {
                    discord.reply(msg, 'naw', opts);
                } else if (json['sentiment'] === 'negative') {
                    discord.reply(msg, 'sawdy', opts);
                } else if (json['sentiment'] === 'neutral') {
                    discord.reply(msg, 'neither', opts);
                } else {
                    discord.reply(msg, 'Err: Bad API response.', opts);
                }
            } else {
                discord.reply(msg, 'Err: Bad API call.', opts);
            }
        });
    } else {
        /* If not a request to run analysis, just save the message as the last message */
        last = m;
    }

    /* If /r/emojipasta is requested */
    if (m.split(' ')[0] === '/emojipasta') {
        /* Sent GET request to API */
        request.get('http://45.79.176.133/api.php', function (e, r, b) {
            /* On reply, parse response */
            var arr = b.split('] => ');
            var pastas = [arr[1].substring(0, arr[1].length - 3), arr[2].substring(0, arr[2].length - 3), arr[3].substring(0, arr[3].length - 3), arr[4].substring(0, arr[4].length - 3), arr[5].substring(0, arr[5].length - 1)];

            /* If no errors */
            if (r.statusCode === 200 && !e) {
                discord.reply(msg, pastas[Math.floor(Math.random() * pastas.length)], opts);
            } else {
                discord.reply(msg, 'Err: Bad API call.', opts);
            }
        });
    }

    /* If tts is requested */
    if (m.split(' ')[0] === '/speak') {
        opts.tts = true;
    }

    /* If tts is un-requested */
    if (m.split(' ')[0] === '/shutup') {
        opts.tts = false;
    }

    /* If help is requested */
    if (m.split(' ')[0] === '/help') {
        discord.sendMessage(msg.channel, 'https://github.com/kbohinski/discord-sawdyornaw', opts);
        discord.sendMessage(msg.channel, 'Version: ' + version, opts);
        discord.sendMessage(msg.channel, 'Commands: ' + version, opts);
        var arr = ['/help', '/speak', '/shutup', '/emojipasta', '/sawdyornaw', '/dog', '/michaelscott'];
        arr.forEach(function (i) {
            discord.sendMessage(msg.channel, '  `' + i + '`', opts);
        });
    }

    /* If dog is requested */
    if (m.split(' ')[0] === '/dog' || m.split(' ')[0] === '/puppy') {
        /* Sent GET request to API */
        request.get('http://www.thepuppyapi.com/puppy', function (e, r, b) {
            /* On reply, parse response */
            var url = JSON.parse(b).puppy_url;

            /* If no errors */
            if (r.statusCode === 200 && !e) {
                discord.reply(msg, url, opts);
            } else {
                discord.reply(msg, 'Err: Bad API call.', opts);
            }
        });
    }

    /* If Michael Scott is requested */
    if (m.split(' ')[0] === '/michaelscott') {
        /* Sent GET request to API */
        request.get('https://michael-scott-quotes.herokuapp.com/quote', function (e, r, b) {
            /* On reply, parse response */
            var quote = b.split('{ "quote": "')[1];

            /* If no errors */
            if (r.statusCode === 200 && !e) {
                discord.reply(msg, quote.substring(0, quote.length - 1), opts);
            } else {
                discord.reply(msg, 'Err: Bad API call.', opts);
            }
        });
    }

    /* If berrybot says anything */
    if (msg.author.username === 'berrybot') {
        var arr = ['nobody cares', 'you\'re irrelevant'];
        discord.sendMessage(msg.channel, arr[Math.floor(Math.random() * arr.length)] + ', berrybot.', opts);
    }
});
