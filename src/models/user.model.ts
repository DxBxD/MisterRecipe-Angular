import { Recipe } from './recipe.model'

export interface User {
    name: string
    recipes: Recipe[]
}
