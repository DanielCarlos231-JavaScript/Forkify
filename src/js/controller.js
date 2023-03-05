import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) - Update results view to mark select results
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1) - Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 2) -Rendering recipe
    recipeView.render(recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);

    // Render NEW results
    resultsView.render(model.getSearchResultsPage());

    // reder initial pagination
    paginationView.render(model.state.search);
  } catch (err) {}
};

const controlPagination = function (goToPage) {
  // Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // reder NEW initial pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServing) {
  // update the recipe servings (in state)
  model.updateServings(newServing);

  // update the recipe View
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  //Add or remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmarks(model.state.recipe);
  } else {
    model.delteBookmarks(model.state.recipe.id);
  }

  //Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //load
    addRecipeView.renderSpinner();

    // console.log(newRecipe);
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // Render boookMarks
    bookmarksView.render(model.state.bookmarks);

    // Change URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Succsee message
    addRecipeView.renderMessage();

    //Close Form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('💣', error);
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
