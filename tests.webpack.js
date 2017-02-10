//make sure you have your directory and regex test set correctly!
var context = require.context('./tests', true, /-test\.js$/);
context.keys().forEach(context);
