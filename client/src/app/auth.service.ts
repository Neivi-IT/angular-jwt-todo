import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {
    }

    prelogin(username: string, password: string): Observable<string> {
        return this.http.post<{ challengeId: string }>('/api/auth', {username: username, password: password})
            .pipe(
                map(result => result.challengeId)
            );
    }

    login(challengeId: string, otpToken: string): Observable<boolean> {
        return this.http.put<{ token: string }>('/api/auth', {username: challengeId, password: otpToken})
            .pipe(
                map(result => {
                    localStorage.setItem('access_token', result.token);
                    return true;
                })
            );
    }

    logout() {
        localStorage.removeItem('access_token');
    }

    public get loggedIn(): boolean {
        return (localStorage.getItem('access_token') !== null);
    }
}
