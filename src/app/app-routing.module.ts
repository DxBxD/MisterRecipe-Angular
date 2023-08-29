import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomeComponent } from './pages/home/home.component'
import { AddRecipeComponent } from './pages/add-recipe/add-recipe.component'
import { RecipeIndexComponent } from './pages/recipe-index/recipe-index.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-recipe', component: AddRecipeComponent },
  { path: 'recipe', component: RecipeIndexComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
