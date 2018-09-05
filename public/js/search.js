
function typeSearch() { 
    var search = document.getElementById('search')
    if(!search) return;

    var searchInput = search.querySelector('input[name = "search"]');
    var searchResult = search.querySelector('.search__results');

    searchInput.addEventListener('input', function () {
        if(!this.value) {
            searchResult.style.display = none;
            return; // stop!
        }

        // show the search result!
        searchResult.style.display = 'block';
        searchResult.innerHTML = '';

        var url =   '/catalog/api/search?q='+this.value;

        var req = new Request(url);
        fetch(req)
            .then(function(response) {
                return response.json();
            })
            .then(function (data) {
                if (data.length){
                    searchResult.innerHTML = searchResultHTML(data);
                }
            });
    });
    
}

function searchResultHTML(books) {
    return books.map(book => {
        return`
            <a href="/catalog/book/${book._id}" class="search_result">
                <strong>${book.title}</strong>
            </a>
        `
    }).join('');
}

typeSearch();