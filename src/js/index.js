// Global app controller
//c98ac5ff5e2166ca00b67fc8e4f72035

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
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

    if (id) {
        //Prepare UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        //Add selection to the list
        if (state.search) searchView.selection(id);
        
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
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
        }
    }
};

//window.addEventListener('hashchange', ctrlRecipe);
//window.addEventListener('load', ctrlRecipe);

//Shorter verison of above
['hashchange', 'load'].forEach(event => window.addEventListener(event, ctrlRecipe));

/*LIST CONTROLLER*/
const ctrlList = () => {
    //Create list
    if(!state.list) state.list = new List();
    //Add ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

//Click event for update and delete buttons
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        
        listView.deleteItem(id);
        
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/*LIKE CONTROLLER*/


const ctrlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // NOT liked yet
    if (!state.likes.isLiked(currentID)) {
        // Add like
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle like
        likesView.toggleLikeBtn(true);

        // Add like to the list
        likesView.renderLike(newLike);

    // Liked
    } else {
        // Remove like
        state.likes.deleteLike(currentID);

        // Toggle like
        likesView.toggleLikeBtn(false);

        // Remove like from list
        likesView.deleteLike(currentID);
    }
    
};

//Restore likes when page was load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
    //Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like)); //?????
});

//Click event for buttons
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        ctrlList();
    } else if (e.target.matches('.recipe__love, recipe__love *')) {
        ctrlLike();
    }
});
