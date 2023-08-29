import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeIndexComponent } from './recipe-index.component';

describe('RecipeIndexComponent', () => {
  let component: RecipeIndexComponent;
  let fixture: ComponentFixture<RecipeIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeIndexComponent]
    });
    fixture = TestBed.createComponent(RecipeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
