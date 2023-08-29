import { Component, OnDestroy, OnInit } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { Recipe } from '../../../models/recipe.model'
import { RecipeService } from '../../../services/recipe.service'

@Component({
  selector: 'app-recipe-index',
  templateUrl: './recipe-index.component.html',
  styleUrls: ['./recipe-index.component.scss']
})
export class RecipeIndexComponent implements OnInit, OnDestroy {

  constructor(private recipeService: RecipeService) { }
  subscription!: Subscription
  recipes$!: Observable<Recipe[]>

  ngOnInit(): void {
    this.recipes$ = this.recipeService.recipes$
  }

  onRemoveRecipe(recipeId: string) {
    this.recipeService.deleteRecipe(recipeId).subscribe({
      error: err => console.log('err:', err)
    })
  }

  ngOnDestroy(): void {
  }

}
