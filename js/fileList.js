
        const repoOwner = 'cloudkore'; // Replace with the owner of the repository
        const repoName = 'matrix'; // Replace with the name of the repository

        // GitHub API endpoint for listing files in the repository
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/MODs`;

        // Fetch the list of files
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Process the list of files
                const fileListElement = document.getElementById('fileList');
                data.forEach(file => {
                    const listItem = document.createElement('li');

                    // Create a download link for each file
                    const downloadLink = document.createElement('a');
                    downloadLink.textContent = file.name;
                    downloadLink.href = file.download_url;
                    downloadLink.download = file.name;

                    listItem.appendChild(downloadLink);
                    fileListElement.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching repository files:', error));
