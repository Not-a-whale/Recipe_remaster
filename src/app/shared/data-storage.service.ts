import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, take, exhaustMap, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { Store } from '@ngrx/store';
import * as fromApp from  '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';


@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}

  fetchRecipes() {
    return this.http
      .get<Recipe[]>(
        'https://ng-course-recipe-book-1a2f5.firebaseio.com/recipes.json'
      )
      .pipe(
        map(recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => {
          this.store.dispatch(new RecipesActions.SetRecipes(recipes));
        })
      );
  }
  }
