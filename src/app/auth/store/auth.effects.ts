import { Actions, ofType, Effect } from '@ngrx/effects';

import * as authActions from './auth.actions';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

const handleAuthentication = (
    expiresIn: number, 
    email: string, 
    userId: string, 
    token: string) => {
    const expirationDate = new Date(
        new Date().getTime() + expiresIn * 1000
        );
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new authActions.AuthenticateSuccess({
        email: email, 
        userId: userId, 
        token: token, 
        expirationDate: expirationDate,
        redirect: true
    });
}

const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return of(new authActions.AuthenticateFail(errorMessage))
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return of(new authActions.AuthenticateFail(errorMessage));
}

@Injectable()
export class AuthEffects {
    authSignup = this.actions$.pipe(
        ofType(authActions.SIGNUP_START),
        switchMap((signupAction: authActions.SignupStart) => {
            return this.http
            .post<AuthResponseData>(
              `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${environment.firebaseAPIKey}`,
              {
                email: signupAction.payload.email,
                password: signupAction.payload.password,
                returnSecureToken: true
              }
            ).pipe(
                map(resData => {
                    return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                 }),
                catchError(
                    errorRes => {
                       return handleError(errorRes)
                    })
                )
        })
    )
    @Effect()
    authLogin = this.actions$.pipe(
        ofType(authActions.LOGIN_START),
        switchMap((authData: authActions.LoginStart) => {
            return this.http
            .post<AuthResponseData>(
              `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.firebaseAPIKey}`,
              {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true
              }
            ).pipe(
                map(resData => {
                    return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                 }),
                catchError(
                    errorRes => {
                        return handleError(errorRes)
                     })
                )
        }),

    );

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(
        ofType(authActions.LOGOUT),
        tap(() => {
            localStorage.removeItem('userData');
        })
    )

    @Effect({dispatch: false})
    autoLogin = this.actions$.pipe(
        ofType(authActions.AUTO_LOGIN), 
        map(() => {
            const userData: {
                email: string,
                id: string,
                _token: string, 
                _tokenExpirationDate: string;
              } = JSON.parse(localStorage.getItem('userData'));
          
              if(!userData) {
                return {type: 'Dummy'}
              }
          
              const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
          
              if(loadedUser.token) {
                 return new authActions.AuthenticateSuccess(
                  {email: loadedUser.email, userId: loadedUser.id, token: loadedUser.token, expirationDate: new Date(userData._tokenExpirationDate), redirect: false})


/*                 const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.autoLogout(expirationDuration); */
              }

              return { type: 'Dummy'}
        })
    )
    
    @Effect({dispatch: false})
    authRedirect = this.actions$.pipe(ofType(authActions.AUTHENTICATE_SUCCESS, authActions.LOGOUT), tap(
        (authSuccessAction: authActions.AuthenticateSuccess) => {
            if(authSuccessAction.payload.redirect){
              this.router.navigate(['/']);
            } 
        }
    ))

    constructor(private actions$: Actions, private http: HttpClient, private router: Router) {}
}