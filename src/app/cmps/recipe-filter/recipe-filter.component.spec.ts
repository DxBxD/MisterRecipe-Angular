import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeFilterComponent } from './recipe-filter.component';

describe('RecipeFilterComponent', () => {
  let component: RecipeFilterComponent;
  let fixture: ComponentFixture<RecipeFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeFilterComponent]
    });
    fixture = TestBed.createComponent(RecipeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
