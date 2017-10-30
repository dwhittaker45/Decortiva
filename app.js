require('dotenv-extended').load();

var util = require("util");
var restify = require("restify");
var builder = require("botbuilder");
var teams = require("botbuilder-teams");

var connector = new teams.TeamsChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var server = restify.createServer();

server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

connector.resetAllowedTenants();
server.post('/api/v1/bot/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

var stripBotAtMentions = new teams.StripBotAtMentions();
bot.use(stripBotAtMentions);

bot.dialog('/',function(session){
  var q = session.message.text;
  var options = {
  host: 'westus.api.cognitive.microsoft.com',
  path: '/qnamaker/v2.0/knowledgebases/1012251a-10dc-4805-bdf5-98b9f59c283b/generateAnswer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': 'cd0e1f6e198d43b2b1cf9c81d73eefc9'
  }
  };
  var answer = '';
  var jsonQ = {
    question: q
  };
  var resp = https.request(options, function(response){
    response.on('data',function(chunk){
      var answer = JSON.parse(chunk);
      var amess = new builder.Message(session)
      amess.text(answer.answers[0]['answer']);
      amess.textFormat("plain");
      amess.textLocale("en-us");
      session.send(amess);
    });
  }).end(JSON.stringify(jsonQ));
});
