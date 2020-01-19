import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string, 
    refreshToken: string,
    expiresIn: string,
    localId: string, 
    registered: boolean;
}

@Injectable({providedIn: 'root'})

export class AuthService {
    constructor (private http: HttpClient) {

    }

    signUp(email: string, password: string, ) {
       return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBmK5ImV6NfBzON_gj8wi-rq5Y8Vgl2c98', {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(
            errorRes => {
                let errorMessage = 'An unknown error occured!';
                if(!errorRes.error || !errorRes.error.error) {
                    return throwError(errorMessage);
                }
                switch (errorRes.error.error.message) {
                    case "EMAIL_EXISTS":
                        errorMessage = 'This email exists already';

                }
                return throwError(errorMessage);
            }
        ))
    }

    
    login(email: string, password: string) {
        this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBmK5ImV6NfBzON_gj8wi-rq5Y8Vgl2c98', {
            email: email,
            password: password,
            returnSecureToken: true
        });
    }
}