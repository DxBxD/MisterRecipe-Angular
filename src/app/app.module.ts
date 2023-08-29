import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { HomeComponent } from './pages/home/home.component'
import { RecipeIndexComponent } from './pages/recipe-index/recipe-index.component'
import { RecipeListComponent } from './cmps/recipe-list/recipe-list.component'
import { RecipePreviewComponent } from './cmps/recipe-preview/recipe-preview.component'
import { RecipeFilterComponent } from './cmps/recipe-filter/recipe-filter.component'
import { HeaderComponent } from './cmps/header/header.component'
import { AddRecipeComponent } from './pages/add-recipe/add-recipe.component'
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecipeIndexComponent,
    RecipeListComponent,
    RecipePreviewComponent,
    RecipeFilterComponent,
    HeaderComponent,
    AddRecipeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }