import { Component, OnInit } from '@angular/core'
import { RecipeService } from '../../../services/recipe.service'

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss']
})
export class AddRecipeComponent implements OnInit {

  searchQuery: string = ''
  recipes: any[] = []

  constructor(private recipeService: RecipeService) { }

  ngOnInit(): void {
  }

  searchRecipes() {
    this.recipeService.fetchRecipesFromAPI(this.searchQuery)
      .subscribe((response: any) => {
        this.recipes = response.hits
      })
  }

  addRecipeToLocalStorage(hit: any) {
    if (hit && hit.recipe && hit.recipe.label) {
      this.recipeService.saveRecipeFromAPI(hit)
    } else {
      console.error('Hit object is not initialized correctly', hit)
    }
  }

}
