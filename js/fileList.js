const repoOwner = 'cloudkore';
const repoName = 'matrix';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/MODs`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const fileList = document.getElementById('fileList');

    data.forEach(file => {
      const listItem = document.createElement('li');
      listItem.classList.add('mod-item');

      const link = document.createElement('a');
      link.textContent = file.name;
      link.href = file.download_url;
      link.download = file.name;

      listItem.appendChild(link);
      fileList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error('Error fetching files:', error);
    document.getElementById('fileList').innerHTML =
      "<li>Error loading files. Please try again later.</li>";
  });

// Live search
document.getElementById('searchInput').addEventListener('input', function () {
  const searchTerm = this.value.toLowerCase();
  const items = document.querySelectorAll('#fileList li');

  items.forEach(item => {
    const name = item.textContent.toLowerCase();
    item.style.display = name.includes(searchTerm) ? 'list-item' : 'none';
  });
});