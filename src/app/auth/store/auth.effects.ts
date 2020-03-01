import { Actions, ofType, Effect } from '@ngrx/effects';

import * as authActions from './auth.actions';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

@Injectable()
export class AuthEffects {
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
                    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
                    return of(new authActions.Login({email: resData.email, userId: resData.localId, token: resData.idToken, expirationDate: expirationDate}));
                 },
                catchError(
                    error => {
                        return of();
                    }
                )
                )
            )
        }),

    )

    constructor(private actions$: Actions, private http: HttpClient) {}
}