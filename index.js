const apiURL = "http://www.omdbapi.com/";
const apiKey = "aef8c2ee";

let movieLeft;
let movieRight;

async function onMovieSelect(movie, summaryElement, side) {
  const response = await axios.get(apiURL, {
    params: {
      apikey: apiKey,
      i: movie.imdbID,
    },
  });

  if (response.data.Error) {
    return {};
  }

  summaryElement.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    movieLeft = response.data;
  } else {
    movieRight = response.data;
  }

  if (movieLeft && movieRight) {
    compare();
  }
}

function compare() {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    leftStat.classList.remove("is-primary", "is-warning");
    rightStat.classList.remove("is-primary", "is-warning");

    if (isNaN(leftSideValue) || rightSideValue >= leftSideValue) {
      rightStat.classList.add("is-primary");
      leftStat.classList.add("is-warning");
    } else if (isNaN(rightSideValue) || rightSideValue < leftSideValue) {
      leftStat.classList.add("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
}

function movieTemplate(movieDetail) {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(" ").reduce((total, word) => {
    const value = parseInt(word);
    return isNaN(value) ? total : total + value;
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      <div>
    </article>
    <article data-value=${awards} class="notification">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
}

const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `<img src="${imgSrc}" />${movie.Title} (${movie.Year})`;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async search(query) {
    const response = await axios.get(apiURL, {
      params: {
        apikey: apiKey,
        s: query,
      },
    });

    if (response.data.Error) {
      return [];
    }

    return response.data.Search;
  },
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});
