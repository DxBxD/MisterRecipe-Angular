import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs'
import { FilterBy } from '../../../models/recipe.model'
import { RecipeService } from '../../../services/recipe.service'

@Component({
  selector: 'app-recipe-filter',
  templateUrl: './recipe-filter.component.html',
  styleUrls: ['./recipe-filter.component.scss']
})
export class RecipeFilterComponent implements OnInit, OnDestroy {

  constructor(private recipeService: RecipeService) { }

  filterBy!: FilterBy
  filterBySubject$ = new Subject()
  destroySubject$ = new Subject()

  ngOnInit(): void {
    this.recipeService.filterBy$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(filterBy => {
        this.filterBy = filterBy
      })

    this.filterBySubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroySubject$)
      )
      .subscribe(x => {
        console.log('x:', x)
        this.recipeService.setFilterBy(this.filterBy)
      })
  }

  onSetFilterBy(value: string) {
    this.filterBySubject$.next(value)
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(null)
    this.destroySubject$.unsubscribe()
  }

}
