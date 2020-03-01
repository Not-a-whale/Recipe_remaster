import { NgModule } from '@angular/core';
import { RecipeService } from './recipes/recipe.service';
import { AuthService } from './auth/auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth/auth-interceptor.service';

@NgModule({
    providers: [
        RecipeService, AuthService, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}
    ]
})

export class CoreModule {

}