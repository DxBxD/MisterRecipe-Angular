import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Recipe } from '../../../models/recipe.model'

@Component({
  selector: 'app-recipe-preview',
  templateUrl: './recipe-preview.component.html',
  styleUrls: ['./recipe-preview.component.scss']
})
export class RecipePreviewComponent {
  @Input() recipe!: Recipe
  @Output() remove = new EventEmitter<string>()

}
