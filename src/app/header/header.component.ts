import { Component, OnInit, OnDestroy } from '@angular/core';

import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import * as fromApp from '../store/app.reducer'
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(private authService: AuthService,
    private store: Store<fromApp.AppState>) {

  }

  ngOnInit() {
    this.userSub = this.store.select('auth').pipe(map(authState => {
      return authState.user
    })).subscribe(
      user => {
        this.isAuthenticated = !!user;
        console.log(!user);
        console.log(!!user);

      }
    )
  }

  onSaveData() {
    this.store.dispatch(new RecipeActions.StoreRecipes)
  }

  onFetchData() {
    this.store.dispatch(new RecipeActions.FetchRecipes())
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
    this.authService.logout();
  }
}
