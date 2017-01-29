#!/usr/bin/env node
//'use strict';
(function() {
  var async, chalk, getCommand, main, ndx, pack, pad, readline;

  ndx = require('./ndx');

  readline = require('readline');

  chalk = require('chalk');

  async = require('async');

  pack = require('../package.json');

  console.log(chalk.yellow('ndx framework ') + chalk.cyan('v' + pack.version));

  console.log(chalk.cyan('type ') + chalk.yellow('help') + chalk.cyan(' for a list of commands'));

  console.log(chalk.cyan('hit ') + chalk.yellow('Ctrl-C') + chalk.cyan(' to exit'));

  getCommand = function(commandName) {
    switch (commandName) {
      case 'connect':
      case 'login':
        return require('./controllers/connect');
      case 'backup':
        return require('./controllers/backup');
      case 'password':
      case 'pass':
        return require('./controllers/password');
      case 'help':
        return require('./controllers/help');
    }
  };

  pad = function(input) {
    while (input.length < 8) {
      input = ' ' + input;
    }
    return input;
  };

  main = function() {
    switch (ndx.data.state) {
      case 'command':
        return ndx.getData({
          prompt: "" + (chalk.green('ndx')) + (chalk.yellow('>')) + " "
        }, function(err, input) {
          var commandKeyword, i, j, keyword, keywords, len, questions;
          keywords = ndx.splitLine(input);
          if (keywords && keywords.length) {
            questions = [];
            ndx.data.command = getCommand(keywords[0]);
            if (!ndx.data.command) {
              console.log('unexpected command');
              return main();
            }
            for (i = j = 0, len = keywords.length; j < len; i = ++j) {
              keyword = keywords[i];
              if (i > 0) {
                commandKeyword = ndx.data.command.keywords[i - 1].replace('?', '');
                questions.push({
                  name: commandKeyword,
                  prompt: "" + (chalk.green(commandKeyword)) + (chalk.yellow('>')) + " "
                });
                if (commandKeyword) {
                  ndx.data[commandKeyword] = keyword;
                }
              }
            }
            while (i < ndx.data.command.keywords.length + 1) {
              commandKeyword = ndx.data.command.keywords[i - 1];
              if (!/\?/.test(commandKeyword)) {
                questions.push({
                  name: commandKeyword,
                  prompt: "" + (chalk.green(commandKeyword)) + (chalk.yellow('>')) + " "
                });
              }
              i++;
            }
            return async.eachSeries(questions, ndx.getData, function() {
              return ndx.data.command.exec(function(err, thing) {
                if (err) {
                  console.log(err);
                }
                return ndx.data.command.cleanup(function(err) {
                  return main();
                });
              });
            });
          }
        });
    }
  };

  main();

}).call(this);

//# sourceMappingURL=app.js.map