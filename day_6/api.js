const jokeBtn = document.getElementById("jokeBtn");
const copyBtn = document.getElementById("copyBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const clearBtn = document.getElementById("clearBtn");
const setup = document.getElementById("setup");
const punchline = document.getElementById("punchline");
const search = document.getElementById("search");
const historyList = document.getElementById("historyList");

let jokeHistory = [];
let currentJoke = null;

function showLoading(callback) {
    setup.textContent = "Loading joke...";
    punchline.textContent = "";
    setTimeout(() => {
        callback();
    }, 1000);
}
showLoading(getJoke);

function displayHistory(jokes=jokeHistory) {
     historyList.innerHTML = jokes
        .map((joke) => `
            <li>
                <strong>${joke.setup}</strong><br>
                ${joke.punchline}
            </li>`).join("");
}

function searchHistory() {
    const searchText = search.value.toLowerCase();
    const filteredJokes = jokeHistory.filter((joke) => {
        return (
            joke.setup.toLowerCase().includes(searchText) ||
            joke.punchline.toLowerCase().includes(searchText)
        );
    });
    const historyHTML = filteredJokes
    .map((joke) => {
        return `
        <li>
        <strong>${joke.setup}</strong>
        <br>
        ${joke.punchline}
        </li>`;
    }).join("");
    historyList.innerHTML = historyHTML;
    displayHistory(filteredJokes);
}

function getJoke() {
    fetch("https://official-joke-api.appspot.com/random_joke")
    .then((response)=> response.json())
    .then((data)=>{
        setup.textContent = data.setup;
        punchline.textContent = data.punchline;
    currentJoke = data;
    jokeHistory.push(data);
    displayHistory();
    })
    .catch((error)=>{
        setup.textContent = "Something went wrong!";
        punchline.textContent = "";
    });
}
jokeBtn.addEventListener("click", () => {
    showLoading(getJoke);
});

search.addEventListener("input", searchHistory);