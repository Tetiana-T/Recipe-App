const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const nextMeal = document.getElementById("next-arrow");
const previousMeal = document.getElementById("previous-arrow");

let currentPosition = -1;
const array_allShownMeal = [];
getNextMeal();
//let a = getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    return randomMeal;
}

async function getMealById(id) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {

    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    );

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    console.log(mealData);
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            <span class="random"> ${mealData.strCategory} </span>
            <img class="meal-img"
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });
    const mealImg = meal.querySelector(".meal-img");

    mealImg.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    if (!mealIds.includes(mealId)) {
        localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
    }
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}" class="fav-meal-img"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    const favMealImg = favMeal.querySelector(".fav-meal-img");
    //CHECK
    favMealImg.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");
    mealEl.setAttribute("class", "popup");

    const ingredients = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${
                    mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
                }

async function ShowAllMealsFindBySearch(){
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);
    mealsEl.innerHTML = '';

    if(meals == undefined){
                swal("Oops!", "Anything was found. Please, Try again!", "warning");
                let meal = await getRandomMeal();
                addMeal(meal);
                array_allShownMeal.splice(currentPosition, 0, meal);
    }
    else{
        ShowAllMeals(meals);
        currentPosition++;
        if(currentPosition == array_allShownMeal.length){
            array_allShownMeal.push(meals);
        }
        else{
            array_allShownMeal.splice(currentPosition, 0, meals);
        } 
 }
   
return meals;
}

async function ShowAllMeals(meals){  
    if(meals){
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
    return meals;
}
 
searchBtn.addEventListener("click", async() => {
    ShowAllMealsFindBySearch();
});
searchTerm.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        ShowAllMealsFindBySearch();
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});


async function getNextMeal(){
    mealsEl.innerHTML = "";
    let tempCurrPos = currentPosition + 1;
    if(tempCurrPos > -1 && tempCurrPos < array_allShownMeal.length){
        currentPosition = tempCurrPos;
        if(Array.isArray(array_allShownMeal[currentPosition])){
            ShowAllMeals(array_allShownMeal[currentPosition]);
        }
        else{
            addMeal(array_allShownMeal[currentPosition], false);
        }
    }
    else{
        currentPosition++;
        let meal = await getRandomMeal();
        addMeal(meal, true);
        array_allShownMeal.push(meal);
    }
}
async function getPreviousMeal(){
    mealsEl.innerHTML = "";
    let tempCurrPos = currentPosition - 1;
    if(tempCurrPos > -1 && tempCurrPos < array_allShownMeal.length){
        currentPosition = tempCurrPos;
        if(Array.isArray(array_allShownMeal[currentPosition])){
            ShowAllMeals(array_allShownMeal[currentPosition]);
        }
        else{
            addMeal(array_allShownMeal[currentPosition], false);
        }
    }
}

nextMeal.addEventListener("click", () => {
    getNextMeal();
});

previousMeal.addEventListener("click", () => {
    getPreviousMeal();
});