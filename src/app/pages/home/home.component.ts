import { Component, OnInit } from '@angular/core'
import { UserService } from '../../../services/user.service'
import { RecipeService } from '../../../services/recipe.service'
import { User } from '../../../models/user.model'
import { Recipe } from '../../../models/recipe.model'
import { take } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  constructor(private recipeService: RecipeService) { }

  title = 'Mister Recipe'

  ngOnInit(): void {
    this.recipeService.query()
      .pipe(take(1))
      .subscribe({
        error: err => console.log('err:', err),
      })
  }

}