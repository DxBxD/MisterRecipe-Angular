import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Recipe } from '../../../models/recipe.model'

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {

  @Input() recipes: Recipe[] | null = null
  @Output() remove = new EventEmitter<string>()


}
