import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
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
import { PopUpMessageComponent } from './cmps/pop-up-message/pop-up-message.component'

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
    PopUpMessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }