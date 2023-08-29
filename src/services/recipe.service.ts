import { Injectable } from '@angular/core'
import { BehaviorSubject, from, Observable, throwError } from 'rxjs'
import { catchError, retry, tap } from 'rxjs/operators'
import { Recipe } from '../models/recipe.model'
import { storageService } from './async-storage.service'
import { HttpErrorResponse, HttpClient } from '@angular/common/http'
const ENTITY = 'recipes'

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    private API_URL = 'https://api.edamam.com/search'
    private APP_ID = 'bc075c85'
    private APP_KEY = '33ea5c1a5b8bbd6c0889067f5afe8ac8'

    private _recipes$ = new BehaviorSubject<Recipe[]>([])
    public recipes$ = this._recipes$.asObservable()

    private _filterBy$ = new BehaviorSubject<{ term: string }>({ term: '' })
    public filterBy$ = this._filterBy$.asObservable()

    constructor(private http: HttpClient) {
        const recipes = JSON.parse(localStorage.getItem(ENTITY) || 'null')
        if (!recipes || recipes.length === 0) {
            localStorage.setItem(ENTITY, JSON.stringify(this._createRecipes()))
        }
        this.query().subscribe()
    }

    public fetchRecipesFromAPI(query: string): Observable<any> {
        return this.http.get(`${this.API_URL}?q=${query}&app_id=${this.APP_ID}&app_key=${this.APP_KEY}`)
            .pipe(
                catchError(this._handleError)
            )
    }

    public saveRecipeFromAPI(hit: any) {
        const recipe = this.mapAPIToRecipe(hit.recipe)
        this.save(recipe).subscribe()
    }

    public query() {
        return from(storageService.query(ENTITY))
            .pipe(
                tap(recipes => {
                    const filterBy = this._filterBy$.value
                    const filteredRecipes = this._filter(recipes, filterBy.term)
                    this._recipes$.next(filteredRecipes)
                }),
                retry(1),
                catchError(this._handleError)
            )
    }

    private mapAPIToRecipe(apiRecipe: any): Recipe {
        return new Recipe(
            apiRecipe.label,
            apiRecipe.ingredientLines,
            apiRecipe.url,
            apiRecipe.dietLabels,
            apiRecipe.image
        )
    }

    public setFilterBy(filterBy: { term: string }) {
        this._filterBy$.next(filterBy)
        this.query().subscribe()
    }

    public getById(recipeId: string): Observable<Recipe> {
        return from(storageService.get(ENTITY, recipeId))
            .pipe(
                retry(1),
                catchError(err => throwError(`Recipe id ${recipeId} not found!`))
            )
    }

    public deleteRecipe(recipeId: string) {
        return from(storageService.remove(ENTITY, recipeId))
            .pipe(
                tap(() => {
                    let recipes = this._recipes$.value
                    recipes = recipes.filter(recipe => recipe._id !== recipeId)
                    this._recipes$.next(recipes)
                }),
                retry(1),
                catchError(this._handleError)
            )
    }

    public save(recipe: Recipe) {
        return recipe._id ? this._edit(recipe) : this._add(recipe)
    }

    public getEmptyRecipe() {
        return {
            label: '',
            ingredientLines: [],
            url: '',
            totalTime: '',
            image: ''
        }
    }

    private _edit(recipe: Recipe) {
        return from(storageService.put(ENTITY, recipe))
            .pipe(
                tap(updatedRecipe => {
                    const recipes = this._recipes$.value
                    this._recipes$.next(recipes.map(_recipe => _recipe._id === updatedRecipe._id ? updatedRecipe : _recipe))
                }),
                retry(1),
                catchError(this._handleError)
            )
    }

    private _add(recipe: Recipe) {
        const newRecipe = new Recipe(
            recipe.label,
            recipe.ingredientLines,
            recipe.url,
            recipe.dietLabels,
            recipe.image
        )
        if (typeof newRecipe.setId === 'function') newRecipe.setId(_getRandomId())
        return from(storageService.post(ENTITY, newRecipe))
            .pipe(
                tap(newRecipe => {
                    const recipes = this._recipes$.value
                    this._recipes$.next([...recipes, newRecipe])
                }),
                retry(1),
                catchError(this._handleError)
            )
    }


    private _filter(recipes: Recipe[], term: string) {
        term = term.toLocaleLowerCase()
        return recipes.filter(recipe => {
            return recipe.label.toLocaleLowerCase().includes(term) ||
                recipe.ingredientLines.some(ingredient => ingredient.toLocaleLowerCase().includes(term)) ||
                recipe.dietLabels.some(label => label.toLocaleLowerCase().includes(term))
        })
    }

    private _createRecipes() {
        const recipes = [{ "label": "Vegan cupcakes", "ingredientLines": ["150ml almond or soy milk", "½ tsp cider vinegar", "110g vegan butter or sunflower spread", "110g caster sugar", "1 tsp vanilla extract", "110g self-raising flour", "½ tsp baking powder", "125g vegan butter", "250g icing sugar", "1¼ tsp vanilla extract", "a few drops of vegan food colourings (check the label)"], "url": "https://www.bbcgoodfood.com/recipes/vegan-cupcakes", "dietLabels": ["Low-Sodium"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/73f/73f15b90b6e64653c77ef759ed9ccdea.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDuJzUruc95MhE1D8KXNV8EjYT%2FCla8KHj1LFGRNWYAjwIgYE3pCJpKPKuzMSOyhwXYoTr%2F61VDUtB31rggaWrW64wqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDDXMQRWBTDjyE%2FKiuCqWBfnVKeZLN3gJ3HXqtY%2B4LWoQS%2BjReEX7DJUUwY5DBsv9QurBkuuiluL6xGFE8b2607Lyig4J1XHDXVFLGjwLo5Vz4sCuKf105D%2BGIfGjzoviCD11ZWA3LVz7r%2FGNctn%2BycDqtczcwZqmsV7Zx8nSkm6A%2FzbyWnaOD3vwOI3GNZ9fsKCbpDXaBnnGO2dEcr%2BD6vPznh974RzOtBslNaFp9weqL7kFIGy1FNXdaO8De5NIptxBgYkJMZczNS%2FMdARzwRB%2BYr2NKLn5x26G8MJuoKlMNKDXhLqp1O08kCcLoQOGhpr5r4txqAce51aMI4Ie9baoxoheNmiAwVmwtZmXLLpXO8SE41RYkxqQbyDeSw%2FHYLbpCWubJCQ4%2BUIZ6cbwtWNeiWMgw9gPGAEaNxsf5Pe2Sq1dt7G7wJYrgCaadqvmSa0dFT05KikoOG51y6gQWoHJkaIB5MZLPoN28NRNaLpsaoySZEIZyc6iZPHewmdee5WsuQPWAIJqaWAdbkFNXQXTdPJTXSaSmcYXDTVSjFwsQVBfNAREqGcWVYCKE52NO0a3xX7Synu5fB0%2BU67HIbDr5%2FrRlFmy9vV5SwkPS%2ByEwGCAtXaPsOauDas0kxSW09yEKR%2BYBNL%2FVxtN8LaxrpcedNk7fgFMGJ4NPTMeJCGOGCAWifMkvGiSWGrF3I6PoB35In2wkYDE5Tk%2BzZayVFx5bIwIuHSCS6RNCYtwqgptI%2B8FYVHBlgxAbDj84RBMvalRcs5reDQl2%2BK6B9hDAk3jeCCC13TOjJD7LKER7BlR6BbUsyalMw%2F%2FzcLfOC42rRZonx%2FknkQUfaP40%2F9HKfXwGEGS0oswxjYT1mGHaXHtuOOTCOor39FZnG3vljQIGMBa1y4BMPTwsqcGOrEBCm3o77K8OFbC2uyL%2FA7nXXK0uCf18IZov4gc5Lk%2FXbjqIuo84BjZegrVfbVAV6%2BHkEGcqxiyCFmdzIpjk%2B5jcxTAVAaIntrDxdKk%2Fc0sezmpuguysFMJ7%2BV1Ha8sYwr5xqvG1shw0CD4E6n%2B7mAL8VByBWA2l7Hy4t3mOTezlz38WHo6dMunbo%2BqAuzOYEX%2BhATKFoH6klfpLKARHCYBNa0lxfZrtVPqp4ltkqAJ%2BjBR&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151617Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFGZUCYDFT%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d2dc218aa1d60e208bf681769277d4fdd86caaeb2fc4e970bdc7688613e1d28b", "_id": "1gRMkApQ" }, { "label": "Black Pepper Tofu", "ingredientLines": ["800 g Tofu", "Cornflour, to dust the tofu", "Vegetable Oil,for frying", "1 stick Butter", "350 g shallots, peeled and thinly sliced", "4 x Red Chillies, thinly sliced", "12 x garlic cloves, minced", "3 tbsp chopped ginger", "4 tbsp Black Peppercorns.crushed", "3 tbsp sweet soy sauce", "3 tbsp Light Soy Sauce", "4 tsp Dark Soy Sauce", "2 tbsp Caster Sugar (superfine sugar)", "16 x spring onions, cut into segments 3cm long", "Jasmine Rice for serving"], "url": "http://www.lottieanddoof.com/2010/08/black-pepper-tofu/", "dietLabels": ["Low-Carb"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/7b3/7b34f65772c77c43fbfa483ea9475513.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDuJzUruc95MhE1D8KXNV8EjYT%2FCla8KHj1LFGRNWYAjwIgYE3pCJpKPKuzMSOyhwXYoTr%2F61VDUtB31rggaWrW64wqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDDXMQRWBTDjyE%2FKiuCqWBfnVKeZLN3gJ3HXqtY%2B4LWoQS%2BjReEX7DJUUwY5DBsv9QurBkuuiluL6xGFE8b2607Lyig4J1XHDXVFLGjwLo5Vz4sCuKf105D%2BGIfGjzoviCD11ZWA3LVz7r%2FGNctn%2BycDqtczcwZqmsV7Zx8nSkm6A%2FzbyWnaOD3vwOI3GNZ9fsKCbpDXaBnnGO2dEcr%2BD6vPznh974RzOtBslNaFp9weqL7kFIGy1FNXdaO8De5NIptxBgYkJMZczNS%2FMdARzwRB%2BYr2NKLn5x26G8MJuoKlMNKDXhLqp1O08kCcLoQOGhpr5r4txqAce51aMI4Ie9baoxoheNmiAwVmwtZmXLLpXO8SE41RYkxqQbyDeSw%2FHYLbpCWubJCQ4%2BUIZ6cbwtWNeiWMgw9gPGAEaNxsf5Pe2Sq1dt7G7wJYrgCaadqvmSa0dFT05KikoOG51y6gQWoHJkaIB5MZLPoN28NRNaLpsaoySZEIZyc6iZPHewmdee5WsuQPWAIJqaWAdbkFNXQXTdPJTXSaSmcYXDTVSjFwsQVBfNAREqGcWVYCKE52NO0a3xX7Synu5fB0%2BU67HIbDr5%2FrRlFmy9vV5SwkPS%2ByEwGCAtXaPsOauDas0kxSW09yEKR%2BYBNL%2FVxtN8LaxrpcedNk7fgFMGJ4NPTMeJCGOGCAWifMkvGiSWGrF3I6PoB35In2wkYDE5Tk%2BzZayVFx5bIwIuHSCS6RNCYtwqgptI%2B8FYVHBlgxAbDj84RBMvalRcs5reDQl2%2BK6B9hDAk3jeCCC13TOjJD7LKER7BlR6BbUsyalMw%2F%2FzcLfOC42rRZonx%2FknkQUfaP40%2F9HKfXwGEGS0oswxjYT1mGHaXHtuOOTCOor39FZnG3vljQIGMBa1y4BMPTwsqcGOrEBCm3o77K8OFbC2uyL%2FA7nXXK0uCf18IZov4gc5Lk%2FXbjqIuo84BjZegrVfbVAV6%2BHkEGcqxiyCFmdzIpjk%2B5jcxTAVAaIntrDxdKk%2Fc0sezmpuguysFMJ7%2BV1Ha8sYwr5xqvG1shw0CD4E6n%2B7mAL8VByBWA2l7Hy4t3mOTezlz38WHo6dMunbo%2BqAuzOYEX%2BhATKFoH6klfpLKARHCYBNa0lxfZrtVPqp4ltkqAJ%2BjBR&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151648Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFGZUCYDFT%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=cc76938ef2e6382e3a71ed825d29f2c2a5b118c4cebd2ff0fb10861f9e09637b", "_id": "N8MA4zBO" }, { "label": "Curried Lentil Soup", "ingredientLines": ["3 tablespoons olive oil, divided", "1 medium onion, chopped", "1 medium carrot, finely chopped", "2 large garlic cloves, chopped, divided", "2 tablespoons (or more) curry powder", "1 cup French green lentils", "4 1/4 cups (or more) water, divided", "1 15- to 16-ounce can chickpeas (garbanzo beans), drained, rinsed", "1 tablespoon fresh lemon juice", "2 tablespoons (1/4 stick) butter", "2 green onions, thinly sliced 1 lemon, cut into 6 wedges", "Ingredient info: French green lentils are small, dark green, and speckled with black; they can be found at some supermarkets and at specialty foods stores."], "url": "https://www.epicurious.com/recipes/food/views/curried-lentil-soup-362489", "dietLabels": ["Balanced", "High-Fiber"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/a74/a7484f70acdf404c8a00367126b280e8.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCW3tbrg7%2F4WyaPpj8j35%2BaEE4W1mCenKm0qiZPRUUzNAIgBOHWLbCD42oqfPiEdWnq3Q%2FVYoW0qtOhWwCtqRWr6rQqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDLMQKa3U%2Bt9%2BCtGy5SqWBdHjkJEnGLH3YOYebjWJ7v2aM0BB82W7rFhHmdhZmR%2BYyTrufe5noNuXIGr3SbxbZ0emhVMngDaZXJsCasQ0EDEc%2B%2BYhNKFwDYd1t3GlnEAYJv7nw4%2Bf6eTXlKThcdSoIJR6dAKGspnJgdZSyI9AVY1oI1Qg1llZzkAa7YIm%2BIn13xJyb%2FC8fSTk73%2F%2BgvjyOWbtQwyPhm4w9ZdtHKcmk4bzpmJKxCBcYGIFSxGLseFAmIEjq2YPMP8nsEd1FjYc7YcoIAZhNeiDEfgpuQjj50LkF%2FEYGXZk%2FNm7Tt5Ig0nt98A8Y%2Fm%2B8u%2FLJeEJQnf4%2B7cCsjOCTyA6n5WMa2pjNt70AALWITnjs3tX4lha0wl%2Fi7oc4eKx5%2B0pUOhOzObrF6wrhGNUramn%2FiHg4pOX66c3lJWfl99KyRpsE5VzDGF30aNsG%2FGp1I836cGqkFeXzdp1hELYy3vYMwoQ82eTWE58DuFB%2B0bq%2BEDDY9FlFm%2Bbjn98IxzMKch0INduxwCSFoiNRp7BTLxs66Q%2F6p4Xdc6KvznsGhvy4wUWB1TeH1EaCHPEZgi%2FFRuxyIavRCKZwr21wUYykRqMgP%2F1oA3H84E%2BcoCaMMYCYSgMvBUolzMLmV%2F89kwr1gU7ZTuiYFITIjdD19OrcXSnkoMJ0r7hlOKPt8VKPn8qJkU769AEkqcdGu2FawQLTVFB%2BEkZiU5%2FmAOOCxEGNiG1O9GNGtoKJbkTq2%2BTc5cfa4Uu4DAl%2B0AbFK9SeL%2BvpHDLjJnC%2BiyEsuRJqU8F4RtOQfgL%2BkyvLggSkg%2BSkWF41X5utdS2XLV1GkJwgH14ssCdZjtXDV2FJpaR%2FqjHO7QsYUqq87w5ePiEu4QE4VAXza%2B8sLAGhzLQkCGgiZ9hMM7esqcGOrEBIltWaolKmfWtPxpuv90TkUS%2BLuavtHvf7b3Ksa5KvIBYmydjrX8bEAfSHGTzdcxGz4for1I3fs2kBINnnlyPPR1AL%2FX4Pj36Sb7w4mMSeK6mWhmtWBo9ACo5xvB8Zan8fQ0VtqpnVKYu6dVYoBsnpqom%2F2Ei4AxJl47bXzQcZFuI8WQnh8pJA9%2FmUpb5uoeamQ%2Fr8dyHPKDQ3p8PV66Z4NP3IrqDrmfuS8ZqjaCZfDuw&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151659Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLA72LTYB%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d066df68dd8f033efcbdde6ad90f5a366cc75810073a30aa1608ecf1a84f6de2", "_id": "8oObtz2I" }, { "label": "Guacamole", "ingredientLines": ["2 cloves garlic, peeled", "1 teaspoon kosher or sea salt", "3 medium ripe avocados (about 1 1/2 pounds, 700 g)", "Juice of one small lime", "One small chili, chopped (you can keep or remove the seeds, which add more heat)", "1/2 small red onion, peeled and finely diced", "Optional: 1 scant teaspoon olive oil", "Optional: a dash of chipotle or ancho chile powder"], "url": "http://www.davidlebovitz.com/guacamole-recipe/", "dietLabels": ["High-Fiber", "Low-Carb"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/1e4/1e4a97f58864228d0d11f18391c47df7.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDuJzUruc95MhE1D8KXNV8EjYT%2FCla8KHj1LFGRNWYAjwIgYE3pCJpKPKuzMSOyhwXYoTr%2F61VDUtB31rggaWrW64wqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDDXMQRWBTDjyE%2FKiuCqWBfnVKeZLN3gJ3HXqtY%2B4LWoQS%2BjReEX7DJUUwY5DBsv9QurBkuuiluL6xGFE8b2607Lyig4J1XHDXVFLGjwLo5Vz4sCuKf105D%2BGIfGjzoviCD11ZWA3LVz7r%2FGNctn%2BycDqtczcwZqmsV7Zx8nSkm6A%2FzbyWnaOD3vwOI3GNZ9fsKCbpDXaBnnGO2dEcr%2BD6vPznh974RzOtBslNaFp9weqL7kFIGy1FNXdaO8De5NIptxBgYkJMZczNS%2FMdARzwRB%2BYr2NKLn5x26G8MJuoKlMNKDXhLqp1O08kCcLoQOGhpr5r4txqAce51aMI4Ie9baoxoheNmiAwVmwtZmXLLpXO8SE41RYkxqQbyDeSw%2FHYLbpCWubJCQ4%2BUIZ6cbwtWNeiWMgw9gPGAEaNxsf5Pe2Sq1dt7G7wJYrgCaadqvmSa0dFT05KikoOG51y6gQWoHJkaIB5MZLPoN28NRNaLpsaoySZEIZyc6iZPHewmdee5WsuQPWAIJqaWAdbkFNXQXTdPJTXSaSmcYXDTVSjFwsQVBfNAREqGcWVYCKE52NO0a3xX7Synu5fB0%2BU67HIbDr5%2FrRlFmy9vV5SwkPS%2ByEwGCAtXaPsOauDas0kxSW09yEKR%2BYBNL%2FVxtN8LaxrpcedNk7fgFMGJ4NPTMeJCGOGCAWifMkvGiSWGrF3I6PoB35In2wkYDE5Tk%2BzZayVFx5bIwIuHSCS6RNCYtwqgptI%2B8FYVHBlgxAbDj84RBMvalRcs5reDQl2%2BK6B9hDAk3jeCCC13TOjJD7LKER7BlR6BbUsyalMw%2F%2FzcLfOC42rRZonx%2FknkQUfaP40%2F9HKfXwGEGS0oswxjYT1mGHaXHtuOOTCOor39FZnG3vljQIGMBa1y4BMPTwsqcGOrEBCm3o77K8OFbC2uyL%2FA7nXXK0uCf18IZov4gc5Lk%2FXbjqIuo84BjZegrVfbVAV6%2BHkEGcqxiyCFmdzIpjk%2B5jcxTAVAaIntrDxdKk%2Fc0sezmpuguysFMJ7%2BV1Ha8sYwr5xqvG1shw0CD4E6n%2B7mAL8VByBWA2l7Hy4t3mOTezlz38WHo6dMunbo%2BqAuzOYEX%2BhATKFoH6klfpLKARHCYBNa0lxfZrtVPqp4ltkqAJ%2BjBR&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151823Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFGZUCYDFT%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a91c74c390b9ef1e85e19eddb81551bc0f8bc3df1c9238331e6089a19b4a4825", "_id": "wPJ8RCXe" }, { "label": "Cashew-Date-Coconut Energy Bars", "ingredientLines": ["Nonstick cooking spray", "1 cup chopped roasted unsalted cashews", "1 1/2 cups crispy brown-rice cereal", "3/4 cup old-fashioned rolled oats", "2/3 cup chopped pitted dates", "2/3 cup sweetened flaked coconut", "3/4 cup cashew butter", "3 tablespoons unsalted butter", "1/4 cup honey", "1 1/2 ounces melted bittersweet chocolate"], "url": "https://www.marthastewart.com/1130154/cashew-date-coconut-energy-bars", "dietLabels": ["Low-Sodium"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/85e/85e974d433690ef1537d7b0d05cb7d0d.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCW3tbrg7%2F4WyaPpj8j35%2BaEE4W1mCenKm0qiZPRUUzNAIgBOHWLbCD42oqfPiEdWnq3Q%2FVYoW0qtOhWwCtqRWr6rQqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDLMQKa3U%2Bt9%2BCtGy5SqWBdHjkJEnGLH3YOYebjWJ7v2aM0BB82W7rFhHmdhZmR%2BYyTrufe5noNuXIGr3SbxbZ0emhVMngDaZXJsCasQ0EDEc%2B%2BYhNKFwDYd1t3GlnEAYJv7nw4%2Bf6eTXlKThcdSoIJR6dAKGspnJgdZSyI9AVY1oI1Qg1llZzkAa7YIm%2BIn13xJyb%2FC8fSTk73%2F%2BgvjyOWbtQwyPhm4w9ZdtHKcmk4bzpmJKxCBcYGIFSxGLseFAmIEjq2YPMP8nsEd1FjYc7YcoIAZhNeiDEfgpuQjj50LkF%2FEYGXZk%2FNm7Tt5Ig0nt98A8Y%2Fm%2B8u%2FLJeEJQnf4%2B7cCsjOCTyA6n5WMa2pjNt70AALWITnjs3tX4lha0wl%2Fi7oc4eKx5%2B0pUOhOzObrF6wrhGNUramn%2FiHg4pOX66c3lJWfl99KyRpsE5VzDGF30aNsG%2FGp1I836cGqkFeXzdp1hELYy3vYMwoQ82eTWE58DuFB%2B0bq%2BEDDY9FlFm%2Bbjn98IxzMKch0INduxwCSFoiNRp7BTLxs66Q%2F6p4Xdc6KvznsGhvy4wUWB1TeH1EaCHPEZgi%2FFRuxyIavRCKZwr21wUYykRqMgP%2F1oA3H84E%2BcoCaMMYCYSgMvBUolzMLmV%2F89kwr1gU7ZTuiYFITIjdD19OrcXSnkoMJ0r7hlOKPt8VKPn8qJkU769AEkqcdGu2FawQLTVFB%2BEkZiU5%2FmAOOCxEGNiG1O9GNGtoKJbkTq2%2BTc5cfa4Uu4DAl%2B0AbFK9SeL%2BvpHDLjJnC%2BiyEsuRJqU8F4RtOQfgL%2BkyvLggSkg%2BSkWF41X5utdS2XLV1GkJwgH14ssCdZjtXDV2FJpaR%2FqjHO7QsYUqq87w5ePiEu4QE4VAXza%2B8sLAGhzLQkCGgiZ9hMM7esqcGOrEBIltWaolKmfWtPxpuv90TkUS%2BLuavtHvf7b3Ksa5KvIBYmydjrX8bEAfSHGTzdcxGz4for1I3fs2kBINnnlyPPR1AL%2FX4Pj36Sb7w4mMSeK6mWhmtWBo9ACo5xvB8Zan8fQ0VtqpnVKYu6dVYoBsnpqom%2F2Ei4AxJl47bXzQcZFuI8WQnh8pJA9%2FmUpb5uoeamQ%2Fr8dyHPKDQ3p8PV66Z4NP3IrqDrmfuS8ZqjaCZfDuw&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151842Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLA72LTYB%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=18e4feb6ab1146e743b93f8f3431803da3fbe002c2cb0a8714a7bed52d63fcb0", "_id": "V67wz010" }, { "label": "Seitan Philly Cheese Steak Sandwiches", "ingredientLines": ["2 tablespoons olive oil, divided", "1 onion, cut into matchstick-size pieces", "1 green bell pepper, cut into matchstick-size pieces", "1 red bell pepper, cut into matchstick-size pieces", "1 (4 ounce) package mushrooms, sliced", "1 (10 ounce) package seitan, thinly sliced", "salt and ground black pepper to taste", "4 hoagie rolls, split lengthwise", "4 slices provolone cheese"], "url": "https://www.allrecipes.com/recipe/238551/seitan-philly-cheese-steak-sandwiches/", "dietLabels": [], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e1543c1284bf31ce23e37c4285edb3.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCW3tbrg7%2F4WyaPpj8j35%2BaEE4W1mCenKm0qiZPRUUzNAIgBOHWLbCD42oqfPiEdWnq3Q%2FVYoW0qtOhWwCtqRWr6rQqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDLMQKa3U%2Bt9%2BCtGy5SqWBdHjkJEnGLH3YOYebjWJ7v2aM0BB82W7rFhHmdhZmR%2BYyTrufe5noNuXIGr3SbxbZ0emhVMngDaZXJsCasQ0EDEc%2B%2BYhNKFwDYd1t3GlnEAYJv7nw4%2Bf6eTXlKThcdSoIJR6dAKGspnJgdZSyI9AVY1oI1Qg1llZzkAa7YIm%2BIn13xJyb%2FC8fSTk73%2F%2BgvjyOWbtQwyPhm4w9ZdtHKcmk4bzpmJKxCBcYGIFSxGLseFAmIEjq2YPMP8nsEd1FjYc7YcoIAZhNeiDEfgpuQjj50LkF%2FEYGXZk%2FNm7Tt5Ig0nt98A8Y%2Fm%2B8u%2FLJeEJQnf4%2B7cCsjOCTyA6n5WMa2pjNt70AALWITnjs3tX4lha0wl%2Fi7oc4eKx5%2B0pUOhOzObrF6wrhGNUramn%2FiHg4pOX66c3lJWfl99KyRpsE5VzDGF30aNsG%2FGp1I836cGqkFeXzdp1hELYy3vYMwoQ82eTWE58DuFB%2B0bq%2BEDDY9FlFm%2Bbjn98IxzMKch0INduxwCSFoiNRp7BTLxs66Q%2F6p4Xdc6KvznsGhvy4wUWB1TeH1EaCHPEZgi%2FFRuxyIavRCKZwr21wUYykRqMgP%2F1oA3H84E%2BcoCaMMYCYSgMvBUolzMLmV%2F89kwr1gU7ZTuiYFITIjdD19OrcXSnkoMJ0r7hlOKPt8VKPn8qJkU769AEkqcdGu2FawQLTVFB%2BEkZiU5%2FmAOOCxEGNiG1O9GNGtoKJbkTq2%2BTc5cfa4Uu4DAl%2B0AbFK9SeL%2BvpHDLjJnC%2BiyEsuRJqU8F4RtOQfgL%2BkyvLggSkg%2BSkWF41X5utdS2XLV1GkJwgH14ssCdZjtXDV2FJpaR%2FqjHO7QsYUqq87w5ePiEu4QE4VAXza%2B8sLAGhzLQkCGgiZ9hMM7esqcGOrEBIltWaolKmfWtPxpuv90TkUS%2BLuavtHvf7b3Ksa5KvIBYmydjrX8bEAfSHGTzdcxGz4for1I3fs2kBINnnlyPPR1AL%2FX4Pj36Sb7w4mMSeK6mWhmtWBo9ACo5xvB8Zan8fQ0VtqpnVKYu6dVYoBsnpqom%2F2Ei4AxJl47bXzQcZFuI8WQnh8pJA9%2FmUpb5uoeamQ%2Fr8dyHPKDQ3p8PV66Z4NP3IrqDrmfuS8ZqjaCZfDuw&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T151924Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLA72LTYB%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9e01ccf0ed4b2e613246a246e4a4683159db9356e751b9d5960b53fa6250d038", "_id": "Rqr1RVmP" }, { "label": "Hurricane cocktail", "ingredientLines": ["50ml dark rum", "50ml white rum", "1 passion fruit", "1 orange , juiced", "1 lemon , juiced", "50ml sugar syrup", "2 tsp grenadine", "4 cocktail cherries", "2 orange slices"], "url": "https://www.bbcgoodfood.com/recipes/hurricane-cocktail", "dietLabels": ["Low-Fat", "Low-Sodium"], "image": "https://edamam-product-images.s3.amazonaws.com/web-img/259/25924c8a37adf22f944acd5615645aaa.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCW3tbrg7%2F4WyaPpj8j35%2BaEE4W1mCenKm0qiZPRUUzNAIgBOHWLbCD42oqfPiEdWnq3Q%2FVYoW0qtOhWwCtqRWr6rQqwgUIkP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDLMQKa3U%2Bt9%2BCtGy5SqWBdHjkJEnGLH3YOYebjWJ7v2aM0BB82W7rFhHmdhZmR%2BYyTrufe5noNuXIGr3SbxbZ0emhVMngDaZXJsCasQ0EDEc%2B%2BYhNKFwDYd1t3GlnEAYJv7nw4%2Bf6eTXlKThcdSoIJR6dAKGspnJgdZSyI9AVY1oI1Qg1llZzkAa7YIm%2BIn13xJyb%2FC8fSTk73%2F%2BgvjyOWbtQwyPhm4w9ZdtHKcmk4bzpmJKxCBcYGIFSxGLseFAmIEjq2YPMP8nsEd1FjYc7YcoIAZhNeiDEfgpuQjj50LkF%2FEYGXZk%2FNm7Tt5Ig0nt98A8Y%2Fm%2B8u%2FLJeEJQnf4%2B7cCsjOCTyA6n5WMa2pjNt70AALWITnjs3tX4lha0wl%2Fi7oc4eKx5%2B0pUOhOzObrF6wrhGNUramn%2FiHg4pOX66c3lJWfl99KyRpsE5VzDGF30aNsG%2FGp1I836cGqkFeXzdp1hELYy3vYMwoQ82eTWE58DuFB%2B0bq%2BEDDY9FlFm%2Bbjn98IxzMKch0INduxwCSFoiNRp7BTLxs66Q%2F6p4Xdc6KvznsGhvy4wUWB1TeH1EaCHPEZgi%2FFRuxyIavRCKZwr21wUYykRqMgP%2F1oA3H84E%2BcoCaMMYCYSgMvBUolzMLmV%2F89kwr1gU7ZTuiYFITIjdD19OrcXSnkoMJ0r7hlOKPt8VKPn8qJkU769AEkqcdGu2FawQLTVFB%2BEkZiU5%2FmAOOCxEGNiG1O9GNGtoKJbkTq2%2BTc5cfa4Uu4DAl%2B0AbFK9SeL%2BvpHDLjJnC%2BiyEsuRJqU8F4RtOQfgL%2BkyvLggSkg%2BSkWF41X5utdS2XLV1GkJwgH14ssCdZjtXDV2FJpaR%2FqjHO7QsYUqq87w5ePiEu4QE4VAXza%2B8sLAGhzLQkCGgiZ9hMM7esqcGOrEBIltWaolKmfWtPxpuv90TkUS%2BLuavtHvf7b3Ksa5KvIBYmydjrX8bEAfSHGTzdcxGz4for1I3fs2kBINnnlyPPR1AL%2FX4Pj36Sb7w4mMSeK6mWhmtWBo9ACo5xvB8Zan8fQ0VtqpnVKYu6dVYoBsnpqom%2F2Ei4AxJl47bXzQcZFuI8WQnh8pJA9%2FmUpb5uoeamQ%2Fr8dyHPKDQ3p8PV66Z4NP3IrqDrmfuS8ZqjaCZfDuw&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230828T154804Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLA72LTYB%2F20230828%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b90e916a1a309fbde0f0e90aa5b9a58683a1a9bdc90e61cf38f1ac088b3c5ad5", "_id": "KI0J3Pgk" }]
        return recipes
    }


    private _handleError(err: HttpErrorResponse) {
        console.error('err:', err)
        return throwError(err)
    }
}

function _getRandomId(length = 8): string {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}
