// Global app controller
//c98ac5ff5e2166ca00b67fc8e4f72035

import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import {
    elements,
    renderLoader,
    clearLoader
} from './views/base';

/** Global state of the app
 *- Search object
 *- Current recipe object
 *- Shopping list object
 *- Liked recipes
 */

/*SEARCH CONTROLLER*/
const state = {};

const ctrlSearch = async () => {
    //1. Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4. Search recipes
            await state.search.getResults();

            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            console.log(error);
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    ctrlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/*RECIPE CONTROLLER*/
const ctrlRecipe = async () => {
    //Get ID from URL
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        //Prepare UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        //Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
            //Get recipe data and parseIng
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (error) {
            console.log(error);
        }
    }
};

//window.addEventListener('hashchange', ctrlRecipe);
//window.addEventListener('load', ctrlRecipe);

//Shorter verison of above
['hashchange', 'load'].forEach(event => window.addEventListener(event, ctrlRecipe));
