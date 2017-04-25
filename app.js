


var differ = require('diff2html').Diff2Html;
var simpleGit = require('simple-git')();

require('simple-git')('/Users/bwbalbac/Projects/elis/apps')
        .raw([
            'diff',
            'master..ROTI-36255'
        ], function( err, diffResult ) {
            var htmlStr = differ.getPrettyHtmlFromDiff( diffResult );
        });



