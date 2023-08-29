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
  showPopUpMessage: boolean = false
  loading: boolean = false

  constructor(private recipeService: RecipeService) { }

  ngOnInit(): void {
  }

  searchRecipes() {
    if (this.searchQuery.length) {
      this.loading = true
      this.recipeService.fetchRecipesFromAPI(this.searchQuery)
        .subscribe((response: any) => {
          this.recipes = response.hits
          this.loading = false
        })
    }
  }

  addRecipeToLocalStorage(hit: any) {
    if (hit && hit.recipe && hit.recipe.label) {
      this.recipeService.saveRecipeFromAPI(hit)

      this.showPopUpMessage = true
      setTimeout(() => {
        this.showPopUpMessage = false
      }, 2000)
    } else {
      console.error('Hit object is not initialized correctly', hit)
    }
  }

}
