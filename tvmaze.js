"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const REQUEST_API_URL = "http://api.tvmaze.com/search/shows";
const SUBSTITUTE_IMAGE = "https://tinyurl.com/tv-missing";
const REQUEST_EPISODE_DATA = "http://api.tvmaze.com/shows/";


  /** Given a search term, search for tv shows that match that query.
   *
   *  Returns (promise) array of show objects: [show, show, ...].
   *    Each show object should contain exactly: {id, name, summary, image}
   *    (if no image URL given by API, put in a default image URL)
   */

  async function getShowsByTerm(term) {
    let showsInfo = [];

    let response = await axios.get(REQUEST_API_URL, {
      params: { q: term },
    });

    for (let show of response.data) {
      let showInfo = { id: show.show.id, name: show.show.name, summary: show.show.summary, image: (show.show.image ? show.show.image.medium : SUBSTITUTE_IMAGE) };
      showsInfo.push(showInfo);
    }

    return showsInfo;
  }

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  console.log('get episodes ran')
  let episodes = [];
  let response = await axios.get(`${REQUEST_EPISODE_DATA}${id}/episodes`);
  
  for(let episode of response.data) {
    let episodeInfo = {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
    episodes.push(episodeInfo);
  }
  return episodes;
 }

/** Given list of , create markup for each and to DOM */

async function populateEpisodes(episodes) { 
  console.log('populate episodes ran');

  for (let episode of episodes) {
    const $episode = $(
      `<div data-episode-id="${episode.id}" class="Episode col-md-12 col-lg-6 mb-4">
        <h5 class="text-primary">Episode name: ${episode.name}</h5>
        <div><small>Season: ${episode.season} Episode: ${episode.number}</small></div> 
      </div>`
    );
    let listItem = $('<li>').append($episode);
    $('#episodesList').appen(listItem);
  }
}

/** Handle Episode button click: get episodes from API and display. */

async function searchForEpisodesAndDisplay(evt) {
  console.log('event handler ran');
  let parent = evt.target.parentList()[0];
  let $showId = $(parent).attr('data-show-id');
  let episodes = await getEpisodesOfShow($showId);
  populateEpisodes(episodes);
  $($episodesArea).show();
}

$('.Show-getEpisodes').on("click", async function(evt) {
  await searchForEpisodesAndDisplay(evt);
});

