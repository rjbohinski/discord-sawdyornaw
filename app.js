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
 * Last Modified: 2016-09-05
 *
 * Copyright (c) 2016 Kevin Bohinski. All rights reserved.
 */

/* Bring in requirements */
var Discord = require('discord.js');
var request = require('request');
var creds = require('./creds.json');
var cheerio = require('cheerio');

/* Setup discord.js */
var discord = new Discord.Client();
discord.login(creds.discord.user, creds.discord.pass);

/* Variable to store last message in, and cache */
var last = '';
var dankmemeCache = {
  time: 0,
};
var emojipastaCache = {
  time: 0,
};

/* Variable for Options */
var opts = {};

var version = '1.0.2';

/* For each message received */
discord.on('message', function (msg) {
  /* Save message, ignore included metadata */
  var m = msg.content;

  if (m.split(' ')[0] === '/http') {
    discord.reply(msg, 'https://http.cat/' + m.split(' ')[1] + '.jpg', opts);
  }

  /* If sentiment analysis is requested */
  if (m.split(' ')[0] === '/sawdyornaw') {
    /* Sent POST request to API */
    var url = 'https://api.uclassify.com/v1/uclassify/Sentiment/classify/?readKey=' +
      creds.uclassify.read + '&text=' + last;
    request.get(url, function (e, r, b) {
      /* If no errors */
      if (r.statusCode === 200 && !e) {
        /* Give user indication that the bot is working */
        discord.startTyping(msg.channel);

        /* On reply, parse response */
        var json = JSON.parse(b);
        var reply = 'Neutral';

        if (json.positive > 0.5) {
          reply = 'Naw';
        } else if (json.negative > 0.5) {
          reply = 'Sawdy';
        }

        discord.reply(msg, reply, opts);
        discord.stopTyping(msg.channel);
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
    /* Check to see if cache is recent up to an hour */
    if (Math.abs(((new Date()).getTime() - emojipastaCache.time)) > 3600000) {
      request.get('https://www.reddit.com/r/emojipasta/search?q=&restrict_sr=on&sort=new&t=all',
        function (e, r, b) {
          /* If no errors */
          if (r.statusCode === 200 && !e) {
            /* Give user indication that the bot is working */
            discord.startTyping(msg.channel);

            /* On reply, parse response */
            var $ = cheerio.load(b);
            var pastas = [];
            $('div.search-result').each(function (i) {
              pastas.push($(this).find('a.search-title').text() + ' ' + $(this).find('p')
                .text());
            });

            discord.reply(msg, pastas[Math.floor(Math.random() * pastas.length)], opts);
            discord.stopTyping(msg.channel);

            /* Save to cache */
            emojipastaCache.time = (new Date()).getTime();
            emojipastaCache.memes = pastas;
          } else {
            discord.reply(msg, 'Err: Bad API call.', opts);
          }
        });
    } else {
      /* Give user indication that the bot is working, and send message from cache. */
      discord.startTyping(msg.channel);
      discord.reply(msg, emojipastaCache.memes[Math.floor(Math.random() * emojipastaCache.memes
        .length)], opts);
      discord.stopTyping(msg.channel);
    }
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
    setTimeout(function () {
      discord.sendMessage(msg.channel, 'Version: ' + version, opts);
    }, 125);
    var arrHelp = [
      '/http',
      '/help',
      '/speak',
      '/shutup',
      '/emojipasta',
      '/sawdyornaw',
      '/dog',
      '/michaelscott',
      '/dankmeme',
    ];
    setTimeout(function () {
      discord.sendMessage(msg.channel, 'Commands: `' + arrHelp.join(' ') + '`', opts);
    }, 125);
  }

  /* If dog is requested */
  if (m.split(' ')[0] === '/dog' || m.split(' ')[0] === '/puppy') {
    discord.reply(msg, 'Puppy API is down :(', opts);
    /*
    /* Sent GET request to API /
    request.get('http://www.thepuppyapi.com/puppy', function (e, r, b) {
        /* If no errors /
        if (r.statusCode === 200 && !e) {
            /* Give user indication that the bot is working /
            discord.startTyping(msg.channel);

            /* On reply, parse response /
            var url = JSON.parse(b).puppy_url;

            discord.reply(msg, url, opts);
            discord.stopTyping(msg.channel);
        } else {
            discord.reply(msg, 'Err: Bad API call.', opts);
        }
    });
    */
  }

  /* If Michael Scott is requested */
  if (m.split(' ')[0] === '/michaelscott') {
    /* Sent GET request to API */
    request.get('https://michael-scott-quotes.herokuapp.com/quote', function (e, r, b) {
      /* If no errors */
      if (r.statusCode === 200 && !e) {
        /* Give user indication that the bot is working */
        discord.startTyping(msg.channel);

        /* On reply, parse response */
        var quote = b.split('{ "quote": "')[1];

        discord.reply(msg, quote.substring(0, quote.length - 1), opts);
        discord.stopTyping(msg.channel);
      } else {
        discord.reply(msg, 'Err: Bad API call.', opts);
      }
    });
  }

  if (m.split(' ')[0] === '/dankmeme') {
    /* Check to see if cache is recent up to an hour */
    if (Math.abs(((new Date()).getTime() - dankmemeCache.time)) > 3600000) {
      request.get(
        'https://www.reddit.com/r/dankmemes/search?q=site%3Aimgur.com&restrict_sr=on&sort=new&t=all',
        function (e, r, b) {
          /* If no errors */
          if (r.statusCode === 200 && !e) {
            /* Give user indication that the bot is working */
            discord.startTyping(msg.channel);

            /* On reply, parse response */
            var $ = cheerio.load(b);
            var links = [];
            $('a.search-link').each(function (i) {
              links.push($(this).text().trim());
            });

            discord.reply(msg, links[Math.floor(Math.random() * links.length)], opts);
            discord.stopTyping(msg.channel);

            /* Save to cache */
            dankmemeCache.time = (new Date()).getTime();
            dankmemeCache.memes = links;
          } else {
            discord.reply(msg, 'Err: Bad API call.', opts);
          }
        });
    } else {
      /* Give user indication that the bot is working, and send message from cache. */
      discord.startTyping(msg.channel);
      discord.reply(msg, dankmemeCache.memes[Math.floor(Math.random() * dankmemeCache.memes.length)],
        opts);
      discord.stopTyping(msg.channel);
    }
  }

  /* If other bots say anything */
  if (msg.author.username === 'berrybot' || msg.author.username === 'Senpai') {
    var arrInsultBot = ['nobody cares', 'you\'re irrelevant'];
    discord.sendMessage(msg.channel, arrInsultBot[Math.floor(Math.random() * arrInsultBot.length)] +
      ', ' + msg.author.username + '.', opts);
  }
});
