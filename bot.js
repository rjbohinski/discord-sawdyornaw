/**
 * @author Kevin Bohinski <bohinsk1@tcnj.edu>
 * @version 1.0.0
 * @since 2016-2-26
 *
 * Project Name:  sawdyornaw
 * Description:   Discord bot that uses classification to
 *                determine if the last message was positive
 *                or negative.
 *                Application made to practice with Node.js
 *                and Amazon Elastic Beanstalk.
 *
 * Filename:      /bot.js
 * Description:   Main bot for sawdyornaw.
 * Last Modified: 2016-2-26
 *
 * Copyright (c) 2016 Kevin Bohinski. All rights reserved.
 */

/* Bring in requirements */
var Discord = require('discord.js');
var request = require('request');
var creds = require('creds.json');

/* Setup discord.js */
var discord = new Discord.Client();
discord.login(creds.user, creds.pass);

/* Variable to store last message in */
var last = '';

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
                    discord.reply(msg, 'naw');
                } else if (json['sentiment'] === 'negative') {
                    discord.reply(msg, 'sawdy');
                } else if (json['sentiment'] === 'neutral') {
                    discord.reply(msg, 'neither');
                } else {
                    discord.reply(msg, 'Err: Bad API response.');
                }
            } else {
                discord.reply(msg, 'Err: Bad API call.');
            }
        });
    } else {
        /* If not a request to run analysis, just save the message as the last message */
        last = m;
    }
});
