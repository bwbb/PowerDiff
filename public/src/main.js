var simpleGit = require('simple-git');
var differ = require('diff2html').Diff2Html;

var diff = {
    baseBranch: null,
    compareBranch: null
};


window.onload = function() {
    $(document).foundation();

    var gitRepoBtn = document.getElementById('gitRepoBtn');
    
    gitRepoBtn.onclick = function() {
        getDirectoryPath( 'fileDialog' )
            .then(function( dirPath ) {
                return isValidGitRepo( dirPath );
            }).then(function( dirPath ) {
                console.log('Valid Repo: Initializing Git...');
                return initGit( dirPath );
            }, function() {
                displayToastMessage( 'Not a valid git repository!' );
            }).then(function( diffConfig ) {
                return getBranchDiff( diffConfig );
            }).then(function( diffStr ) {
                var htmlStr = differ.getPrettyHtmlFromDiff( diffStr );
                $('#main').html( htmlStr );
            });

    }
}; // window.onload




function getDirectoryPath( inputId ) {
    var deferred = Q.defer();

    var fileInputDialog = document.querySelector('#' + inputId);

    fileInputDialog.addEventListener('change', function(evt) {
        console.log('Directory Path: ', this.value);
        deferred.resolve( this.value );
    }, false);

    fileInputDialog.click();

    return deferred.promise;
}

function isValidGitRepo( directory ) {
    var deferred = Q.defer();

    simpleGit( directory )
        .status(function(err) {
            if ( err && typeof err === 'string' && err.includes('fatal') ) {
                deferred.reject( directory );
            } else {
                deferred.resolve( directory );
            }
        });

    return deferred.promise;
}

function getBranchDiff( diffConfig ) {
    console.log('config', diffConfig );

    var deferred = Q.defer();

    var diffOption = diffConfig.baseBranch + '..' + diffConfig.compareBranch;

    simpleGit( diffConfig.directory )
        .raw([
            'diff',
            diffOption
        ], function( err, diffResult ) {
            console.log('error', err);
            deferred.resolve( diffResult );
        });
    
    return deferred.promise;
}

function initGit( directory ) {
    var deferred = Q.defer();

    $('#gitRepoBtn')
        .attr("disabled","disabled")
        .empty()
        .append( '<i class="icon ion-social-github"></i> ' + getRepoName( directory ));
    
    var diffConfig = {
        directory: directory,
        baseBranch: null,
        compareBranch: null
    };

    simpleGit( directory )
        .branch(function(err, branchSummary) {
            if (err) console.log(err);
            console.log('branch summary', branchSummary);

            var i = 0;
            var branchLinks = '';
            while ( !branchSummary.all[i].includes('remotes') ) {
                branchLinks += '<li><a href="#">'+ branchSummary.all[i] + '</a></li>';
                i++;
            }

            $('#baseBranches, #compareBranches').html( branchLinks );

            $('#baseBranches a').click(function() {
                $('#baseBranchBtn').text( 'Base: ' + $(this).html() );
                diffConfig.baseBranch = $(this).html();
            });

            $('#compareBranches a').click(function() {
                $('#compareBranchBtn').html( '<i class="icon ion-pull-request"></i> Compare: <strong>' + $(this).html() + '</strong>' );
                diffConfig.compareBranch = $(this).html();

                deferred.resolve( diffConfig );
            });
            
        });
    
    return deferred.promise;
        
}

function getRepoName( dirStr ) {
    return dirStr.substring( dirStr.lastIndexOf('/') + 1 );
}

function createCallout(textStr) {
    return $('<div>', { class: 'callout small alert', id: 'toastMsg', text: textStr } );
}

function displayToastMessage( msg ) {
    $('#main').prepend( createCallout( msg ) );
    setTimeout(function() {
        $('#toastMsg').fadeOut('slow');
    }, 4000);
}
