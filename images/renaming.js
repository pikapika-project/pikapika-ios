var fs = require('fs');

fs.readdir('pokemon', function(err, data){
    data.forEach((archive) => {
        fs.rename('pokemon/' + archive, 'pokemon/' + archive.replace('_', ''), function(err) {
            console.log('ERROR: ' + err);
        });
    });
});
