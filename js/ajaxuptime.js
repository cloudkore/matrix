fetch('js/uptime.js')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(script => {
        // Execute the loaded script
        eval(script);
    })
    .catch(error => {
        console.error('There was a problem loading the script:', error);
    });